// One-off / re-runnable migration.
//
// Enabling Payload drafts on posts (news) and blogs means the admin panel
// lists documents through their version history — documents that existed
// before drafts were enabled have no version rows, so the admin showed
// empty lists even though the data is intact. This creates the initial
// "latest" version row for every document that doesn't have one yet.
//
// Run:
//   node --env-file=.env scripts/create-initial-versions.mjs

import pg from "pg";

const { DATABASE_URI } = process.env;
if (!DATABASE_URI) {
  console.error("Missing DATABASE_URI in .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URI, max: 1 });

const posts = await pool.query(
  `insert into _posts_v (
     parent_id, version_title, version_slug, version_category, version_author,
     version_date, version_read_time, version_excerpt, version_image_id,
     version_content, version_likes, version_updated_at, version_created_at,
     version__status, latest, created_at, updated_at
   )
   select
     p.id, p.title, p.slug, p.category::text::enum__posts_v_version_category, p.author,
     p.date, p.read_time, p.excerpt, p.image_id,
     p.content, p.likes, p.updated_at, p.created_at,
     p._status::text::enum__posts_v_version_status, true, now(), now()
   from posts p
   where not exists (select 1 from _posts_v v where v.parent_id = p.id)
   returning version_title`,
);
posts.rows.forEach((r) => console.log(`POST  version created: ${r.version_title}`));

const blogs = await pool.query(
  `insert into _blogs_v (
     parent_id, version_title, version_author, version_date, version_read_time,
     version_excerpt, version_image_id, version_content,
     version_send_to_subscribers, version_send_to, version_sent_at,
     version_updated_at, version_created_at, version__status, latest,
     created_at, updated_at
   )
   select
     b.id, b.title, b.author, b.date, b.read_time,
     b.excerpt, b.image_id, b.content,
     b.send_to_subscribers, b.send_to::text::enum__blogs_v_version_send_to, b.sent_at,
     b.updated_at, b.created_at, b._status::text::enum__blogs_v_version_status, true,
     now(), now()
   from blogs b
   where not exists (select 1 from _blogs_v v where v.parent_id = b.id)
   returning version_title`,
);
blogs.rows.forEach((r) => console.log(`BLOG  version created: ${r.version_title}`));

console.log(`\nDone. ${posts.rowCount} news + ${blogs.rowCount} blog versions created.`);
await pool.end();
