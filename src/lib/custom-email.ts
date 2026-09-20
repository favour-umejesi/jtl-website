import type { Payload } from "payload";

import { BRAND, emailMasthead, escapeHtml } from "./email-branding";
import { richTextToEmailHtml } from "./email-rich-text";
import { unsubscribeFooterHtml } from "./newsletter-email";

/** Pre-filled value of the required "Greeting" field (see Emails.ts). */
export const DEFAULT_GREETING = "Dear {name},";

/** What {name} becomes for subscribers without a name on file. */
export const NAME_FALLBACK = "Friend";

/** The fields a custom email needs — a doc from a hook or findByID. */
export type CustomEmailLike = {
  subject?: unknown;
  heading?: unknown;
  greeting?: unknown;
  content?: unknown;
};

export type CustomEmailArgs = {
  heading?: string;
  /** Opening line containing the {name} placeholder, e.g. "Dear {name}," */
  greeting: string;
  /** Trusted HTML rendered from the rich-text content — not escaped here */
  contentHtml: string;
};

/**
 * Resolve a custom email document into the arguments for
 * `renderCustomEmail`. Shared by the send hook in Emails.ts and the admin
 * preview route, so the preview always matches the email that goes out.
 */
export async function buildCustomEmailArgs(
  doc: CustomEmailLike,
  payload: Payload,
): Promise<CustomEmailArgs> {
  let contentHtml = "";
  try {
    contentHtml = await richTextToEmailHtml(doc.content, payload);
  } catch (err) {
    payload.logger.error({ err }, "custom email: rich text -> HTML failed");
  }
  return {
    heading: typeof doc.heading === "string" ? doc.heading.trim() : "",
    greeting:
      (typeof doc.greeting === "string" && doc.greeting.trim()) || DEFAULT_GREETING,
    contentHtml,
  };
}

/**
 * A plain branded letter for one-off messages to subscribers: JTL masthead,
 * optional headline, the greeting, the message, and the unsubscribe footer —
 * none of the newsletter's byline, hero image or "The JTL Newsletter" banner.
 * {name} in the greeting (or anywhere else) becomes the recipient's first
 * name, or NAME_FALLBACK when we have no name for them.
 */
export function renderCustomEmail({
  heading,
  greeting,
  contentHtml,
  name,
  unsubscribeUrl,
}: CustomEmailArgs & {
  /** Recipient's name, for {name}. */
  name?: string;
  /** Per-recipient unsubscribe link (see src/lib/unsubscribe.ts) */
  unsubscribeUrl?: string;
}): string {
  const first = name?.trim()
    ? escapeHtml(name.trim().split(" ")[0])
    : NAME_FALLBACK;
  return `
  <div style="background:${BRAND.paper};padding:12px 0 32px;">
    <div style="max-width:600px;margin:0 auto;padding:0 20px;color:${BRAND.ink};">
      ${emailMasthead()}
      <p style="font-family:${BRAND.mono};font-size:12px;letter-spacing:.35em;text-transform:uppercase;text-align:center;color:${BRAND.purple};margin:0 0 14px;">Justice Through Literacy</p>
      <div style="border-top:3px solid ${BRAND.purple};border-bottom:1px solid ${BRAND.purple};height:3px;margin:0 0 26px;"></div>

      ${
        heading
          ? `<h1 style="font-family:${BRAND.serif};font-size:28px;line-height:1.25;color:${BRAND.purple};margin:0 0 16px;">${escapeHtml(heading).replaceAll("{name}", first)}</h1>`
          : ""
      }
      <p style="font-family:${BRAND.serif};font-size:16px;line-height:1.75;color:${BRAND.ink};margin:0 0 14px;">${escapeHtml(greeting).replaceAll("{name}", first)}</p>
      <div style="font-family:${BRAND.serif};font-size:16px;line-height:1.75;color:${BRAND.ink};">${contentHtml.replaceAll("{name}", first)}</div>

      <div style="border-top:1px solid ${BRAND.purple};border-bottom:3px solid ${BRAND.purple};height:3px;margin:30px 0 14px;"></div>
      <p style="font-family:${BRAND.mono};font-size:12px;line-height:1.7;text-align:center;color:${BRAND.muted};margin:0;">
        Justice Through Literacy &mdash; literacy is not a privilege, it&#39;s a right.<br>
        You&#39;re receiving this because you subscribed to updates from JTL.<br>
        ${unsubscribeFooterHtml(unsubscribeUrl)}
      </p>
    </div>
  </div>`;
}
