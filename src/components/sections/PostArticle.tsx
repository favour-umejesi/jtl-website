import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { IconChevronLeft } from "@/components/ui/icons";
import { LikeButton } from "@/components/sections/LikeButton";
import type { PostDetail } from "@/lib/payload-data";

export function PostArticle({
  post,
  backHref,
  backLabel,
}: {
  post: PostDetail;
  backHref: string;
  backLabel: string;
}) {
  const meta = [post.author, post.date, post.readTime].filter(Boolean).join("  ·  ");
  const hasBody =
    !!post.content && typeof post.content === "object" && "root" in post.content;

  return (
    <>
      <Section tone="purple">
        <div className="space-y-5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow hover:underline"
          >
            <IconChevronLeft className="size-4" />
            {backLabel}
          </Link>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] md:text-5xl">
            {post.title}
          </h1>
          {meta && <Eyebrow className="text-dust">{meta}</Eyebrow>}
        </div>
      </Section>

      <Section tone="surface">
        <article className="mx-auto max-w-3xl space-y-8">
          {post.excerpt && (
            <p className="text-xl leading-relaxed text-ink md:text-2xl">{post.excerpt}</p>
          )}

          {post.image && (
            <ImagePlaceholder
              src={post.image}
              rounded="rounded-none"
              className="aspect-[16/9] w-full"
              label={post.title}
            />
          )}

          {hasBody ? (
            <div className="space-y-4 text-base leading-relaxed text-ink-soft [&_a]:text-purple [&_a]:underline [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
              <RichText data={post.content as Parameters<typeof RichText>[0]["data"]} />
            </div>
          ) : (
            <p className="text-sm italic text-ink-soft">
              The full article is being written. Check back soon.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-dust/20 pt-6">
            <LikeButton slug={post.slug} initialLikes={post.likes} />
            <Link
              href={backHref}
              className="text-sm font-semibold text-purple hover:underline"
            >
              {backLabel}
            </Link>
          </div>
        </article>
      </Section>
    </>
  );
}
