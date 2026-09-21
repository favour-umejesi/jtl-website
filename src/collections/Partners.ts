import type { CollectionConfig } from "payload";
import {
  publicReadExceptTrash,
  rowActionsField,
  trashForAllDeleteForAdmins,
} from "@/lib/trash";

export const Partners: CollectionConfig = {
  slug: "partners",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "logo", "url", "rowActions"],
    description: "Partner logos shown on the website.",
  },
  access: { read: publicReadExceptTrash, delete: trashForAllDeleteForAdmins },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "url", type: "text", admin: { description: "Optional. The partner’s website." } },
    rowActionsField,
  ],
};
