// One-off / re-runnable seed.
//
// 1. Imports the mailing-list subscribers carried over from the previous
//    website into the `subscribers` collection (matched by email, so it's
//    safe to run more than once).
// 2. Copies the existing news posts into the `blogs` collection as unsent
//    drafts ("Send to subscribers" unticked), so the team can choose to email
//    them later. Inserting via SQL never triggers the email hook.
//
// Run:
//   node --env-file=.env scripts/seed-subscribers.mjs

import pg from "pg";

const { DATABASE_URI } = process.env;
if (!DATABASE_URI) {
  console.error("Missing DATABASE_URI in .env");
  process.exit(1);
}

// Exported from the previous site. Status "Site Member" / "Contact" maps to
// the `source` select on the subscribers collection.
const SUBSCRIBERS = [
  ["Yushan He", "heyushan417@gmail.com", "contact"],
  ["Olohi John", "ojohn@smith.edu", "site-member"],
  ["Olohi John", "educatenigeriankids@gmail.com", "site-member"],
  ["Favour Hosea", "tonzaif@gmail.com", "contact"],
  ["Favour Hosea", "tonzaifavour@gmail.com", "contact"],
  ["Favour Umejesi", "umejesif@gmail.com", "site-member"],
  ["hoseafavour123", "hoseafavour123@gmail.com", "site-member"],
  ["Ram Vasekar", "ram.marketresearch@gmail.com", "site-member"],
  ["Darasimi", "moiojyi@gmail.com", "site-member"],
  ["Olohi John", "johnolohi6@gmail.com", "site-member"],
  ["More Ajay", "moreajaymrf90@gmail.com", "site-member"],
  ["Yash Pusadekar", "yash.mrfr03@gmail.com", "site-member"],
  ["Nidhi Chacko", "nidhichacko5@gmail.com", "site-member"],
  ["Okolo ifeoma Emmanuella", "ifeomaokolo79@gmail.com", "contact"],
  ["Daniel Enesi", "enesidaniel.120064@gmail.com", "contact"],
  ["Precious Marcus", "preciousummachang@gmail.com", "contact"],
  ["Noanah Malati", "nmalati@smith.edu", "contact"],
  ["Shalom Mhanda", "smhanda@smith.edu", "site-member"],
];

const pool = new pg.Pool({ connectionString: DATABASE_URI, max: 3 });

let added = 0;
let existing = 0;
for (const [name, email, source] of SUBSCRIBERS) {
  const result = await pool.query(
    `insert into subscribers (name, email, source, updated_at, created_at)
     values ($1, lower($2), $3, now(), now())
     on conflict (email) do nothing`,
    [name, email, source],
  );
  if (result.rowCount) {
    console.log(`OK    ${email}`);
    added++;
  } else {
    console.log(`SKIP  ${email} (already subscribed)`);
    existing++;
  }
}
console.log(`\nSubscribers: ${added} added, ${existing} already present.`);

const copied = await pool.query(
  `insert into blogs (title, author, date, read_time, excerpt, image_id, content, send_to_subscribers, updated_at, created_at)
   select p.title, p.author, p.date, p.read_time, p.excerpt, p.image_id, p.content, false, now(), now()
   from posts p
   where not exists (select 1 from blogs b where b.title = p.title)
   returning title`,
);
copied.rows.forEach((r) => console.log(`BLOG  copied "${r.title}" (unsent draft)`));
console.log(`Blogs: ${copied.rowCount} copied from existing posts.`);

await pool.end();
