import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
} from "payload";
import { SITE_URL } from "./site-url";

/**
 * Editorial review workflow shared by News (posts), Blogs (newsletters) and
 * custom Emails.
 *
 * All three collections use Payload drafts. Users with the "Admin" title publish
 * directly. When a Staff user hits Publish, the save is downgraded to a
 * draft and every Admin is emailed a review link — content only goes live on
 * the site (news) or out to the mailing list (blogs, emails) once an Admin
 * publishes. If the document is already live, the published version stays
 * up, untouched, while the Staff edit waits for review.
 *
 * Collections using this need all three hooks: `holdStaffPublishForReview`
 * (beforeOperation), `requireAdminToPublish` (beforeChange) and
 * `notifyAdminsOnReviewRequest` (afterChange).
 */

type MaybeUser = { email?: string | null; role?: string | null } | null | undefined;

export const isAdminUser = (user: MaybeUser) => user?.role === "admin";

/**
 * beforeOperation: makes a non-admin's publish attempt on an existing
 * document a draft save. Changing `_status` alone (below) is not enough:
 * Payload would still write the edit over the live document — as a draft,
 * which took a published article off the website until an Admin republished
 * it. A draft save only adds a new version and leaves the live one alone.
 * (requireAdminToPublish still covers new documents, which have no live
 * version to protect.)
 */
export const holdStaffPublishForReview: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation !== "update") return args;
  const data = args.data as Record<string, unknown> | undefined;
  if (data?._status !== "published") return args;
  // Restoring a published document from the trash is not a publish attempt.
  if ("deletedAt" in data) return args;
  if (!req.user || isAdminUser(req.user as MaybeUser)) return args;
  // Payload only saves a draft when the status already says so at this
  // point, so the downgrade in requireAdminToPublish would come too late.
  req.context.reviewRequested = true;
  return { ...args, data: { ...data, _status: "draft" }, draft: true };
};

/**
 * beforeChange: turns a non-admin's publish attempt into a draft save and
 * flags the operation so the afterChange notifier emails the admins. Local
 * API calls without a user (seeds, internal updates) pass through untouched —
 * public writes are already blocked by collection access.
 */
export const requireAdminToPublish: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  context,
}) => {
  // Moving a document to the trash or restoring it (collections with
  // `trash: true`) is not a publish attempt — no review email for those.
  if (data?.deletedAt || originalDoc?.deletedAt) return data;
  if (data?._status === "published" && req.user && !isAdminUser(req.user as MaybeUser)) {
    data._status = "draft";
    context.reviewRequested = true;
  }
  // Drives the "In review" stage in the admin (see src/lib/stage.ts):
  // stamped when a Staff publish is held (here or, for documents that are
  // already live, in holdStaffPublishForReview), cleared once it is published.
  if (context.reviewRequested) data.reviewRequestedAt = new Date().toISOString();
  else if (data?._status === "published") data.reviewRequestedAt = null;
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
    // Custom emails are titled by their subject line.
    const title = String(doc.title ?? doc.subject ?? "Untitled");
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
          `editorial: "${title}" awaits review but no user has the Admin title`,
        );
        return;
      }

      const submitter = String((req.user as MaybeUser)?.email ?? "A staff member");
      const reviewUrl = `${SITE_URL}/admin/collections/${collection.slug}/${doc.id}`;
      await payload.sendEmail({
        to: emails,
        subject: `Review requested: "${title}"`,
        html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:8px;color:#1a1a1a;">
    <h1 style="color:#310061;font-size:20px;margin:0 0 12px;">A ${collection.label} is ready for review</h1>
    <p style="font-size:15px;line-height:1.6;"><strong>${submitter}</strong> submitted “${title}” for review. ${collection.onPublish}</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${reviewUrl}" style="background:#d7ad0d;color:#310061;padding:12px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Review and publish</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5;">Or paste this link into your browser:<br><a href="${reviewUrl}" style="color:#310061;">${reviewUrl}</a></p>
  </div>`,
      });
      payload.logger.info(
        `editorial: review request for "${title}" sent to ${emails.join(", ")}`,
      );
    } catch (err) {
      payload.logger.error({ err }, `editorial: failed to send review request for "${title}"`);
    }
  };
