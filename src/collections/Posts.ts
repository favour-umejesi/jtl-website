import type { CollectionConfig } from "payload";
import { notifyAdminsOnReviewRequest, requireAdminToPublish } from "@/lib/editorial";

export const Posts: CollectionConfig = {
  slug: "posts",
  // News is public on the site; blogs live in their own collection and are
  // emailed to subscribers instead (see Blogs.ts).
  labels: { singular: "News Article", plural: "News" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "date", "_status"],
    description:
      "Articles shown on the public News page. Staff drafts go live only after an Admin reviews and publishes them — hitting Publish as Staff emails the admins for review.",
  },
  versions: { drafts: true },
  // Visitors only ever see published articles; logged-in editors see drafts.
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
  },
  hooks: {
    beforeChange: [requireAdminToPublish],
    afterChange: [
      notifyAdminsOnReviewRequest({
        slug: "posts",
        label: "news article",
        onPublish: "Publishing it will make it visible on the website's News page.",
      }),
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL-friendly id, e.g. peace-camp-jtl-2025" },
    },
    {
      // Legacy field from when news and blogs shared this collection. Hidden
      // from the editor; kept so existing rows and the news-page filter keep
      // working without a schema migration.
      name: "category",
      type: "select",
      defaultValue: "news",
      admin: { hidden: true },
      options: [
        { label: "Blog", value: "blog" },
        { label: "News", value: "news" },
      ],
    },
    { name: "author", type: "text" },
    { name: "date", type: "date" },
    { name: "readTime", type: "text", admin: { description: 'e.g. "3 min read"' } },
    { name: "excerpt", type: "textarea", admin: { description: "Lead paragraph shown above the hero image on the article page. The full write-up goes in Content below the image." } },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "content", type: "richText" },
    {
      name: "likes",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Reader likes (updated automatically from the site).",
        position: "sidebar",
      },
    },
  ],
};
