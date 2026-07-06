// One-off / re-runnable migration.
//
// Uploads each Payload `media` record's file into Vercel Blob (matched by
// filename from the local `public/` folder) and repoints the record's URL at
// Blob. Fixes media that was originally uploaded on a dev machine (local disk),
// which therefore 404s in production.
//
// Run:
//   node --env-file=.env scripts/upload-media-to-blob.mjs
//
// Requires in .env:
//   DATABASE_URI            - the Neon connection string (same DB as production)
//   BLOB_READ_WRITE_TOKEN   - the REAL Vercel Blob token (copy it from Vercel ->
//                             Storage -> your Blob store -> ".env.local" tab)

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
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

const PUBLIC_DIR = path.resolve("public");

// Recursively index files under public/ by basename -> absolute path.
async function indexFiles(dir, index = new Map()) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await indexFiles(full, index);
    else if (!index.has(entry.name)) index.set(entry.name, full);
  }
  return index;
}

const index = await indexFiles(PUBLIC_DIR);
const pool = new pg.Pool({ connectionString: DATABASE_URI, max: 3 });
const media = (await pool.query("select id, filename from media order by id")).rows;

let uploaded = 0;
let skipped = 0;
for (const { id, filename } of media) {
  const local = index.get(filename);
  if (!local) {
    console.warn(`SKIP  ${filename} (no matching file found in public/)`);
    skipped++;
    continue;
  }
  const buffer = await readFile(local);
  const blob = await put(filename, buffer, {
    access: "public",
    token: BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  await pool.query("update media set url = $1, prefix = '' where id = $2", [
    blob.url,
    id,
  ]);
  console.log(`OK    ${filename} -> ${blob.url}`);
  uploaded++;
}

console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped}.`);
await pool.end();
