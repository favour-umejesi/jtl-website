import crypto from "crypto";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

import { BRAND, emailMasthead, escapeHtml } from "@/lib/email-branding";
import { unsubscribeToken } from "@/lib/unsubscribe";

/**
 * Unsubscribe endpoint linked from every subscriber email.
 *
 * GET shows a branded confirmation page with a button — it never deletes,
 * because email clients and security scanners prefetch GET links, and that
 * must not silently unsubscribe anyone. POST (the confirm button, and the
 * RFC 8058 one-click unsubscribe that Gmail/Yahoo send) verifies the signed
 * token and deletes the subscriber from the database.
 */

function page(title: string, message: string, extra = ""): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(title)} · Justice Through Literacy</title>
</head>
<body style="margin:0;background:${BRAND.paper};">
  <div style="max-width:520px;margin:0 auto;padding:36px 20px;color:${BRAND.ink};text-align:center;">
    ${emailMasthead()}
    <p style="font-family:${BRAND.mono};font-size:12px;letter-spacing:.35em;text-transform:uppercase;color:${BRAND.purple};margin:0 0 22px;">Justice Through Literacy</p>
    <h1 style="font-family:${BRAND.serif};font-size:26px;color:${BRAND.purple};margin:0 0 14px;">${escapeHtml(title)}</h1>
    <p style="font-family:${BRAND.serif};font-size:16px;line-height:1.7;color:${BRAND.inkSoft};margin:0 0 22px;">${escapeHtml(message)}</p>
    ${extra}
  </div>
</body>
</html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

type Verified =
  | { ok: true; id: number | string; payload: Payload }
  | { ok: false; response: Response };

async function verify(request: Request): Promise<Verified> {
  const url = new URL(request.url);
  const sid = url.searchParams.get("sid") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!sid || !token) {
    return {
      ok: false,
      response: page(
        "This link isn't valid",
        "The unsubscribe link is incomplete. Please use the link from the footer of one of our emails.",
      ),
    };
  }

  const payload = await getPayload({ config });
  let subscriber: { id: number | string; email?: unknown } | null = null;
  try {
    subscriber = await payload.findByID({ collection: "subscribers", id: sid });
  } catch {
    subscriber = null;
  }
  if (!subscriber) {
    // Already deleted (or never existed) — from the visitor's point of view
    // the job is done, so say so instead of erroring.
    return {
      ok: false,
      response: page(
        "You're unsubscribed",
        "This email address is no longer on our mailing list.",
      ),
    };
  }

  const expected = unsubscribeToken(subscriber.id, String(subscriber.email ?? ""));
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return {
      ok: false,
      response: page(
        "This link isn't valid",
        "The unsubscribe link doesn't match this subscriber. Please use the link from the footer of one of our emails.",
      ),
    };
  }
  return { ok: true, id: subscriber.id, payload };
}

export async function GET(request: Request) {
  const result = await verify(request);
  if (!result.ok) return result.response;

  const action = new URL(request.url).search; // keep sid+token on the form post
  return page(
    "Sorry to see you go",
    "Click the button below to stop receiving newsletters and updates from Justice Through Literacy.",
    `<form method="post" action="${escapeHtml(action)}" style="margin:0;">
       <button type="submit" style="font-family:${BRAND.mono};background:${BRAND.yellow};color:${BRAND.purple};padding:13px 28px;border:none;border-radius:4px;font-size:15px;font-weight:bold;cursor:pointer;">Yes, unsubscribe me</button>
     </form>`,
  );
}

export async function POST(request: Request) {
  const result = await verify(request);
  if (!result.ok) return result.response;

  try {
    await result.payload.delete({ collection: "subscribers", id: result.id });
  } catch {
    return page(
      "Something went wrong",
      "We couldn't process the unsubscribe just now. Please try the link again in a few minutes.",
    );
  }
  return page(
    "You've been unsubscribed",
    "You won't receive any more newsletters or updates from us. Resubscribe any time on our website — you're always welcome back.",
  );
}
