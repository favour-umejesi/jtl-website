import type { Field } from "payload";

/**
 * "Stage": where a Website Article, Newsletter or Custom Email stands, in the
 * words editors use. Payload's own Status column only knows Draft and
 * Published, so a draft still being written looked exactly like one a Staff
 * member had submitted and an Admin needed to review — and "published" said
 * nothing about whether the email actually went out.
 *
 * Shown as a list column and at the top of the edit screen's sidebar (see
 * src/components/admin/StageStatus.tsx). `reviewRequestedAt` is stamped by
 * the editorial hooks (src/lib/editorial.ts).
 */

export type Stage = {
  label: string;
  /** What it means / what happens next, for the edit screen. */
  detail: string;
  tone: "neutral" | "waiting" | "done";
};

type StageDoc = {
  _status?: string | null;
  sentAt?: string | null;
  reviewRequestedAt?: string | null;
  sendToSubscribers?: boolean | null;
};

export function stageOf(collectionSlug: string, doc: StageDoc): Stage {
  const isArticle = collectionSlug === "posts";

  if (doc.sentAt) {
    return {
      label: "Sent",
      detail: "Emailed to subscribers and locked. To send a new version, click Duplicate.",
      tone: "done",
    };
  }
  // Checked before "published": a live article with a Staff edit waiting on
  // top of it is, for the people working on it, in review.
  if (doc.reviewRequestedAt && doc._status !== "published") {
    return {
      label: "In review",
      detail: isArticle
        ? "Waiting for an Admin to publish. Any version already on the website stays up until then."
        : "Waiting for an Admin to publish. Nothing is emailed until then.",
      tone: "waiting",
    };
  }
  if (doc._status === "published") {
    return isArticle
      ? { label: "Live", detail: "Visible on the website’s News page.", tone: "done" }
      : {
          label: "Published, not emailed",
          detail: "Published with Send to subscribers unticked. Nobody was emailed.",
          tone: "neutral",
        };
  }
  return {
    label: "Draft",
    detail: isArticle
      ? "Not on the website yet. Staff: click Publish to submit it for review. Admins: click Publish to put it on the website."
      : "Not sent yet. Staff: click Publish to submit it for review. Admins: click Publish to email it to subscribers.",
    tone: "neutral",
  };
}

/** Add both to the collection's fields, and "stage" to `admin.defaultColumns`. */
export const stageFields: Field[] = [
  {
    // Stores nothing: a list column and a sidebar box computed by stageOf.
    name: "stage",
    label: "Stage",
    type: "ui",
    admin: {
      position: "sidebar",
      components: {
        Cell: "/components/admin/StageStatus#StageCell",
        Field: "/components/admin/StageStatus#StageField",
      },
    },
  },
  {
    // Set when a Staff member's Publish is held for review, cleared when an
    // Admin publishes. Only the editorial hooks write it.
    name: "reviewRequestedAt",
    type: "date",
    access: { create: () => false, update: () => false },
    hooks: { beforeDuplicate: [() => null] },
    admin: { hidden: true, disableListColumn: true, disableListFilter: true },
  },
];
