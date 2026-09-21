import type { GlobalConfig } from "payload";
import { home, joinUs } from "@/lib/content";
import { revalidateSite } from "@/lib/revalidate";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site Settings",
  access: { read: () => true },
  hooks: {
    // Settings feed the footer on every page plus the impact stats, the
    // volunteer-form and donate links; purge the whole site on save so the
    // change is live on the next page load (see src/lib/revalidate.ts).
    afterChange: [
      ({ doc }) => {
        revalidateSite({ tags: ["settings"], paths: [["/", "layout"]] });
        return doc;
      },
    ],
    // The settings row in the database predates the Impact Metrics field, so
    // defaultValue never kicks in (it only applies to brand-new documents).
    // Filling the defaults on read means the admin form — and the site —
    // always shows the current metrics instead of an empty list; the first
    // save persists whatever the editor keeps.
    afterRead: [
      ({ doc }) => {
        if (!Array.isArray(doc?.impactStats) || doc.impactStats.length === 0) {
          doc.impactStats = home.impactStats.map((s) => ({ ...s }));
        }
        if (typeof doc?.volunteerFormUrl !== "string" || !doc.volunteerFormUrl.trim()) {
          doc.volunteerFormUrl = joinUs.formUrl;
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "impactStats",
      label: "Impact Metrics",
      type: "array",
      labels: { singular: "Metric", plural: "Metrics" },
      admin: {
        description:
          "Numbers under Our impact so far on the Home and Impact pages.",
      },
      defaultValue: home.impactStats.map((s) => ({ ...s })),
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "value",
              type: "text",
              required: true,
              admin: { width: "30%", placeholder: "$11K+" },
            },
            {
              name: "label",
              type: "text",
              required: true,
              admin: { width: "70%", placeholder: "raised for children's education" },
            },
          ],
        },
      ],
    },
    {
      name: "name",
      label: "Organisation name",
      type: "text",
      defaultValue: "Justice Through Literacy",
      admin: { description: "Shown in the website footer." },
    },
    // Not read anywhere on the site, so hidden: editing them changed nothing.
    // Kept in the schema so the stored values survive.
    {
      name: "tagline",
      type: "text",
      defaultValue: "Bridging the Nigerian Literacy Gap",
      admin: { hidden: true },
    },
    { name: "description", type: "textarea", admin: { hidden: true } },
    {
      type: "row",
      fields: [
        {
          name: "email",
          label: "Contact email",
          type: "text",
          admin: { width: "50%", description: "Shown in the website footer." },
        },
        {
          name: "phone",
          label: "Contact phone",
          type: "text",
          admin: { width: "50%", description: "Shown in the website footer." },
        },
      ],
    },
    {
      name: "location",
      type: "text",
      defaultValue: "Abuja, Nigeria",
      admin: { description: "Shown in the website footer." },
    },
    {
      name: "donateUrl",
      type: "text",
      label: "Donate URL (GoFundMe)",
      admin: { description: "Where the Donate buttons go." },
    },
    {
      name: "volunteerFormUrl",
      type: "text",
      label: "Volunteer application form URL",
      defaultValue: joinUs.formUrl,
      admin: {
        description:
          "Where the interest form button on the Join Us page goes.",
      },
    },
    {
      name: "socials",
      label: "Social media links",
      type: "group",
      admin: { description: "Full links, shown as icons in the website footer." },
      fields: [
        { name: "facebook", type: "text" },
        { name: "instagram", type: "text" },
        { name: "linkedin", type: "text" },
      ],
    },
  ],
};
