import type { CollectionConfig } from "payload";
import {
  holdStaffPublishForReview,
  notifyAdminsOnReviewRequest,
  requireAdminToPublish,
} from "@/lib/editorial";
import { keepCurrentLikes } from "@/lib/likes";
import { SITE_URL } from "@/lib/site-url";
import { stageFields } from "@/lib/stage";
import { rowActionsField, trashForAllDeleteForAdmins } from "@/lib/trash";

/** "Peace Camp — JTL 2025!" -> "peace-camp-jtl-2025" */
const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const Posts: CollectionConfig = {
  slug: "posts",
  // News is public on the site; blogs live in their own collection and are
  // emailed to subscribers instead (see Blogs.ts). The label spells out that
  // these are the website's articles; the "posts" slug stays so the database
  // tables keep their names.
  labels: { singular: "Website Article", plural: "Website Articles (News)" },
  // Soft delete with a Trash tab and Restore (see src/lib/trash.ts). A trashed
  // article disappears from the website until it is restored.
  trash: true,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "writer", "date", "stage", "rowActions"],
    description:
      "Articles on the website’s News page. They are not emailed to anyone.",
    // "Preview" button in the edit view: shows the article with the real
    // website UI, rendered from the latest saved draft.
    preview: (doc) => (doc?.id ? `${SITE_URL}/news-preview/${doc.id}` : null),
    components: {
      edit: {
        // The default preview button is icon-only; this one says "Preview".
        PreviewButton: {
          path: "/components/admin/PreviewLinkButton#PreviewLinkButton",
          clientProps: { basePath: "/news-preview" },
        },
      },
    },
  },
  versions: { drafts: true },
  // Visitors only ever see published articles that are not in the trash;
  // logged-in editors see drafts and the trash.
  access: {
    read: ({ req }) =>
      req.user
        ? true
        : { _status: { equals: "published" }, deletedAt: { exists: false } },
    delete: trashForAllDeleteForAdmins,
  },
  hooks: {
    beforeOperation: [holdStaffPublishForReview],
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
      label: "Web address (slug)",
      type: "text",
      // Not `required`: the admin form would reject a blank box before the
      // hook below gets to fill it in. The hook means it is never empty.
      unique: true,
      hooks: {
        // Editors shouldn't have to hand-write a URL: blank means "make it
        // from the title". Whatever they do type is tidied into URL form.
        beforeValidate: [
          ({ data, value }) => {
            const source =
              typeof value === "string" && value.trim() ? value : data?.title;
            return typeof source === "string" ? slugify(source) : value;
          },
        ],
      },
      admin: {
        description:
          "The end of the article’s link. Leave blank to create it from the title. Do not change it after publishing or shared links will break.",
      },
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
    {
      // Dropdown of team members. Supplies both the byline name and the
      // author photo shown on the article page.
      name: "writer",
      label: "Author",
      type: "relationship",
      relationTo: "team-members",
      admin: {
        description:
          "Choose from Team Members.",
      },
    },
    {
      // Legacy free-text author from before the dropdown. Hidden from the
      // editor and the list-view column/filter pickers; kept so existing rows
      // keep their byline until a writer is set.
      name: "author",
      type: "text",
      admin: { hidden: true, disableListColumn: true, disableListFilter: true },
    },
    {
      name: "date",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: { description: "Newest articles show first." },
    },
    { name: "readTime", label: "Reading time", type: "text", admin: { description: "Example: 3 min read" } },
    { name: "excerpt", label: "Introduction", type: "textarea", admin: { description: "Opening paragraph, shown above the main image." } },
    {
      name: "image",
      label: "Main image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Large image near the top of the article." },
    },
    { name: "content", type: "richText" },
    {
      name: "likes",
      type: "number",
      defaultValue: 0,
      // Counted directly in the database (see src/lib/likes.ts).
      hooks: { beforeChange: [keepCurrentLikes] },
      admin: {
        readOnly: true,
        description: "Updated automatically.",
        position: "sidebar",
      },
    },
    rowActionsField,
    ...stageFields,
  ],
};
