import type { CollectionConfig } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { notifyAdminsOnReviewRequest, requireAdminToPublish } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site-url";

const absolute = (url: string) =>
  url.startsWith("/") ? `${SITE_URL}${url}` : url;

/** Gmail caps recipients per message; send BCC batches well under the limit. */
const BCC_BATCH = 80;

/**
 * Blogs are email newsletters, not web pages: they never appear on the
 * public site. Publishing a blog with "Send to subscribers" ticked emails it
 * (once) to the mailing list — either everyone or a hand-picked set of
 * subscribers. Staff publish attempts become drafts and notify the Admins
 * for review (see src/lib/editorial.ts), so nothing is emailed until an
 * Admin publishes it.
 */
export const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: { singular: "Blog", plural: "Blogs" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "date", "_status", "sentAt"],
    description:
      "Blogs are emailed to subscribers — they do not appear on the website. Staff drafts are emailed only after an Admin reviews and publishes them. Untick “Send to subscribers” to publish without emailing anyone.",
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "author", type: "text" },
    { name: "date", type: "date" },
    { name: "readTime", type: "text", admin: { description: 'e.g. "3 min read"' } },
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "Short intro shown at the top of the email." },
    },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "content", type: "richText" },
    {
      name: "sendToSubscribers",
      type: "checkbox",
      label: "Send to subscribers",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Email this blog to the mailing list when it is published. A blog is only ever emailed once.",
      },
    },
    {
      name: "sendTo",
      type: "radio",
      defaultValue: "all",
      options: [
        { label: "All subscribers", value: "all" },
        { label: "Only selected subscribers", value: "selected" },
      ],
      admin: {
        position: "sidebar",
        condition: (data) => Boolean(data?.sendToSubscribers),
      },
    },
    {
      name: "selectedSubscribers",
      type: "relationship",
      relationTo: "subscribers",
      hasMany: true,
      admin: {
        position: "sidebar",
        condition: (data) =>
          Boolean(data?.sendToSubscribers && data?.sendTo === "selected"),
        description: "Pick who receives this blog.",
      },
    },
    {
      name: "sentAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically when the email goes out.",
        date: { displayFormat: "MMM d, yyyy h:mm a" },
      },
    },
  ],
  hooks: {
    beforeChange: [requireAdminToPublish],
    afterChange: [
      notifyAdminsOnReviewRequest({
        slug: "blogs",
        label: "blog",
        onPublish:
          "Publishing it will email it to the mailing list (unless “Send to subscribers” is unticked).",
      }),
      async ({ doc, req, context }) => {
        // The sentAt update below re-enters this hook; the flag breaks the loop.
        if (context.skipBlogEmail) return;
        // Only a published blog is emailed — drafts awaiting review never send.
        if (doc._status !== "published") return;
        if (!doc.sendToSubscribers || doc.sentAt) return;

        const { payload } = req;
        try {
          let emails: string[] = [];
          if (doc.sendTo === "selected") {
            const ids = (doc.selectedSubscribers ?? []).map(
              (s: { id?: number | string } | number | string) =>
                typeof s === "object" ? s.id : s,
            );
            if (ids.length) {
              const { docs } = await payload.find({
                collection: "subscribers",
                where: { id: { in: ids } },
                limit: 1000,
                depth: 0,
              });
              emails = docs.map((s) => String(s.email ?? "").trim()).filter(Boolean);
            }
          } else {
            const { docs } = await payload.find({
              collection: "subscribers",
              limit: 1000,
              depth: 0,
            });
            emails = docs.map((s) => String(s.email ?? "").trim()).filter(Boolean);
          }
          if (!emails.length) {
            payload.logger.warn(`blogs: "${doc.title}" published but no recipients matched`);
            return;
          }

          let contentHtml = "";
          try {
            if (doc.content) contentHtml = convertLexicalToHTML({ data: doc.content });
          } catch (err) {
            payload.logger.error({ err }, "blogs: rich text -> HTML failed, sending excerpt only");
          }

          let imageHtml = "";
          if (doc.image) {
            const id = typeof doc.image === "object" ? doc.image.id : doc.image;
            const media = await payload.findByID({ collection: "media", id, depth: 0 });
            if (media?.url) {
              imageHtml = `<img src="${absolute(String(media.url))}" alt="${doc.title}" style="width:100%;border-radius:6px;margin:16px 0;" />`;
            }
          }

          const dateLine = [doc.author, doc.date && new Date(doc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), doc.readTime]
            .filter(Boolean)
            .join(" · ");

          const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:8px;color:#1a1a1a;">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#d7ad0d;font-weight:bold;margin:0 0 8px;">Justice Through Literacy</p>
    <h1 style="color:#310061;font-size:24px;margin:0 0 6px;">${doc.title}</h1>
    ${dateLine ? `<p style="font-size:13px;color:#666;margin:0 0 12px;">${dateLine}</p>` : ""}
    ${doc.excerpt ? `<p style="font-size:15px;line-height:1.6;font-style:italic;color:#444;">${doc.excerpt}</p>` : ""}
    ${imageHtml}
    <div style="font-size:15px;line-height:1.7;">${contentHtml}</div>
    <p style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}" style="background:#d7ad0d;color:#310061;padding:12px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Visit our website</a>
    </p>
    <p style="font-size:12px;color:#999;line-height:1.5;margin-top:24px;">You're receiving this because you subscribed to updates from Justice Through Literacy.<br>To unsubscribe, reply to this email with "unsubscribe".</p>
  </div>`;

          for (let i = 0; i < emails.length; i += BCC_BATCH) {
            await payload.sendEmail({
              to: process.env.EMAIL_FROM || process.env.SMTP_USER,
              bcc: emails.slice(i, i + BCC_BATCH),
              subject: doc.title,
              html,
            });
          }
          payload.logger.info(`blogs: "${doc.title}" emailed to ${emails.length} subscribers`);

          await payload.update({
            collection: "blogs",
            id: doc.id,
            data: { sentAt: new Date().toISOString() },
            context: { skipBlogEmail: true },
          });
        } catch (err) {
          // sentAt stays empty on failure, so publishing again retries the send.
          payload.logger.error({ err }, `blogs: failed to email "${doc.title}" to subscribers`);
        }
      },
    ],
  },
};
