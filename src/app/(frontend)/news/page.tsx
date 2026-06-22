import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";
import { news, newsEvent } from "@/lib/content";
import { getPosts } from "@/lib/payload-data";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await getPosts("news");
  return (
    <>
      <PageHeader {...news.header} />

      {/* Featured event */}
      <Section tone="soft">
        <div className="grid items-center gap-10 lg:grid-cols-[480px_1fr] lg:gap-14">
          <ImagePlaceholder src={newsEvent.image} className="aspect-[3/2] w-full" label={newsEvent.title} />
          <div className="space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-purple">
              {newsEvent.tag}
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight">
              {newsEvent.title}
            </h2>
            <p className="text-base leading-relaxed text-ink-soft">
              {newsEvent.body}
            </p>
          </div>
        </div>
      </Section>

      {/* Articles */}
      <Section tone="surface">
        <div className="space-y-10">
          <h2 className="text-3xl font-semibold md:text-4xl">Latest articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 6).map((post) => (
              <Link
                key={post.slug}
                href={`/news/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-none border border-dust/30 bg-surface-soft transition-shadow hover:shadow-md"
              >
                <ImagePlaceholder
                  src={post.image}
                  className="aspect-[16/9] w-full"
                  rounded="rounded-none"
                  label={post.title}
                />
                <div className="space-y-3 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.05em] text-purple">
                    {post.date}
                  </p>
                  <h3 className="font-heading text-xl font-semibold leading-tight group-hover:text-purple">
                    {post.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
