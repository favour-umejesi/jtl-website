import { after } from "next/server";
import type {
  Access,
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Field,
  Payload,
  PayloadRequest,
} from "payload";
import {
  resolveRecipients,
  sendToSubscribers,
  type AudienceDoc,
  type Recipient,
} from "./subscriber-mailer";

/**
 * "Emailed once, then locked" — shared by Newsletters (Blogs.ts) and Custom
 * Emails (Emails.ts).
 *
 * Publishing claims the send by stamping `sentAt` in the same save that
 * publishes the document, and the emails go out only after that save has been
 * committed. From then on the document is locked (`lockedOnceSent`): it can
 * be trashed or duplicated, but not edited or published again — to send a
 * follow-up, Duplicate it, which makes an unsent draft copy.
 *
 * Why the claim comes first: afterChange hooks run inside the publish's
 * database transaction. Sending from there and stamping `sentAt` afterwards
 * once left a newsletter emailed but rolled back to an unsent draft, so the
 * next publish emailed everyone again. Never send before the claim is saved.
 */

type SendableDoc = AudienceDoc & {
  id: number | string;
  _status?: string | null;
  sentAt?: string | null;
  deletedAt?: string | null;
};

type Render = (recipient: Recipient, unsubscribeUrl: string) => string;

type SendOnceConfig = {
  slug: CollectionSlug;
  /** Whether publishing this document should email it at all. Default: always. */
  shouldSend?: (doc: Record<string, unknown>) => boolean;
  subject: (doc: Record<string, unknown>) => string;
  /** Builds the per-recipient renderer once per send. */
  prepare: (doc: Record<string, unknown>, payload: Payload) => Promise<Render>;
  /** What the status note tells editors to do again, e.g. "Publish". */
  retryVerb: string;
};

/**
 * Update access: signed-in users may edit until the email has gone out.
 * Trashing and restoring stay allowed, so a sent email can still be deleted.
 * Those arrive as updates of `deletedAt` alone (plus `_status` on restore) —
 * unlike the admin's permission check, which passes the whole document.
 * Bulk updates (list-view delete, Restore) don't pass `data`, so fall back
 * to the request body.
 */
export const lockedOnceSent: Access = ({ req, data }) => {
  if (!req.user) return false;
  const keys = Object.keys(data ?? req.data ?? {});
  const isTrashOrRestore =
    keys.includes("deletedAt") && keys.every((k) => k === "deletedAt" || k === "_status");
  if (isTrashOrRestore) return true;
  return { sentAt: { exists: false } };
};

// Only the hooks below write these; the Local API calls they make skip field
// access, everything else (the admin, the REST API) is refused. A duplicate
// is a new email that has not gone out yet, so it starts blank.
const systemOnly = {
  access: { create: () => false, update: () => false },
  hooks: { beforeDuplicate: [() => null] },
};

/** `sentAt`, `sentCount` and `sendReport` — add to the collection's fields. */
export const sendStatusFields: Field[] = [
  {
    name: "sentAt",
    type: "date",
    ...systemOnly,
    admin: {
      position: "sidebar",
      readOnly: true,
      description: "Filled in automatically when the email goes out.",
      date: { displayFormat: "MMM d, yyyy h:mm a" },
    },
  },
  {
    name: "sentCount",
    label: "Sent to",
    type: "number",
    ...systemOnly,
    admin: {
      position: "sidebar",
      readOnly: true,
      description: "Number of subscribers emailed.",
    },
  },
  {
    name: "sendReport",
    label: "Sending problems",
    type: "textarea",
    ...systemOnly,
    admin: {
      position: "sidebar",
      readOnly: true,
      condition: (data) => Boolean(data?.sendReport),
    },
  },
];

