import type { CollectionConfig } from "payload";
import { publicReadExceptTrash, rowActionsField } from "@/lib/trash";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts).
  trash: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "status", "rowActions"],
    description:
      'The people shown under "The people behind JTL" on the About page.',
  },
  access: { read: publicReadExceptTrash },
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
    rowActionsField,
  ],
};
