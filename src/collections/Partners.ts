import type { CollectionConfig } from "payload";
import { publicReadExceptTrash, rowActionsField } from "@/lib/trash";

export const Partners: CollectionConfig = {
  slug: "partners",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  admin: { useAsTitle: "name", defaultColumns: ["name", "logo", "url", "rowActions"] },
  access: { read: publicReadExceptTrash },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "url", type: "text", admin: { description: "Optional link to the partner's site" } },
    rowActionsField,
  ],
};
