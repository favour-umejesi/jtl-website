import { getPayload } from "payload";
import config from "@payload-config";

import {
  buildNewsletterArgs,
  renderNewsletterEmail,
  type BlogLike,
} from "@/lib/newsletter-email";

/**
 * Preview of a blog newsletter, exactly as it would be emailed to
 * subscribers. Linked from the "Preview" button on the blog edit screen
 * (see admin.preview in src/collections/Blogs.ts). Any signed-in admin-panel
 * user can open it — Staff preview their own drafts before requesting review,
 * Admins preview before publishing. Renders the latest saved version, drafts
 * included, so nothing needs to be published to preview it.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Sign in to the JTL admin to preview newsletters.", {
      status: 403,
    });
  }

  let doc;
  try {
    doc = await payload.findByID({
      collection: "blogs",
      id,
      draft: true,
      depth: 0,
    });
  } catch {
    doc = null;
  }
  if (!doc) return new Response("Blog not found.", { status: 404 });

  const html = renderNewsletterEmail(
    await buildNewsletterArgs(doc as BlogLike, payload),
  );
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Always render the freshest draft, never a cached preview.
      "cache-control": "no-store",
    },
  });
}
