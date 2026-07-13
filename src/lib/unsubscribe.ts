import crypto from "crypto";
import { SITE_URL } from "./site-url";

/**
 * Per-subscriber unsubscribe links. The token is an HMAC of the subscriber's
 * id and email signed with PAYLOAD_SECRET, so a link only works for the
 * subscriber it was mailed to — nobody can unsubscribe someone else by
 * guessing ids. No token is stored in the database.
 */

export function unsubscribeToken(
  id: number | string,
  email: string,
): string {
  return crypto
    .createHmac("sha256", process.env.PAYLOAD_SECRET || "")
    .update(`unsubscribe:${id}:${email.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function unsubscribeUrl(id: number | string, email: string): string {
  const params = new URLSearchParams({
    sid: String(id),
    token: unsubscribeToken(id, email),
  });
  return `${SITE_URL}/unsubscribe?${params.toString()}`;
}
