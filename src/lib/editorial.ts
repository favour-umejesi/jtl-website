import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
} from "payload";
import { SITE_URL } from "./site-url";

/**
 * Editorial review workflow shared by News (posts) and Blogs.
 *
 * Both collections use Payload drafts. Users with the "Admin" title publish
 * directly. When a Staff user hits Publish, the save is downgraded to a
 * draft and every Admin is emailed a review link — content only goes live on
 * the site (news) or out to the mailing list (blogs) once an Admin publishes.
 */

type MaybeUser = { email?: string | null; role?: string | null } | null | undefined;

export const isAdminUser = (user: MaybeUser) => user?.role === "admin";

/**
 * beforeChange: turns a non-admin's publish attempt into a draft save and
 * flags the operation so the afterChange notifier emails the admins. Local
 * API calls without a user (seeds, internal updates) pass through untouched —
 * public writes are already blocked by collection access.
 */
export const requireAdminToPublish: CollectionBeforeChangeHook = async ({
  data,
  req,
  context,
}) => {
  if (data?._status === "published" && req.user && !isAdminUser(req.user as MaybeUser)) {
    data._status = "draft";
    context.reviewRequested = true;
  }
  return data;
};

/**
 * afterChange: when a Staff publish attempt was downgraded, email every
 * Admin-titled user a link to review the draft.
 */
export const notifyAdminsOnReviewRequest = (
  collection: { slug: string; label: string; onPublish: string },
): CollectionAfterChangeHook =>
  async ({ doc, req, context }) => {
    if (!context.reviewRequested) return;
    const { payload } = req;
    try {
      const { docs } = await payload.find({
        collection: "users",
        where: { role: { equals: "admin" } },
        limit: 20,
        depth: 0,
      });
      const emails = docs.map((u) => String(u.email ?? "").trim()).filter(Boolean);
      if (!emails.length) {
        payload.logger.warn(
          `editorial: "${doc.title}" awaits review but no user has the Admin title`,
        );
        return;
      }

      const submitter = String((req.user as MaybeUser)?.email ?? "A staff member");
      const reviewUrl = `${SITE_URL}/admin/collections/${collection.slug}/${doc.id}`;
      await payload.sendEmail({
        to: emails,
        subject: `Review requested: "${doc.title}"`,
        html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:8px;color:#1a1a1a;">
    <h1 style="color:#310061;font-size:20px;margin:0 0 12px;">A ${collection.label} is ready for review</h1>
    <p style="font-size:15px;line-height:1.6;"><strong>${submitter}</strong> submitted “${doc.title}” for review. ${collection.onPublish}</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${reviewUrl}" style="background:#d7ad0d;color:#310061;padding:12px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Review and publish</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5;">Or paste this link into your browser:<br><a href="${reviewUrl}" style="color:#310061;">${reviewUrl}</a></p>
  </div>`,
      });
      payload.logger.info(
        `editorial: review request for "${doc.title}" sent to ${emails.join(", ")}`,
      );
    } catch (err) {
      payload.logger.error({ err }, `editorial: failed to send review request for "${doc.title}"`);
    }
  };
