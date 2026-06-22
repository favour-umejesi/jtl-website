import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "date", "category"],
  },
  access: { read: () => true },
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
      name: "category",
      type: "select",
      defaultValue: "blog",
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
