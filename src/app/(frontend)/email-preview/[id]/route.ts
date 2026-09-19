import { getPayload } from "payload";
import config from "@payload-config";

import {
  buildCustomEmailArgs,
  NAME_FALLBACK,
  renderCustomEmail,
  type CustomEmailLike,
} from "@/lib/custom-email";
import { escapeHtml } from "@/lib/email-branding";

/** Stand-in first name so the preview shows {name} filled in. */
const SAMPLE_NAME = "Ada";

/**
 * Preview of a custom email, exactly as it would be sent to subscribers.
 * Linked from the "Preview" button on the custom email edit screen (see
 * admin.preview in src/collections/Emails.ts). Any signed-in admin-panel user
 * can open it. Renders the latest saved version, drafts included, so nothing
 * needs to be sent to preview it. A banner above the email (not part of it)
 * shows the subject line and explains the sample name standing in for {name}.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Sign in to the JTL admin to preview emails.", {
      status: 403,
    });
  }

  let doc;
  try {
    doc = await payload.findByID({
      collection: "emails",
      id,
      draft: true,
      depth: 0,
    });
  } catch {
    doc = null;
  }
  if (!doc) return new Response("Email not found.", { status: 404 });

  const banner = `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;background:#310061;color:#ffffff;padding:14px 20px;text-align:center;">
    <strong>PREVIEW &mdash; nothing has been sent.</strong> Subject line: &ldquo;${escapeHtml(String(doc.subject ?? ""))}&rdquo;<br>
    {name} is shown here as &ldquo;${SAMPLE_NAME}&rdquo;. Each subscriber sees their own first name instead (or &ldquo;${NAME_FALLBACK}&rdquo; if we don&#39;t have their name).
  </div>`;
  const html =
    banner +
    renderCustomEmail({
      ...buildCustomEmailArgs(doc as CustomEmailLike, payload),
      name: SAMPLE_NAME,
    });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Always render the freshest draft, never a cached preview.
      "cache-control": "no-store",
    },
  });
}
