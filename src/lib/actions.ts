"use server";

import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Increment/decrement a post's like count. Called from the client LikeButton.
 * Runs server-side via the Payload local API (overrideAccess), so no public
 * write endpoint is exposed. Returns the new count, or null on failure.
 */
export async function likePost(
  slug: string,
  delta: number,
): Promise<number | null> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    if (!docs.length) return null;

    const post = docs[0] as { id: string | number; likes?: number };
    const current = typeof post.likes === "number" ? post.likes : 0;
    const next = Math.max(0, current + delta);

    await payload.update({
      collection: "posts",
      id: post.id,
      data: { likes: next },
    });
    return next;
  } catch {
    return null;
  }
}
