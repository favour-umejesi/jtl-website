import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Testimonials } from "./collections/Testimonials";
import { Partners } from "./collections/Partners";
import { Settings } from "./globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Posts, Testimonials, Partners],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Auto-push schema in dev only. Production runs against the existing Neon
    // schema (and migrations once you add them) and must never alter the DB.
    push: process.env.NODE_ENV !== "production",
  }),
  plugins: [
    // Stores uploaded files in Vercel Blob instead of the local disk, which is
    // ephemeral/read-only on Vercel. Records still live in Neon (Postgres);
    // only the file bytes go to Blob. Disabled locally when no token is set,
    // so `npm run dev` keeps using the disk unless you add BLOB_READ_WRITE_TOKEN.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  sharp,
});
