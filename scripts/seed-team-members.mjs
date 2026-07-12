// One-off / re-runnable seed.
//
// Populates the `team-members` collection with the team currently hard-coded
// in src/lib/content.ts, uploading each head-shot from public/images/team/ to
// Vercel Blob and creating the matching `media` record. Members that already
// exist (matched by name) are skipped, so it's safe to run more than once.
//
// Run:
//   node --env-file=.env scripts/seed-team-members.mjs
//
// Requires in .env:
//   DATABASE_URI            - the Neon connection string (same DB as production)
//   BLOB_READ_WRITE_TOKEN   - the REAL Vercel Blob token (copy it from Vercel ->
//                             Storage -> your Blob store -> ".env.local" tab)

import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";
import { put } from "@vercel/blob";

const { DATABASE_URI, BLOB_READ_WRITE_TOKEN } = process.env;
if (!DATABASE_URI) {
  console.error("Missing DATABASE_URI in .env");
  process.exit(1);
}
if (!BLOB_READ_WRITE_TOKEN) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN in .env (copy the real token from Vercel -> Storage -> Blob).",
  );
  process.exit(1);
}

// Mirrors about.team in src/lib/content.ts.
const TEAM = [
  { name: "Olohi John", role: "Founder", photo: "olohi.jpeg" },
  { name: "Shalom Mhanda", role: "Tech Lead", photo: "shalom.jpg" },
  { name: "Oyale John", role: "Project Manager", photo: "oyale.jpg" },
  { name: "Favour Hosea", role: "Education Specialist", photo: "favour-hosea.jpg" },
  { name: "Agaba Great John", role: "Education Specialist", photo: "agaba.jpg" },
  { name: "Favour Umejesi", role: "Web Developer", photo: "favour-umejesi.jpg" },
  { name: "Darasimi Ikuyetijo", role: "Article Writer", photo: "darasimi.jpg" },
  { name: "Ifeoma Okolo", role: "Article Writer", photo: "ifeoma.jpg" },
];

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const TEAM_DIR = path.resolve("public/images/team");

const pool = new pg.Pool({ connectionString: DATABASE_URI, max: 3 });

/** Reuse an existing media record by filename, or upload + insert a new one. */
async function ensureMedia(filename, alt) {
  const existing = await pool.query("select id from media where filename = $1 limit 1", [filename]);
  if (existing.rows.length) return { id: existing.rows[0].id, reused: true };

  const buffer = await readFile(path.join(TEAM_DIR, filename));
  const { width, height } = await sharp(buffer).metadata();
  const blob = await put(filename, buffer, {
    access: "public",
    token: BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  const inserted = await pool.query(
    `insert into media (alt, url, filename, mime_type, filesize, width, height, updated_at, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, now(), now()) returning id`,
    [alt, blob.url, filename, MIME[path.extname(filename)] ?? "image/jpeg", buffer.length, width, height],
  );
  return { id: inserted.rows[0].id, reused: false };
}

let created = 0;
let skipped = 0;
for (const [i, member] of TEAM.entries()) {
  const existing = await pool.query("select id from team_members where name = $1 limit 1", [member.name]);
  if (existing.rows.length) {
    console.log(`SKIP  ${member.name} (already in team-members)`);
    skipped++;
    continue;
  }
  const media = await ensureMedia(member.photo, member.name);
  await pool.query(
    `insert into team_members (name, role, photo_id, status, "order", updated_at, created_at)
     values ($1, $2, $3, 'current', $4, now(), now())`,
    [member.name, member.role, media.id, i + 1],
  );
  console.log(`OK    ${member.name} (photo ${media.reused ? "reused" : "uploaded"}: ${member.photo})`);
  created++;
}

console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
await pool.end();
