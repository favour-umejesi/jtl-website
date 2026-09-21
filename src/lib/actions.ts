"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { addLikes } from "./likes";

/**
 * Add someone to the mailing list (the "Stay close to the work" form on the
 * Donate page). Runs server-side via the Payload local API, so the
 * subscribers collection needs no public write access. Re-subscribing an
 * existing email quietly succeeds — we don't reveal who is already on the list.
 * If staff had moved that subscriber to the trash, signing up again restores
 * them (their email is still taken, so creating a new row would fail).
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
      trash: true,
    });
    if (!docs.length) {
      await payload.create({
        collection: "subscribers",
        data: { name: name.trim(), email: trimmed, source: "website" },
      });
    } else if (docs[0].deletedAt) {
      await payload.update({
        collection: "subscribers",
        id: docs[0].id,
        data: { deletedAt: null },
        trash: true,
      });
    }
    return { ok: true, message: "Thank you for subscribing!" };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again later." };
  }
}

/**
 * Add or remove one like on a published article. Called from the client
 * LikeButton; runs server-side, so no public write endpoint is exposed.
 * Returns the new count, or null on failure.
 */
export async function likePost(
  slug: string,
  delta: number,
): Promise<number | null> {
  try {
    const payload = await getPayload({ config });
    return await addLikes(payload, slug, delta < 0 ? -1 : 1);
  } catch {
    return null;
  }
}
