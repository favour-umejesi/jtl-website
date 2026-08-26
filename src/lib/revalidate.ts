import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Purge the site's cached pages and data right after an editor saves in the
 * admin panel, so the change is live on the very next page load.
 *
 * Why this exists: marketing pages that only read cached loaders
 * (`getSettings`, `getDonatePage` in payload-data.ts) are prerendered and
 * served from Vercel's ISR cache. Their 60s `revalidate` is only a
 * stale-while-revalidate hint: an expired page is still served as-is and
 * only re-rendered in the background, and that re-render can itself pick up
 * the still-cached loader result. In practice a page nobody visits for hours
 * stays frozen at its last render, and even after a save an editor had to
 * reload two or three times over several minutes to see the new content.
 *
 * `revalidatePath` (no cache-life profile) expires the page immediately: the
 * next visit is a blocking, on-demand render, and in that render Next
 * bypasses `unstable_cache` entirely (`isOnDemandRevalidate`), so the page is
 * rebuilt from the database. `revalidateTag(..., "max")` additionally marks
 * the loader's data-cache entry stale for the dynamic pages (home, about,
 * news) that share it, instead of waiting out the remaining TTL.
 *
 * Safe to call from Payload hooks in any context: outside a Next request
 * (seed scripts, `payload migrate`, tests) there is no cache to purge, so the
 * call is skipped rather than thrown.
 */
export function revalidateSite({
  tags = [],
  paths = [],
}: {
  /** Cache tags used by loaders in payload-data.ts (e.g. "settings"). */
  tags?: string[];
  /** Routes to expire; a tuple with "layout" expires every route below it. */
  paths?: Array<string | [path: string, type: "layout" | "page"]>;
}): void {
  try {
    for (const tag of tags) revalidateTag(tag, "max");
    for (const p of paths) {
      if (Array.isArray(p)) revalidatePath(p[0], p[1]);
      else revalidatePath(p);
    }
  } catch (err) {
    console.warn(
      `[revalidateSite] skipped (${(err as Error).message}); pages refresh on their normal schedule.`,
    );
  }
}
