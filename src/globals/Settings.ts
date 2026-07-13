import type { GlobalConfig } from "payload";
import { home } from "@/lib/content";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site Settings",
  access: { read: () => true },
  hooks: {
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
          'Shown under "Our impact so far" on the Home page and at the top of the Impact page. Value is the headline number (e.g. "$11K+", "20+", "3", "50%") — it counts up when scrolled into view. Changes appear on the site within a minute.',
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
    { name: "name", type: "text", defaultValue: "Justice Through Literacy" },
    { name: "tagline", type: "text", defaultValue: "Bridging the Nigerian Literacy Gap" },
    { name: "description", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "email", type: "text", admin: { width: "50%" } },
        { name: "phone", type: "text", admin: { width: "50%" } },
      ],
    },
    { name: "location", type: "text", defaultValue: "Abuja, Nigeria" },
    { name: "donateUrl", type: "text", label: "Donate URL (GoFundMe)" },
    {
      name: "socials",
      type: "group",
      fields: [
        { name: "facebook", type: "text" },
        { name: "instagram", type: "text" },
        { name: "linkedin", type: "text" },
      ],
    },
  ],
};
