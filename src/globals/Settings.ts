import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site Settings",
  access: { read: () => true },
  fields: [
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
