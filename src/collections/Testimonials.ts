import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: { useAsTitle: "name", defaultColumns: ["name", "role"] },
  access: { read: () => true },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", defaultValue: "Parent, Justice Through Literacy" },
  ],
};
