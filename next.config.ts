import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
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
