// One-off / re-runnable backfill for the editorial review workflow.
//
// Enabling Payload drafts added a `_status` column to posts (news) and blogs;
// existing rows have it NULL, which would hide them from the published-only
// queries. This script:
//   1. marks all existing news posts as published (they were already live),
//   2. marks all existing blogs as drafts (they have never been emailed),
//   3. gives the two main admin accounts the "Admin" title and everyone else
//      "Staff".
//
// Run ONCE, right after enabling drafts:
//   node --env-file=.env scripts/enable-review-workflow.mjs
//
// Do NOT re-run once editors start working — every post that existed before
// the migration was live on the site, so this publishes them all, which would
// wrongly publish any staff drafts created after the migration.

import pg from "pg";

const { DATABASE_URI } = process.env;
if (!DATABASE_URI) {
  console.error("Missing DATABASE_URI in .env");
  process.exit(1);
}

// Keep in sync with USER_MANAGERS in src/collections/Users.ts.
const ADMIN_EMAILS = ["umejesif@gmail.com", "educatenigeriankids@gmail.com"];

const pool = new pg.Pool({ connectionString: DATABASE_URI, max: 1 });

const posts = await pool.query(
  "update posts set _status = 'published' where _status is distinct from 'published'",
);
console.log(`posts: ${posts.rowCount} marked published`);

const blogs = await pool.query(
  "update blogs set _status = 'draft' where _status is null",
);
console.log(`blogs: ${blogs.rowCount} marked draft`);

const staff = await pool.query(
  "update users set role = 'staff' where role is null",
);
const admins = await pool.query(
  "update users set role = 'admin' where email = any($1)",
  [ADMIN_EMAILS],
);
console.log(`users: ${admins.rowCount} admin(s) set, ${staff.rowCount} defaulted to staff`);

await pool.end();
