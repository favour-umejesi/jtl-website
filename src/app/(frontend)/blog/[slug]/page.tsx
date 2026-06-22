import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/sections/PostArticle";
import { getPostBySlug } from "@/lib/payload-data";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Post" };
}

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return <PostArticle post={post} backHref="/blog" backLabel="All posts" />;
}
