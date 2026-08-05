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
  // Payload generates /api/media/file/<name> URLs, but the files themselves
  // are git-tracked in public/media. Array-form rewrites run after public
  // files and before dynamic routes, so this serves media straight from the
  // static/CDN layer without ever invoking the /api/[...slug] function.
  async rewrites() {
    return [
      {
        source: "/api/media/file/:filename*",
        destination: "/media/:filename*",
      },
    ];
  },
  // Static responses carry no Cache-Control by default. A short browser TTL
  // (not immutable: filenames are reused when an image is re-uploaded) with a
  // long stale-while-revalidate keeps repeat image loads off the network.
  async headers() {
    const mediaCache = {
      key: "Cache-Control",
      value: "public, max-age=86400, stale-while-revalidate=604800",
    };
    return [
      { source: "/media/:filename*", headers: [mediaCache] },
      { source: "/api/media/file/:filename*", headers: [mediaCache] },
    ];
  },
};

export default withPayload(nextConfig);
