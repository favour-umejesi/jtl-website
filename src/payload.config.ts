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
import { Blogs } from "./collections/Blogs";
import { Subscribers } from "./collections/Subscribers";
import { Testimonials } from "./collections/Testimonials";
import { Partners } from "./collections/Partners";
import { TeamMembers } from "./collections/TeamMembers";
import { Settings } from "./globals/Settings";
import { SubscribeEmail } from "./globals/SubscribeEmail";

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
  globals: [Settings, SubscribeEmail],
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
  // Cap uploads at 20MB: media is stored in git and GitHub hard-rejects pushes
  // with files over 100MB, at which point an oversized upload could never be
  // deployed and would need history rewriting to remove.
  upload: {
    abortOnLimit: true,
    limits: { fileSize: 20 * 1024 * 1024 },
  },
  plugins: [
    // The Vercel Blob adapter is retired — media lives in the git-tracked
    // public/media folder (see src/collections/Media.ts). The plugin stays
    // registered, disabled, only so alwaysInsertFields keeps the `prefix`
    // column it added to the media table from being dropped by dev schema
    // pushes.
    vercelBlobStorage({
      enabled: false,
      alwaysInsertFields: true,
      collections: { media: true },
      token: undefined,
    }),
  ],
  sharp,
});
