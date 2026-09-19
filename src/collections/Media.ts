import type { CollectionConfig } from "payload";
import { rowActionsField } from "@/lib/trash";

// File bytes are stored in the media_blobs table in Neon by the storage
// adapter in src/lib/neon-media-storage.ts (wired up via cloudStoragePlugin in
// payload.config.ts), so images can be uploaded straight from the deployed
// admin and are servable the moment the upload finishes — no commit or deploy
// involved. Files that predate database storage live in the git-tracked
// public/media folder; the adapter's static handler redirects any filename it
// doesn't find in the table to that static path.
export const Media: CollectionConfig = {
  slug: "media",
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts). The file
  // itself is only removed when a trashed image is deleted permanently.
  trash: true,
  admin: { defaultColumns: ["filename", "alt", "createdAt", "rowActions"] },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*"],
  },
  fields: [
    { name: "alt", type: "text", label: "Alt text" },
    rowActionsField,
  ],
};
