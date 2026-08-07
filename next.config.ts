import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // The public blog was retired; blogs are now emailed to subscribers.
  // Old bookmarks and indexed links land on News instead.
  async redirects() {
    return [
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/blog/:slug", destination: "/news/:slug", permanent: true },
    ];
  },
  // Media requests (/api/media/file/<name>) go through Payload's catch-all
  // route to the storage adapter in src/lib/neon-media-storage.ts, which
  // streams new uploads from the media_blobs table and redirects legacy
  // filenames to the static /media path. Cache-Control below matches what the
  // adapter sets (keep them in sync): s-maxage lets Vercel's CDN cache the
  // function responses; the /media entry covers the git-tracked legacy files,
  // which carry no Cache-Control by default. Short TTLs, not immutable —
  // filenames can be reused when an image is replaced.
  async headers() {
    return [
      {
        source: "/media/:filename*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/api/media/file/:filename*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
