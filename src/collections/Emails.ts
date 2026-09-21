import type { CollectionConfig } from "payload";
import { MAILING_LIST_GROUP } from "@/lib/admin-groups";
import {
  buildCustomEmailArgs,
  DEFAULT_GREETING,
  NAME_FALLBACK,
  renderCustomEmail,
} from "@/lib/custom-email";
import {
  holdStaffPublishForReview,
  notifyAdminsOnReviewRequest,
  requireAdminToPublish,
} from "@/lib/editorial";
import { lockedOnceSent, sendOnce, sendStatusFields } from "@/lib/send-once";
import { SITE_URL } from "@/lib/site-url";
import { stageFields } from "@/lib/stage";
import { rowActionsField, trashForAllDeleteForAdmins } from "@/lib/trash";

// "Send email" (publish) emails it to the chosen subscribers, once (see send-once.ts).
const customEmailSend = sendOnce({
  slug: "emails",
  subject: (doc) => String(doc.subject ?? ""),
  prepare: async (doc, payload) => {
    const args = await buildCustomEmailArgs(doc, payload);
    return (sub, unsub) =>
      renderCustomEmail({ ...args, name: sub.name, unsubscribeUrl: unsub });
  },
  retryVerb: "Send email",
});

/**
 * Custom emails: one-off messages to the mailing list (announcements, event
 * invites, thank-yous) written in the admin instead of BCC'ing people by
 * hand. Unlike newsletters (Blogs.ts) they have no byline, hero image or
 * newsletter banner — just a branded letter opening with a personal
 * greeting ("Dear {name},"). "Send email" is Payload's publish: it emails
 * everyone or a hand-picked set of subscribers, once, and locks the email —
 * after that it can only be duplicated into a new unsent draft (see
 * src/lib/send-once.ts).
 * Staff sends become drafts and notify the Admins for review (see
 * src/lib/editorial.ts), so nothing goes out until an Admin sends it.
 *
 * Deleting is a soft delete (Payload's trash): Admins and Staff alike can
 * delete an email — from the visible Delete button on each list row or from
 * the edit screen — and restore it from the list's Trash tab. Deleting
 * permanently (from the Trash) is for Admins only.
 */
export const Emails: CollectionConfig = {
  slug: "emails",
  labels: { singular: "Custom Email", plural: "Custom Emails" },
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  // Editable until it has been sent, then locked. Anyone may move an email
  // to the Trash or restore it; only Admins delete permanently.
  access: { delete: trashForAllDeleteForAdmins, update: lockedOnceSent },
  admin: {
    group: MAILING_LIST_GROUP,
    useAsTitle: "subject",
    defaultColumns: ["subject", "sendTo", "stage", "sentAt", "sentCount", "rowActions"],
    description:
      "One-off emails such as announcements, invites and thank-yous. Send email sends it once, then it is locked. To send it again, open it and click Duplicate.",
    preview: (doc) => (doc?.id ? `${SITE_URL}/email-preview/${doc.id}` : null),
    components: {
      edit: {
        // The default preview button is icon-only; this one says "Preview".
        PreviewButton: {
          path: "/components/admin/PreviewLinkButton#PreviewLinkButton",
          clientProps: { basePath: "/email-preview" },
        },
        // Publishing is what sends the email, so the button says so.
        PublishButton: {
          path: "@payloadcms/ui#PublishButton",
          clientProps: { label: "Send email" },
        },
      },
    },
  },
  versions: { drafts: true },
  fields: [
    {
      name: "subject",
      type: "text",
      required: true,
      admin: { description: "What subscribers see in their inbox." },
    },
    {
      name: "heading",
      type: "text",
      admin: {
        description: "Optional headline at the top of the email.",
      },
    },
    {
      // Its own required, pre-filled field so nobody has to remember to type
      // the {name} placeholder into the message themselves.
      name: "greeting",
      label: "Greeting",
      type: "text",
      required: true,
      defaultValue: DEFAULT_GREETING,
      validate: (value: unknown) =>
        (typeof value === "string" && value.includes("{name}")) ||
        `The greeting must include {name}, curly brackets included. Example: ${DEFAULT_GREETING}`,
      admin: {
        description: `First line of the email. Keep {name} exactly as typed. Each subscriber sees their own first name, or “${NAME_FALLBACK}” if we have no name.`,
      },
    },
    {
      name: "content",
      label: "Message",
      type: "richText",
      required: true,
      admin: {
        description:
          "Start with your message. The greeting is added for you.",
      },
    },
    {
      // Always-visible "Preview email" box; see the component for why.
      name: "previewEmail",
      type: "ui",
      admin: {
        position: "sidebar",
        disableListColumn: true,
        components: {
          Field: "/components/admin/EmailPreviewField#EmailPreviewField",
        },
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
      admin: { position: "sidebar" },
    },
    {
      name: "selectedSubscribers",
      type: "relationship",
      relationTo: "subscribers",
      hasMany: true,
      validate: (value, { siblingData }) =>
        (siblingData as { sendTo?: string })?.sendTo !== "selected" ||
        (Array.isArray(value) && value.length > 0) ||
        "Pick at least one subscriber, or choose “All subscribers”.",
      admin: {
        position: "sidebar",
        condition: (data) => data?.sendTo === "selected",
        description: "Choose who receives it.",
      },
    },
    rowActionsField,
    ...stageFields,
    ...sendStatusFields,
  ],
  hooks: {
    beforeOperation: [holdStaffPublishForReview],
    beforeChange: [requireAdminToPublish, customEmailSend.beforeChange],
    afterChange: [
      notifyAdminsOnReviewRequest({
        slug: "emails",
        label: "custom email",
        onPublish: "Sending it will email it to the chosen subscribers.",
      }),
      customEmailSend.afterChange,
    ],
  },
};
