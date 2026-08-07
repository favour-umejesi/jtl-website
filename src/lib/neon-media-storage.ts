import type { PostgresAdapterArgs } from "@payloadcms/db-postgres";
import {
  customType,
  integer,
  pgTable,
  text,
  timestamp,
} from "@payloadcms/db-postgres/drizzle/pg-core";
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import type { Payload } from "payload";

// Media storage backed by the existing Neon database: file bytes go into the
// media_blobs table, keyed by the (Payload-deduplicated) filename. This lets
// non-technical staff upload images from the deployed admin — Vercel's
// filesystem is read-only, so the old git-tracked public/media flow required a
// local dev session, a commit, and a deploy for every image. Files uploaded
// before this change still live in public/media and are served statically;
// the static handler redirects any filename it can't find in the table.

// Keep in sync with the /api/media/file/* entry in next.config.ts headers().
// s-maxage makes Vercel's CDN cache the function response, so repeat image
// loads don't invoke the function or touch the database. Not immutable:
// replacing a file on an existing media doc can reuse its filename.
const MEDIA_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

const bytea = customType<{ data: Buffer }>({
  dataType: () => "bytea",
});

const mediaBlobs = pgTable("media_blobs", {
  filename: text("filename").primaryKey(),
  mimeType: text("mime_type").notNull(),
  filesize: integer("filesize").notNull(),
  data: bytea("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

type PostgresSchemaHook = NonNullable<PostgresAdapterArgs["afterSchemaInit"]>[number];

// Registers media_blobs with drizzle so dev schema pushes create the table —
// and, just as important, don't drop it as unknown.
export const registerMediaBlobsTable: PostgresSchemaHook = ({ schema }) => ({
  ...schema,
  tables: { ...schema.tables, media_blobs: mediaBlobs },
});

// The postgres adapter's node-postgres pool, absent from payload.db's public
// type. Raw parameterized queries because drizzle's query builder isn't wired
// to tables added via afterSchemaInit.
type QueryClient = {
  query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

const db = (payload: Payload): QueryClient =>
  (payload.db as unknown as { pool: QueryClient }).pool;

export const neonMediaAdapter: Adapter = () => ({
  name: "neon-postgres",

  handleUpload: async ({ file, req }) => {
    // file.filesize can be undefined on local-API uploads; the buffer is
    // authoritative either way.
    await db(req.payload).query(
      `insert into media_blobs (filename, mime_type, filesize, data, updated_at)
       values ($1, $2, $3, $4, now())
       on conflict (filename) do update
         set mime_type = excluded.mime_type,
             filesize = excluded.filesize,
             data = excluded.data,
             updated_at = now()`,
      [file.filename, file.mimeType, file.buffer.byteLength, file.buffer],
    );
  },

  handleDelete: async ({ filename, req }) => {
    await db(req.payload).query("delete from media_blobs where filename = $1", [filename]);
  },

  staticHandler: async (req, { params: { filename } }) => {
    const { rows } = await db(req.payload).query(
      "select mime_type, data from media_blobs where filename = $1",
      [filename],
    );

    if (rows.length > 0) {
      const row = rows[0] as { data: Buffer; mime_type: string };
      const bytes = new Uint8Array(row.data);
      // Stream in chunks rather than returning the buffer whole: Vercel caps
      // buffered function responses at ~4.5MB, but streamed responses are
      // exempt, so files up to the 10MB upload cap stay servable.
      const chunkSize = 64 * 1024;
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            controller.enqueue(bytes.subarray(i, i + chunkSize));
          }
          controller.close();
        },
      });
      return new Response(body, {
        headers: {
          "Cache-Control": MEDIA_CACHE_CONTROL,
          "Content-Length": String(bytes.byteLength),
          "Content-Type": row.mime_type,
        },
      });
    }

    // Pre-existing file in git-tracked public/media: hand off to the static/CDN
    // layer. 307 (not 308) so browsers honor the TTL instead of caching the
    // redirect forever.
    return new Response(null, {
      status: 307,
      headers: {
        "Cache-Control": MEDIA_CACHE_CONTROL,
        Location: `/media/${encodeURIComponent(filename)}`,
      },
    });
  },
});
