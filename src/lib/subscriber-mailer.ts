import type { Payload } from "payload";
import { unsubscribeUrl } from "./unsubscribe";

/**
 * Bulk sending to the mailing list, shared by Newsletters (Blogs.ts) and
 * Custom Emails (Emails.ts). Both collections carry the same audience fields
 * — `sendTo` ("all" | "selected") and `selectedSubscribers` — so picking the
 * recipients and looping over them lives here once.
 */

/** How many individual emails to hand to SMTP at once. */
const SEND_CONCURRENCY = 8;

export type Recipient = { id: number | string; email: string; name?: string };

/** The audience fields a sendable document carries. */
export type AudienceDoc = {
  sendTo?: unknown;
  selectedSubscribers?:
    | ({ id?: number | string } | number | string)[]
    | null;
};

/** Everyone on the list, or only the hand-picked subscribers. */
export async function resolveRecipients(
  doc: AudienceDoc,
  payload: Payload,
): Promise<Recipient[]> {
  let where = undefined;
  if (doc.sendTo === "selected") {
    const ids = (doc.selectedSubscribers ?? [])
      .map((s) => (typeof s === "object" ? s.id : s))
      .filter((id): id is number | string => id != null);
    if (!ids.length) return [];
    where = { id: { in: ids } };
  }
  const { docs } = await payload.find({
    collection: "subscribers",
    where,
    pagination: false,
    depth: 0,
  });
  return docs
    .map((s) => ({
      id: s.id,
      email: String(s.email ?? "").trim(),
      name: typeof s.name === "string" ? s.name : undefined,
    }))
    .filter((s) => s.email);
}

/**
 * One email per subscriber (not BCC) so each footer carries that person's own
 * unsubscribe link and one-click headers. `render` builds the HTML for one
 * recipient. Returns how many sends failed; failures are logged, not thrown.
 */
export async function sendToSubscribers({
  payload,
  recipients,
  subject,
  render,
  logLabel,
}: {
  payload: Payload;
  recipients: Recipient[];
  subject: string;
  render: (recipient: Recipient, unsubscribeUrl: string) => string;
  /** Prefix for log lines, e.g. `blogs: "Title"` */
  logLabel: string;
}): Promise<number> {
  let failed = 0;
  for (let i = 0; i < recipients.length; i += SEND_CONCURRENCY) {
    await Promise.all(
      recipients.slice(i, i + SEND_CONCURRENCY).map(async (sub) => {
        const unsub = unsubscribeUrl(sub.id, sub.email);
        try {
          await payload.sendEmail({
            to: sub.email,
            subject,
            html: render(sub, unsub),
            headers: {
              "List-Unsubscribe": `<${unsub}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
        } catch (err) {
          failed += 1;
          payload.logger.error({ err }, `${logLabel} failed to send to ${sub.email}`);
        }
      }),
    );
  }
  return failed;
}
