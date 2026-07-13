import type { CollectionConfig } from "payload";
import {
  renderSubscribeConfirmationEmail,
  SUBSCRIBE_EMAIL_DEFAULTS,
} from "@/lib/newsletter-email";
import { unsubscribeUrl } from "@/lib/unsubscribe";

/**
 * Mailing-list subscribers. New blogs are emailed to everyone in this list
 * (see the afterChange hook in Blogs.ts). Website signups land here through
 * the `subscribeToMailingList` server action; the original list was imported
 * from the previous site. No public read access — emails are personal data.
 */
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Subscriber", plural: "Subscribers" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "source"],
    description:
      "People who receive new blogs by email. Signups from the website land here automatically; delete a subscriber to unsubscribe them.",
  },
  hooks: {
    afterChange: [
      // Confirmation email for new website signups: affirms the subscription
      // and says what to expect. Subject and copy are editable in the admin
      // ("Subscriber Welcome Email" global). Imported rows (source
      // "site-member" / "contact") never trigger it, and a send failure only
      // logs — it must never break the signup itself.
      async ({ doc, operation, req }) => {
        if (operation !== "create" || doc.source !== "website") return;
        const { payload } = req;
        try {
          const copy = await payload
            .findGlobal({ slug: "subscribe-email" })
            .catch(() => null);
          const unsub = unsubscribeUrl(doc.id, String(doc.email));
          await payload.sendEmail({
            to: doc.email,
            subject:
              (typeof copy?.subject === "string" && copy.subject.trim()) ||
              SUBSCRIBE_EMAIL_DEFAULTS.subject,
            html: renderSubscribeConfirmationEmail({
              name: typeof doc.name === "string" ? doc.name : undefined,
              heading:
                typeof copy?.heading === "string" ? copy.heading : undefined,
              body: typeof copy?.body === "string" ? copy.body : undefined,
              unsubscribeUrl: unsub,
            }),
            headers: {
              "List-Unsubscribe": `<${unsub}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
        } catch (err) {
          payload.logger.error(
            { err },
            `subscribers: failed to send confirmation email to ${doc.email}`,
          );
        }
      },
    ],
  },
  fields: [
    { name: "name", type: "text" },
    { name: "email", type: "email", required: true, unique: true },
    {
      name: "source",
      type: "select",
      defaultValue: "website",
      options: [
        { label: "Website signup", value: "website" },
        { label: "Site Member (imported)", value: "site-member" },
        { label: "Contact (imported)", value: "contact" },
      ],
    },
  ],
};
