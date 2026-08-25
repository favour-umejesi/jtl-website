import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Blogs } from "./collections/Blogs";
import { Subscribers } from "./collections/Subscribers";
import { Testimonials } from "./collections/Testimonials";
import { Partners } from "./collections/Partners";
import { TeamMembers } from "./collections/TeamMembers";
import { DonatePage } from "./globals/DonatePage";
import { Settings } from "./globals/Settings";
import { SubscribeEmail } from "./globals/SubscribeEmail";
import { neonMediaAdapter, registerMediaBlobsTable } from "./lib/neon-media-storage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// 465 => implicit TLS (secure), 587 => STARTTLS (secure: false).
const smtpPort = Number(process.env.SMTP_PORT) || 465;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Posts, Blogs, Subscribers, Testimonials, Partners, TeamMembers],
  globals: [Settings, SubscribeEmail, DonatePage],
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
    afterSchemaInit: [registerMediaBlobsTable],
  }),
  // 10MB cap. Heads-up for deployed-admin uploads: Vercel caps function
  // request bodies at ~4.5MB on every plan, so files above that are rejected
  // by the platform before Payload sees them — upload those from a local dev
  // session instead (they store in the shared Neon DB either way). Serving is
  // not capped: the storage adapter streams file responses, which exempts
  // them from Vercel's 4.5MB buffered-response limit.
  upload: {
    abortOnLimit: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  },
  plugins: [
    // Media bytes live in the media_blobs table in Neon (see
    // src/lib/neon-media-storage.ts) so staff can upload from the deployed
    // admin. The empty `prefix` keeps the prefix column (added back when media
    // used the Vercel Blob adapter, and '' on every existing row) in the
    // collection schema — when the plugin is enabled, alwaysInsertFields alone
    // doesn't insert it, and dropping the column would break deployed code.
    cloudStoragePlugin({
      collections: {
        media: { adapter: neonMediaAdapter, disableLocalStorage: true, prefix: "" },
      },
    }),
  ],
  sharp,
});
