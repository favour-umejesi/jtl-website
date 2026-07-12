import type { CollectionConfig } from "payload";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "status"],
    description:
      'The people shown under "The people behind JTL" on the About page.',
  },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "current",
      options: [
        { label: "Current Staff", value: "current" },
        { label: "Past Staff", value: "past" },
      ],
    },
    {
      name: "order",
      type: "number",
      admin: { description: "Lower numbers show first within each group" },
    },
  ],
};
