"use server";

import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Increment/decrement a post's like count. Called from the client LikeButton.
 * Runs server-side via the Payload local API (overrideAccess), so no public
 * write endpoint is exposed. Returns the new count, or null on failure.
 */
/**
 * Add someone to the mailing list (the "Stay close to the work" form on the
 * Donate page). Runs server-side via the Payload local API, so the
 * subscribers collection needs no public write access. Re-subscribing an
 * existing email quietly succeeds — we don't reveal who is already on the list.
 */
export async function subscribeToMailingList(
  name: string,
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "subscribers",
      where: { email: { equals: trimmed } },
      limit: 1,
      depth: 0,
    });
    if (!docs.length) {
      await payload.create({
        collection: "subscribers",
        data: { name: name.trim(), email: trimmed, source: "website" },
      });
    }
    return { ok: true, message: "Thank you for subscribing!" };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again later." };
  }
}

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
