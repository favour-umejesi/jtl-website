import type { CollectionConfig } from "payload";

// File bytes are stored in the media_blobs table in Neon by the storage
// adapter in src/lib/neon-media-storage.ts (wired up via cloudStoragePlugin in
// payload.config.ts), so images can be uploaded straight from the deployed
// admin and are servable the moment the upload finishes — no commit or deploy
// involved. Files that predate database storage live in the git-tracked
// public/media folder; the adapter's static handler redirects any filename it
// doesn't find in the table to that static path.
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*"],
  },
  fields: [
    { name: "alt", type: "text", label: "Alt text" },
  ],
};
