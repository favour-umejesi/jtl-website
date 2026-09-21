import type { GlobalConfig } from "payload";
import { donate, SPONSORSHIP_COST_PER_YEAR } from "@/lib/content";
import { revalidateSite } from "@/lib/revalidate";

export const DonatePage: GlobalConfig = {
  slug: "donate-page",
  label: "Donate Page",
  access: { read: () => true },
  admin: {
    description:
      "Links and child profiles on the Donate page. Changes go live when you save.",
  },
  hooks: {
    // The Donate page is prerendered and cached; purge it on save so the new
    // photos/bios show on the next page load instead of whenever the cache
    // happens to refresh (see src/lib/revalidate.ts).
    afterChange: [
      ({ doc }) => {
        revalidateSite({ tags: ["donate-page"], paths: ["/donate"] });
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "giveToJtlUrl",
      type: "text",
      label: '"Give to JTL" URL (GoFundMe)',
      admin: {
        description:
          "Where the Give to JTL button goes. Leave blank to use the Donate URL in Site Settings.",
      },
    },
    {
      name: "costPerYear",
      type: "number",
      label: "Sponsorship cost per year (USD)",
      min: 1,
      defaultValue: SPONSORSHIP_COST_PER_YEAR,
      admin: {
        description:
          "Cost of one school year. A child’s goal is this amount times their years needed.",
      },
    },
    {
      name: "children",
      type: "array",
      label: "Children seeking sponsorship",
      labels: { singular: "Child", plural: "Children" },
      admin: {
        description:
          "Profiles under Sponsor a Child. Leave the first name blank to show a Profile coming soon card.",
      },
      defaultValue: donate.children.map((c) => ({
        firstName: c.firstName,
        bio: c.bio,
        yearsNeeded: c.yearsNeeded,
        gofundmeUrl: c.gofundmeUrl,
      })),
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "firstName",
              type: "text",
              label: "First name",
              admin: { width: "50%" },
            },
            {
              name: "yearsNeeded",
              type: "number",
              label: "Years of education needed",
              min: 1,
              defaultValue: 6,
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "photo",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Optional. A placeholder shows until you add one.",
          },
        },
        {
          name: "bio",
          type: "textarea",
          label: "Short bio",
          admin: {
            description:
              "Two or three sentences. The full story goes on GoFundMe.",
          },
        },
        {
          name: "gofundmeUrl",
          type: "text",
          label: "GoFundMe URL",
          admin: { placeholder: "https://gofund.me/..." },
        },
      ],
    },
  ],
};
