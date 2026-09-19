import type { CollectionConfig } from "payload";
import { publicReadExceptTrash, rowActionsField } from "@/lib/trash";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  admin: { useAsTitle: "name", defaultColumns: ["name", "role", "rowActions"] },
  access: { read: publicReadExceptTrash },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", defaultValue: "Parent, Justice Through Literacy" },
    rowActionsField,
  ],
};
