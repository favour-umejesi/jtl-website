import type { Payload } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

import { BRAND, emailMasthead, escapeHtml } from "./email-branding";
import { SITE_URL } from "./site-url";

const absolute = (url: string) =>
  url.startsWith("/") ? `${SITE_URL}${url}` : url;

export type NewsletterEmailArgs = {
  title: string;
  /** Byline name, e.g. "Olohi Momoh" */
  authorName?: string;
  /** Absolute URL to the author's head-shot */
  authorPhotoUrl?: string;
  /** Already formatted, e.g. "Jul 12, 2026" */
  dateText?: string;
  /** e.g. "3 min read" */
  readTime?: string;
  excerpt?: string;
  /** Absolute URL to the hero image */
  heroImageUrl?: string;
  /** Trusted HTML rendered from the rich-text content — not escaped here */
  contentHtml?: string;
  /** Per-recipient unsubscribe link (see src/lib/unsubscribe.ts) */
  unsubscribeUrl?: string;
};

/** Footer line with the one-click unsubscribe link. */
function unsubscribeFooterHtml(unsubscribeUrl?: string): string {
  // Admin previews have no specific recipient; "#" keeps the layout honest.
  const href = unsubscribeUrl || "#";
  return `Don&#39;t want these emails? <a href="${href}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a> &mdash; one click and you&#39;re off the list.`;
}

/**
 * Editable copy for the subscribe-confirmation email. These are the
 * defaultValues of the "Subscriber Welcome Email" global (see
 * src/globals/SubscribeEmail.ts) and the fallbacks when it is empty.
 */
export const SUBSCRIBE_EMAIL_DEFAULTS = {
  subject: "You're subscribed · Justice Through Literacy",
  heading: "You're on the list!",
  body:
    "Hi {name}, thank you for subscribing to Justice Through Literacy.\n\n" +
    "From now on you'll receive our email newsletters and occasional updates — stories from our literacy camps, scholarship news, and ways you can help children learn to read, write, and dream bigger.\n\n" +
    "We're glad you're here.",
} as const;

/**
 * Confirmation sent when someone joins the mailing list: affirms the signup
 * and says what to expect (newsletters and occasional updates). Same branding
 * as the newsletter itself. Heading and body are editable in the admin
 * ("Subscriber Welcome Email"); in the body, blank lines separate paragraphs
 * and {name} becomes the subscriber's first name.
 */
