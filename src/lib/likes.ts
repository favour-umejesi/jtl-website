import type { FieldHook, Payload } from "payload";

/**
 * Reader likes on website articles are counted straight in the database,
 * never through `payload.update`.
 *
 * Articles have drafts, and a Payload update always starts from the newest
 * version of a document. So when an editor had saved a draft on top of a live
 * article, a visitor's like used to write that unreviewed draft over the live
 * article — as a draft, which took the article off the website. Every like
 * also added a row to the article's version history, pushing real edits out.
 */

// The postgres adapter's node-postgres pool, absent from payload.db's public type.
type QueryClient = {
  query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};
const db = (payload: Payload): QueryClient =>
  (payload.db as unknown as { pool: QueryClient }).pool;

/**
 * Adds `delta` to a published article's likes in one atomic statement, and
 * copies the new count onto its saved versions so the admin (which reads the
 * newest version) shows the same number. Returns the new count, or null if
 * there is no such published article.
 */
export async function addLikes(
  payload: Payload,
  slug: string,
  delta: number,
): Promise<number | null> {
  const { rows } = await db(payload).query(
    `with bumped as (
       update posts set likes = greatest(0, coalesce(likes, 0) + $2)
       where slug = $1 and _status = 'published' and deleted_at is null
       returning id, likes
     ), synced as (
       update _posts_v v set version_likes = b.likes
       from bumped b where v.parent_id = b.id
     )
     select likes from bumped`,
    [slug, delta],
  );
  return rows.length ? Number(rows[0].likes) : null;
}

/**
 * Field hook for `likes`: saving an article in the admin submits the count
 * the editor's form loaded, which may be minutes old. Keep the database's.
 */
export const keepCurrentLikes: FieldHook = async ({ operation, originalDoc, req, value }) => {
  if (operation !== "update" || originalDoc?.id == null) return value;
  const { rows } = await db(req.payload).query("select likes from posts where id = $1", [
    originalDoc.id,
  ]);
  return rows.length ? Number(rows[0].likes ?? 0) : value;
};
