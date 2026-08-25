import type { GlobalConfig } from "payload";
import { donate, SPONSORSHIP_COST_PER_YEAR } from "@/lib/content";

export const DonatePage: GlobalConfig = {
  slug: "donate-page",
  label: "Donate Page",
  access: { read: () => true },
  admin: {
    description:
      "The links and child sponsorship profiles on the Donate page. Changes appear on the site within a minute.",
  },
  fields: [
    {
      name: "giveToJtlUrl",
      type: "text",
      label: '"Give to JTL" URL (GoFundMe)',
      admin: {
        description:
          'Where the "Give to JTL" button sends people. Leave empty to use the site-wide Donate URL from Site Settings.',
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
          "Cost of one year of elementary education. Each child's sponsorship goal is years of education needed × this amount.",
      },
    },
    {
      name: "children",
      type: "array",
      label: "Children seeking sponsorship",
      labels: { singular: "Child", plural: "Children" },
      admin: {
        description:
          'The profiles under "Sponsor a Child". Each card shows the photo (or a placeholder avatar while there is none), the short bio, the sponsorship goal, and a "Learn more" button that opens the child\'s GoFundMe page. Leaving the first name empty publishes an anonymous "profile coming soon" card.',
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
            description: "Optional — a placeholder avatar shows until a photo is added.",
          },
        },
        {
          name: "bio",
          type: "textarea",
          label: "Short bio",
          admin: {
            description:
              "2–3 sentences for the card; the full story lives on the GoFundMe page.",
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