export function sendOnce(config: SendOnceConfig): {
  beforeChange: CollectionBeforeChangeHook;
  afterChange: CollectionAfterChangeHook;
} {
  const { slug, retryVerb } = config;

  /**
   * Nobody received anything: hand the claim back and return the document to
   * draft, so the list shows it as unsent and it can be sent again.
   */
  const release = async (
    payload: Payload,
    id: number | string,
    sendReport: string,
    req?: PayloadRequest,
  ) => {
    await payload.update({
      collection: slug,
      id,
      data: { sentAt: null, sentCount: null, sendReport, _status: "draft" },
      req,
    });
  };

  /**
   * `req` is only passed when running inside the publish's own transaction
   * (see afterChange); the follow-up writes must then join that transaction,
   * because the document's row is locked by it until it commits.
   */
  const deliver = async (
    payload: Payload,
    id: number | string,
    claimedAt: string,
    req?: PayloadRequest,
  ) => {
    let logLabel = `${slug}: #${id}`;
    try {
      // Send what was actually saved — and only if the claim was. When the
      // publish failed and rolled back there is no claim, so nothing goes out.
      const doc = (await payload.findByID({
        collection: slug,
        id,
        depth: 0,
        req,
      })) as unknown as SendableDoc & Record<string, unknown>;
      const subject = config.subject(doc);
      logLabel = `${slug}: "${subject}"`;
      if (
        doc._status !== "published" ||
        !doc.sentAt ||
        new Date(doc.sentAt).getTime() !== new Date(claimedAt).getTime()
      ) {
        payload.logger.warn(`${logLabel} publish was not saved — not emailed`);
        return;
      }

      const recipients = await resolveRecipients(doc, payload);
      if (!recipients.length) {
        payload.logger.warn(`${logLabel} published but no recipients matched`);
        await release(
          payload,
          id,
          `Not sent. There were no subscribers to send it to.`,
          req,
        );
        return;
      }

      const render = await config.prepare(doc, payload);
      const failed = await sendToSubscribers({
        payload,
        recipients,
        subject,
        render,
        logLabel,
      });

      if (failed.length === recipients.length) {
        payload.logger.error(`${logLabel} failed for all ${failed.length} subscribers`);
        await release(
          payload,
          id,
          `Not sent. Nobody received it. Click ${retryVerb} to try again.`,
          req,
        );
        return;
      }

      // Some or all went out, so the claim stands: sending the whole list
      // again would email the people who already have it. Failed addresses
      // are listed so a duplicate can go to just them.
      const sent = recipients.length - failed.length;
      payload.logger.info(`${logLabel} emailed to ${sent}/${recipients.length} subscribers`);
      await payload.update({
        collection: slug,
        id,
        data: {
          sentCount: sent,
          sendReport: failed.length
            ? `Not delivered to ${failed.length} of ${recipients.length} subscribers:\n${failed.join("\n")}\n\nTo retry, click Duplicate and send the copy to only these subscribers.`
            : null,
        },
        req,
      });
    } catch (err) {
      // Reached only before the first email or after the last (the send loop
      // itself never throws), and the claim stays either way: a document
      // wrongly left as "sent" is recoverable with Duplicate, a second
      // mailing to the whole list is not.
      payload.logger.error({ err }, `${logLabel} sending did not complete cleanly`);
    }
  };

  return {
    // Must run after requireAdminToPublish, which may turn the save into a draft.
    beforeChange: ({ data, originalDoc, context }) => {
      // Moving a document to the trash or restoring it must never send it.
      if (data?.deletedAt || originalDoc?.deletedAt) return data;
      if (data?._status !== "published") return data;
      if (originalDoc?.sentAt || data.sentAt) return data;
      if (config.shouldSend && !config.shouldSend({ ...originalDoc, ...data })) return data;

      data.sentAt = new Date().toISOString();
      data.sendReport = null;
      context.sendClaimedAt = data.sentAt;
      return data;
    },

    afterChange: async ({ doc, req, context }) => {
      if (typeof context.sendClaimedAt !== "string") return;
      // One claim, one send — the updates `deliver` makes re-enter this hook.
      const claimedAt = context.sendClaimedAt;
      delete context.sendClaimedAt;

      const { payload } = req;
      try {
        // After the response means after the publish has committed. It also
        // keeps a long mailing from holding the transaction (and the editor's
        // Publish button) open until the function times out.
        after(() => deliver(payload, doc.id, claimedAt));
      } catch {
        // Not inside a Next.js request (a script using the Local API): send
        // now, inside the caller's transaction.
        await deliver(payload, doc.id, claimedAt, req);
      }
    },
  };
}
