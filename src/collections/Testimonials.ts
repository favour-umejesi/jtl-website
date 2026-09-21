import type { CollectionConfig } from "payload";
import {
  publicReadExceptTrash,
  rowActionsField,
  trashForAllDeleteForAdmins,
} from "@/lib/trash";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "rowActions"],
    description: "Quotes shown on the website.",
  },
  access: { read: publicReadExceptTrash, delete: trashForAllDeleteForAdmins },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "name", type: "text", required: true },
    {
      name: "role",
      label: "Who they are",
      type: "text",
      defaultValue: "Parent, Justice Through Literacy",
      admin: { description: "Shown under their name." },
    },
    rowActionsField,
  ],
};
