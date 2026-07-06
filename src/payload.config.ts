import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
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

// 465 => implicit TLS (secure), 587 => STARTTLS (secure: false).
const smtpPort = Number(process.env.SMTP_PORT) || 465;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Posts, Testimonials, Partners],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  // Sends admin emails (password resets, invites) via Gmail SMTP when
  // SMTP_USER/SMTP_PASS are set. Without them, Payload falls back to logging
  // emails to the console (fine for local dev). skipVerify avoids a blocking
  // SMTP handshake at boot, which matters on serverless cold starts.
  email:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? nodemailerAdapter({
          defaultFromName: "Justice Through Literacy",
          defaultFromAddress: process.env.EMAIL_FROM || process.env.SMTP_USER,
          skipVerify: true,
          transportOptions: {
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        })
      : undefined,
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
      // Keep the `prefix` schema field present even when the plugin is disabled
      // locally (no token), so dev and production share one schema and a local
      // `npm run dev` never drops the column production relies on.
      alwaysInsertFields: true,
      // Upload straight from the browser to Blob, bypassing Vercel's ~4.5MB
      // serverless request-body limit (which otherwise fails larger images).
      clientUploads: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  sharp,
});
