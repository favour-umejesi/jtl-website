import { getPayload } from "payload";
import config from "@payload-config";

import { renderSubscribeConfirmationEmail } from "@/lib/newsletter-email";

/**
 * Preview of the automatic subscribe-confirmation email, using the copy saved
 * in the "Subscriber Welcome Email" global and a sample subscriber name.
 * Linked from that global's Preview button. Any signed-in admin-panel user
 * (Admin or Staff) can open it.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Sign in to the JTL admin to preview this email.", {
      status: 403,
    });
  }

  const copy = await payload
    .findGlobal({ slug: "subscribe-email" })
    .catch(() => null);

  const html = renderSubscribeConfirmationEmail({
    name: "Ada Example",
    heading: typeof copy?.heading === "string" ? copy.heading : undefined,
    body: typeof copy?.body === "string" ? copy.body : undefined,
  });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
