import type { CollectionConfig } from "payload";
import { MAILING_LIST_GROUP } from "@/lib/admin-groups";
import {
  buildCustomEmailArgs,
  DEFAULT_GREETING,
  NAME_FALLBACK,
  renderCustomEmail,
} from "@/lib/custom-email";
import { notifyAdminsOnReviewRequest, requireAdminToPublish } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site-url";
import { resolveRecipients, sendToSubscribers } from "@/lib/subscriber-mailer";
import { rowActionsField } from "@/lib/trash";

/**
 * Custom emails: one-off messages to the mailing list (announcements, event
 * invites, thank-yous) written in the admin instead of BCC'ing people by
 * hand. Unlike newsletters (Blogs.ts) they have no byline, hero image or
 * newsletter banner — just a branded letter opening with a personal
 * greeting ("Dear {name},"). "Send email" is Payload's publish: it emails
 * everyone or a hand-picked set of subscribers, once.
 * Staff sends become drafts and notify the Admins for review (see
 * src/lib/editorial.ts), so nothing goes out until an Admin sends it.
 *
 * Deleting is a soft delete (Payload's trash): Admins and Staff alike can
 * delete an email — from the visible Delete button on each list row or from
 * the edit screen — and restore it from the list's Trash tab.
 */
export const Emails: CollectionConfig = {
  slug: "emails",
  labels: { singular: "Custom Email", plural: "Custom Emails" },
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  // Every signed-in user — Admin or Staff — may delete (and restore).
  access: { delete: ({ req }) => Boolean(req.user) },
  admin: {
    group: MAILING_LIST_GROUP,
    useAsTitle: "subject",
    defaultColumns: ["subject", "sendTo", "_status", "sentAt", "sentCount", "rowActions"],
    description:
      "Write a one-off email — an announcement, invite or thank-you — and send it to all subscribers or only the ones you pick. This is separate from Newsletters. Save a draft and use Preview to check it; “Send email” sends it, once. Every email opens with a greeting that includes {name}, which becomes each subscriber’s first name. Staff sends go out only after an Admin reviews and sends them. To send a similar email again, open it and choose Duplicate. The Delete button on each row moves an email to the Trash — open the Trash tab to restore it if that was a mistake.",
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
      admin: { description: "The subject line subscribers see in their inbox." },
    },
    {
      name: "heading",
      type: "text",
      admin: {
        description: "Optional headline at the top of the email. Leave blank for none.",
      },
    },
    {
      // Its own required, pre-filled field so nobody has to remember to type
      // the {name} placeholder into the message themselves.
      name: "greeting",
      label: "Greeting (must include {name})",
      type: "text",
      required: true,
      defaultValue: DEFAULT_GREETING,
      validate: (value: unknown) =>
        (typeof value === "string" && value.includes("{name}")) ||
        `The greeting must include {name} — typed exactly like that, with the curly brackets. Example: ${DEFAULT_GREETING}`,
      admin: {
        description: `The first line of the email. {name} is a placeholder: keep it exactly as written, curly brackets included, and each subscriber sees their own first name in its place — “Dear {name},” arrives as “Dear Ada,”. Subscribers we have no name for see “${NAME_FALLBACK}”. You can change the words around it, e.g. “Hello {name},”.`,
      },
    },
    {
      name: "content",
      label: "Message",
      type: "richText",
      required: true,
      admin: {
        description:
          "The body of the email. Start straight with your message — the greeting above is added for you.",
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
        description: "Pick who receives this email.",
      },
    },
    {
      name: "sentAt",
      type: "date",
      // A duplicate is a new email that has not gone out yet.
      hooks: { beforeDuplicate: [() => null] },
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically when the email goes out.",
        date: { displayFormat: "MMM d, yyyy h:mm a" },
      },
    },
    rowActionsField,
    {
      name: "sentCount",
      label: "Sent to",
      type: "number",
      hooks: { beforeDuplicate: [() => null] },
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "How many subscribers it was sent to.",
      },
    },
  ],
  hooks: {
    beforeChange: [requireAdminToPublish],
    afterChange: [
      notifyAdminsOnReviewRequest({
        slug: "emails",
        label: "custom email",
        onPublish: "Sending it will email it to the chosen subscribers.",
      }),
      async ({ doc, previousDoc, req, context }) => {
        // The sentAt update below re-enters this hook; the flag breaks the loop.
        if (context.skipCustomEmail) return;
        // Moving an email to the trash or restoring it must never send it.
        if (doc.deletedAt || previousDoc?.deletedAt) return;
        // Only a published email is sent — drafts awaiting review never send.
        if (doc._status !== "published" || doc.sentAt) return;

        const { payload } = req;
        const logLabel = `emails: "${doc.subject}"`;
        try {
          const recipients = await resolveRecipients(doc, payload);
          if (!recipients.length) {
            payload.logger.warn(`${logLabel} sent but no recipients matched`);
            return;
          }

          const args = buildCustomEmailArgs(doc, payload);
          const failed = await sendToSubscribers({
            payload,
            recipients,
            subject: doc.subject,
            render: (sub, unsub) =>
              renderCustomEmail({ ...args, name: sub.name, unsubscribeUrl: unsub }),
            logLabel,
          });
          if (failed > 0) {
            // sentAt stays empty so sending again retries the whole list.
            payload.logger.error(
              `${logLabel} failed for ${failed}/${recipients.length} subscribers — send again to retry`,
            );
            return;
          }
          payload.logger.info(`${logLabel} emailed to ${recipients.length} subscribers`);

          await payload.update({
            collection: "emails",
            id: doc.id,
            data: { sentAt: new Date().toISOString(), sentCount: recipients.length },
            context: { skipCustomEmail: true },
          });
        } catch (err) {
          // sentAt stays empty on failure, so sending again retries.
          payload.logger.error({ err }, `${logLabel} failed to send`);
        }
      },
    ],
  },
};
