import type { CollectionConfig } from "payload";
import {
  holdStaffPublishForReview,
  notifyAdminsOnReviewRequest,
  requireAdminToPublish,
} from "@/lib/editorial";
import { buildNewsletterArgs, renderNewsletterEmail } from "@/lib/newsletter-email";
import { MAILING_LIST_GROUP } from "@/lib/admin-groups";
import { lockedOnceSent, sendOnce, sendStatusFields } from "@/lib/send-once";
import { SITE_URL } from "@/lib/site-url";
import { stageFields } from "@/lib/stage";
import { rowActionsField, trashForAllDeleteForAdmins } from "@/lib/trash";

// Emails a published newsletter to the mailing list, once (see send-once.ts).
const newsletterSend = sendOnce({
  slug: "blogs",
  shouldSend: (doc) => Boolean(doc.sendToSubscribers),
  subject: (doc) => String(doc.title ?? ""),
  prepare: async (doc, payload) => {
    const args = await buildNewsletterArgs(doc, payload);
    return (_sub, unsub) => renderNewsletterEmail({ ...args, unsubscribeUrl: unsub });
  },
  retryVerb: "Publish",
});

/**
 * Blogs are email newsletters, not web pages: they never appear on the
 * public site, and the admin panel labels them "Newsletters (Blog)" (the
 * "blogs" slug stays so the database tables keep their names). Publishing a
 * blog with "Send to subscribers" ticked emails it
 * (once) to the mailing list — either everyone or a hand-picked set of
 * subscribers — and locks it: a sent newsletter can no longer be edited or
 * published again, only duplicated into a new unsent draft (see
 * src/lib/send-once.ts). Staff publish attempts become drafts and notify the
 * Admins for review (see src/lib/editorial.ts), so nothing is emailed until
 * an Admin publishes it.
 */
export const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: { singular: "Newsletter", plural: "Newsletters (Blog)" },
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  // Editable until it has been emailed, then locked.
  access: { delete: trashForAllDeleteForAdmins, update: lockedOnceSent },
  admin: {
    group: MAILING_LIST_GROUP,
    useAsTitle: "title",
    defaultColumns: ["title", "writer", "date", "stage", "sentAt", "sentCount", "rowActions"],
    description:
      "Stories emailed to subscribers. They do not appear on the website. Publishing sends the email once, then the newsletter is locked. To send a new version, open it and click Duplicate.",
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
          "Choose from Team Members.",
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
    { name: "date", type: "date", defaultValue: () => new Date().toISOString() },
    { name: "readTime", label: "Reading time", type: "text", admin: { description: "Example: 3 min read" } },
    {
      name: "excerpt",
      label: "Introduction",
      type: "textarea",
      admin: { description: "Short intro at the top of the email." },
    },
    {
      name: "image",
      label: "Main image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Large image near the top of the email." },
    },
    { name: "content", type: "richText" },
    {
      name: "sendToSubscribers",
      type: "checkbox",
      label: "Send to subscribers",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Untick to publish without emailing anyone.",
      },
    },
    {
      name: "sendTo",
      label: "Send to",
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
        description: "Choose who receives it.",
      },
    },
    rowActionsField,
    ...stageFields,
    ...sendStatusFields,
  ],
  hooks: {
    beforeOperation: [holdStaffPublishForReview],
    beforeChange: [requireAdminToPublish, newsletterSend.beforeChange],
    afterChange: [
      notifyAdminsOnReviewRequest({
        slug: "blogs",
        label: "newsletter",
        onPublish:
          "Publishing it will email it to the mailing list (unless “Send to subscribers” is unticked).",
      }),
      newsletterSend.afterChange,
    ],
  },
};
