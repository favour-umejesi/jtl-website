import path from "path";
import { fileURLToPath } from "url";

import { APIError, type CollectionConfig } from "payload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Media bytes live in the git-tracked public/media folder and ship with each
// deploy (served statically via the rewrite in next.config.ts). Vercel's
// filesystem is read-only, so any operation that writes or deletes a file only
// works locally: upload in `npm run dev`, commit the file in public/media,
// push, and let the deploy finish BEFORE attaching the image to content — the
// shared database sees the record immediately, but production only gets the
// file once the deploy lands. Never swap file bytes by hand; replacing an
// image outside the admin leaves the stored width/height/filesize stale.
const fsIsReadOnly = Boolean(process.env.VERCEL);

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: () => !fsIsReadOnly,
    delete: () => !fsIsReadOnly,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
    mimeTypes: ["image/*"],
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (fsIsReadOnly && req.file) {
          throw new APIError(
            "Image files can't be added or replaced from the deployed admin — upload in a local dev session, commit the file in public/media, and push.",
            400,
          );
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "alt", type: "text", label: "Alt text" },
  ],
};
