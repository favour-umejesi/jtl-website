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
  images: {
    // Payload serves Blob-stored media from the Vercel Blob public domain;
    // next/image blocks remote hosts unless they're allowlisted here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
