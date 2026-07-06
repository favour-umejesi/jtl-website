import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { IconEllipsis } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/sections/LikeButton";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { getPosts } from "@/lib/payload-data";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <Section tone="soft">
      <Reveal>
        <h1 className="mb-10 font-heading text-4xl font-semibold text-purple">
          All Posts
        </h1>
      </Reveal>

      <Stagger className="space-y-7">
        {posts.map((post) => (
          <StaggerItem key={post.slug} hoverLift>
            <article className="grid overflow-hidden rounded-none border border-dust/30 bg-surface sm:grid-cols-[300px_1fr]">
            <Link href={`/blog/${post.slug}`} className="block">
              <ImagePlaceholder
                src={post.image}
                className="aspect-[3/2] w-full sm:aspect-auto sm:h-full"
                rounded="rounded-none"
                label={post.title}
              />
            </Link>

            <div className="flex flex-col justify-between gap-5 p-7">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar src={post.authorPhoto} name={post.author} className="size-9" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-ink">{post.author}</p>
                    <p className="text-ink-soft">
                      {post.date} &nbsp;·&nbsp; {post.readTime}
                    </p>
                  </div>
                  <IconEllipsis className="size-5 text-ink-soft" />
                </div>

                <h2 className="font-heading text-2xl font-semibold leading-tight text-purple">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-end border-t border-dust/20 pt-4">
                <LikeButton slug={post.slug} initialLikes={post.likes} />
              </div>
            </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
