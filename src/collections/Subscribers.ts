import type { CollectionConfig } from "payload";

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
