import type { CollectionConfig } from "payload";
import { notifyAdminsOnReviewRequest, requireAdminToPublish } from "@/lib/editorial";
import { buildNewsletterArgs, renderNewsletterEmail } from "@/lib/newsletter-email";
import { SITE_URL } from "@/lib/site-url";
import { unsubscribeUrl } from "@/lib/unsubscribe";

/** How many individual emails to hand to SMTP at once. */
const SEND_CONCURRENCY = 8;

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
    defaultColumns: ["title", "writer", "date", "_status", "sentAt"],
    description:
      "Blogs are emailed to subscribers — they do not appear on the website. Staff drafts are emailed only after an Admin reviews and publishes them. Untick “Send to subscribers” to publish without emailing anyone. Use the Preview button to see the email before it goes out.",
    // "Preview" button in the edit view: opens the newsletter exactly as it
    // would be emailed, rendered from the latest saved draft. Available to
    // every signed-in user — Staff preview their drafts too.
    preview: (doc) =>
      doc?.id ? `${SITE_URL}/newsletter-preview/${doc.id}` : null,
    components: {
      edit: {
        // The default preview button is icon-only; this one says "Preview".
        PreviewButton: "/components/admin/PreviewLinkButton#PreviewLinkButton",
      },
    },
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true },
    {
      // Dropdown of team members. Supplies both the byline name and the
      // author photo shown in the newsletter email.
      name: "writer",
      label: "Author",
      type: "relationship",
      relationTo: "team-members",
      admin: {
        description:
          "Pick the author from the team members list (managed under Team Members).",
      },
    },
    {
      // Legacy free-text author from before the dropdown. Hidden from the
      // editor and the list-view column/filter pickers; kept so existing rows
      // keep their byline until a writer is set.
      name: "author",
      type: "text",
      admin: { hidden: true, disableListColumn: true, disableListFilter: true },
    },
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
          let recipients: { id: number | string; email: string }[] = [];
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
              recipients = docs
                .map((s) => ({ id: s.id, email: String(s.email ?? "").trim() }))
                .filter((s) => s.email);
            }
          } else {
            const { docs } = await payload.find({
              collection: "subscribers",
              limit: 1000,
              depth: 0,
            });
            recipients = docs
              .map((s) => ({ id: s.id, email: String(s.email ?? "").trim() }))
              .filter((s) => s.email);
          }
          if (!recipients.length) {
            payload.logger.warn(`blogs: "${doc.title}" published but no recipients matched`);
            return;
          }

          // One email per subscriber (not BCC) so each footer carries that
          // person's own unsubscribe link and one-click headers.
          const args = await buildNewsletterArgs(doc, payload);
          let failed = 0;
          for (let i = 0; i < recipients.length; i += SEND_CONCURRENCY) {
            await Promise.all(
              recipients.slice(i, i + SEND_CONCURRENCY).map(async (sub) => {
                const unsub = unsubscribeUrl(sub.id, sub.email);
                try {
                  await payload.sendEmail({
                    to: sub.email,
                    subject: doc.title,
                    html: renderNewsletterEmail({ ...args, unsubscribeUrl: unsub }),
                    headers: {
                      "List-Unsubscribe": `<${unsub}>`,
                      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    },
                  });
                } catch (err) {
                  failed += 1;
                  payload.logger.error(
                    { err },
                    `blogs: failed to email "${doc.title}" to ${sub.email}`,
                  );
                }
              }),
            );
          }
          if (failed > 0) {
            // sentAt stays empty so publishing again retries the whole list.
            payload.logger.error(
              `blogs: "${doc.title}" failed for ${failed}/${recipients.length} subscribers — publish again to retry`,
            );
            return;
          }
          payload.logger.info(`blogs: "${doc.title}" emailed to ${recipients.length} subscribers`);

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
