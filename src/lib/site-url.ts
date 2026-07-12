// Absolute site URL used in email links and images. Auto-resolves on Vercel
// (system env), overridable via NEXT_PUBLIC_SERVER_URL, localhost in dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
