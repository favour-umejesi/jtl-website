import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { PostArticle } from "@/components/sections/PostArticle";
import { getPostPreviewById } from "@/lib/payload-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft preview",
  robots: { index: false, follow: false },
};

type Args = { params: Promise<{ id: string }> };

/**
 * Preview of a news article exactly as it appears on the website, drafts
 * included — linked from the "Preview" button on the article edit screen
 * (see admin.preview in src/collections/Posts.ts). Any signed-in admin-panel
 * user (Admin or Staff) can open it; everyone else sees a sign-in prompt so
 * unpublished drafts never leak.
 */
export default async function NewsPreviewPage({ params }: Args) {
  const { id } = await params;
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold text-purple">
          Draft preview
        </h1>
        <p className="mt-4 text-ink-soft">
          Sign in to the JTL admin to preview this article, then reopen this
          link.
        </p>
      </div>
    );
  }

  const post = await getPostPreviewById(id);
  if (!post) notFound();

  return (
    <>
      <div className="bg-yellow px-6 py-2.5 text-center text-sm font-semibold text-purple">
        Draft preview — this is how the article will look on the News page
        once published.
      </div>
      <PostArticle post={post} backHref="/news" backLabel="Back to news" />
    </>
  );
}