export function renderSubscribeConfirmationEmail({
  name,
  heading,
  body,
  unsubscribeUrl,
}: {
  name?: string;
  heading?: string;
  body?: string;
  /** Per-recipient unsubscribe link (see src/lib/unsubscribe.ts) */
  unsubscribeUrl?: string;
} = {}): string {
  const first = name?.trim() ? escapeHtml(name.trim().split(" ")[0]) : "there";
  const headingText =
    heading?.trim() || SUBSCRIBE_EMAIL_DEFAULTS.heading;
  const bodyText = body?.trim() || SUBSCRIBE_EMAIL_DEFAULTS.body;
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="font-family:${BRAND.serif};font-size:16px;line-height:1.75;margin:0 0 14px;">${escapeHtml(p)
          .replaceAll("{name}", first)
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  return `
  <div style="background:${BRAND.paper};padding:12px 0 32px;">
    <div style="max-width:600px;margin:0 auto;padding:0 20px;color:${BRAND.ink};">
      ${emailMasthead()}
      <p style="font-family:${BRAND.mono};font-size:12px;letter-spacing:.35em;text-transform:uppercase;text-align:center;color:${BRAND.purple};margin:0 0 14px;">Justice Through Literacy</p>
      <div style="border-top:3px solid ${BRAND.purple};border-bottom:1px solid ${BRAND.purple};height:3px;margin:0 0 26px;"></div>

      <h1 style="font-family:${BRAND.serif};font-size:28px;line-height:1.25;color:${BRAND.purple};margin:0 0 16px;">${escapeHtml(headingText)}</h1>
      ${paragraphs}

      <p style="font-family:${BRAND.mono};font-size:14px;text-align:center;letter-spacing:.2em;color:${BRAND.yellow};margin:28px 0;">&#10022; &#10022; &#10022;</p>
      <p style="text-align:center;margin:0 0 30px;">
        <a href="${SITE_URL}" style="font-family:${BRAND.mono};background:${BRAND.yellow};color:${BRAND.purple};padding:13px 28px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Visit our website</a>
      </p>

      <div style="border-top:1px solid ${BRAND.purple};border-bottom:3px solid ${BRAND.purple};height:3px;margin:0 0 14px;"></div>
      <p style="font-family:${BRAND.mono};font-size:12px;line-height:1.7;text-align:center;color:${BRAND.muted};margin:0;">
        Justice Through Literacy &mdash; literacy is not a privilege, it&#39;s a right.<br>
        ${unsubscribeFooterHtml(unsubscribeUrl)}
      </p>
    </div>
  </div>`;
}

/** The blog fields the newsletter needs — a doc from a hook or findByID. */
export type BlogLike = {
  title?: unknown;
  author?: unknown;
  writer?: { id?: number | string } | number | string | null;
  date?: unknown;
  readTime?: unknown;
  excerpt?: unknown;
  image?: { id?: number | string } | number | string | null;
  content?: unknown;
};

/**
 * Resolve a blog document into the arguments for `renderNewsletterEmail`.
 * Shared by the send hook in Blogs.ts and the admin preview route, so the
 * preview always matches the email that actually goes out.
 */
export async function buildNewsletterArgs(
  doc: BlogLike,
  payload: Payload,
): Promise<NewsletterEmailArgs> {
  let contentHtml = "";
  try {
    if (doc.content) {
      contentHtml = convertLexicalToHTML({
        data: doc.content as Parameters<typeof convertLexicalToHTML>[0]["data"],
      });
    }
  } catch (err) {
    payload.logger.error(
      { err },
      "newsletter: rich text -> HTML failed, sending excerpt only",
    );
  }

  let heroImageUrl = "";
  if (doc.image) {
    const id = typeof doc.image === "object" ? doc.image?.id : doc.image;
    if (id) {
      const media = await payload.findByID({
        collection: "media",
        id,
        depth: 0,
      });
      if (media?.url) heroImageUrl = absolute(String(media.url));
    }
  }

  // Byline from the "Author" dropdown (team member), falling back to the
  // legacy free-text author field on older blogs.
  let authorName = typeof doc.author === "string" ? doc.author : "";
  let authorPhotoUrl = "";
  const writerId =
    doc.writer && typeof doc.writer === "object" ? doc.writer.id : doc.writer;
  if (writerId) {
    try {
      const member = await payload.findByID({
        collection: "team-members",
        id: writerId,
        depth: 1,
      });
      if (member?.name) authorName = String(member.name);
      const photo = member?.photo;
      if (photo && typeof photo === "object" && photo.url) {
        authorPhotoUrl = absolute(String(photo.url));
      }
    } catch {
      // keep the legacy byline if the team member lookup fails
    }
  }

  return {
    title: String(doc.title ?? ""),
    authorName,
    authorPhotoUrl,
    dateText: doc.date
      ? new Date(doc.date as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    readTime: typeof doc.readTime === "string" ? doc.readTime : "",
    excerpt: typeof doc.excerpt === "string" ? doc.excerpt : "",
    heroImageUrl,
    contentHtml,
  };
}

/**
 * Newsletter-style HTML for the blog emails sent to subscribers: JTL logo
 * masthead over a newspaper double rule, typewriter (Courier) accents, Georgia
 * for the editorial text, and a byline with the author's photo. Everything is
 * inline-styled and uses system fonts so it renders in Gmail/Outlook/Apple
 * Mail; user-entered text is escaped by this function.
 */
export function renderNewsletterEmail(args: NewsletterEmailArgs): string {
  const {
    title,
    authorName,
    authorPhotoUrl,
    dateText,
    readTime,
    excerpt,
    heroImageUrl,
    contentHtml,
    unsubscribeUrl,
  } = args;

  const meta = [dateText, readTime].filter(Boolean).join(" · ");

  const byline =
    authorName || meta
      ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
        <tr>
          ${
            authorPhotoUrl
              ? `<td style="padding:0 12px 0 0;vertical-align:middle;">
            <img src="${authorPhotoUrl}" alt="${escapeHtml(authorName ?? "Author")}" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:50%;object-fit:cover;" />
          </td>`
              : ""
          }
          <td style="vertical-align:middle;">
            ${authorName ? `<p style="font-family:${BRAND.mono};font-size:14px;font-weight:bold;color:${BRAND.ink};margin:0;">${escapeHtml(authorName)}</p>` : ""}
            ${meta ? `<p style="font-family:${BRAND.mono};font-size:12px;color:${BRAND.muted};margin:2px 0 0;">${escapeHtml(meta)}</p>` : ""}
          </td>
        </tr>
      </table>`
      : "";

  return `
  <div style="background:${BRAND.paper};padding:12px 0 32px;">
    <div style="max-width:600px;margin:0 auto;padding:0 20px;color:${BRAND.ink};">
      ${emailMasthead()}
      <p style="font-family:${BRAND.mono};font-size:12px;letter-spacing:.35em;text-transform:uppercase;text-align:center;color:${BRAND.purple};margin:0 0 14px;">Justice Through Literacy</p>
      <div style="border-top:3px solid ${BRAND.purple};border-bottom:1px solid ${BRAND.purple};height:3px;margin:0 0 10px;"></div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 26px;">
        <tr>
          <td style="font-family:${BRAND.mono};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${BRAND.muted};">The JTL Newsletter</td>
          <td align="right" style="font-family:${BRAND.mono};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(dateText ?? "")}</td>
        </tr>
      </table>

      <h1 style="font-family:${BRAND.serif};font-size:30px;line-height:1.2;color:${BRAND.purple};margin:0 0 16px;">${escapeHtml(title)}</h1>
      ${byline}
      ${
        excerpt
          ? `<p style="font-family:${BRAND.serif};font-style:italic;font-size:17px;line-height:1.6;color:${BRAND.inkSoft};border-left:3px solid ${BRAND.yellow};padding-left:14px;margin:0 0 20px;">${escapeHtml(excerpt)}</p>`
          : ""
      }
      ${
        heroImageUrl
          ? `<img src="${heroImageUrl}" alt="${escapeHtml(title)}" width="560" style="display:block;width:100%;height:auto;border-radius:6px;margin:0 0 22px;" />`
          : ""
      }
      <div style="font-family:${BRAND.serif};font-size:16px;line-height:1.75;color:${BRAND.ink};">${contentHtml ?? ""}</div>

      <p style="font-family:${BRAND.mono};font-size:14px;text-align:center;letter-spacing:.2em;color:${BRAND.yellow};margin:28px 0;">&#10022; &#10022; &#10022;</p>
      <p style="text-align:center;margin:0 0 30px;">
        <a href="${SITE_URL}" style="font-family:${BRAND.mono};background:${BRAND.yellow};color:${BRAND.purple};padding:13px 28px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Visit our website</a>
      </p>

      <div style="border-top:1px solid ${BRAND.purple};border-bottom:3px solid ${BRAND.purple};height:3px;margin:0 0 14px;"></div>
      <p style="font-family:${BRAND.mono};font-size:12px;line-height:1.7;text-align:center;color:${BRAND.muted};margin:0;">
        Justice Through Literacy &mdash; literacy is not a privilege, it&#39;s a right.<br>
        You&#39;re receiving this because you subscribed to updates from JTL.<br>
        ${unsubscribeFooterHtml(unsubscribeUrl)}
      </p>
    </div>
  </div>`;
}
