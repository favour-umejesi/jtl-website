import type { GlobalConfig } from "payload";
import { SUBSCRIBE_EMAIL_DEFAULTS } from "@/lib/newsletter-email";
import { SITE_URL } from "@/lib/site-url";

/**
 * The automatic email sent when someone joins the mailing list (see the
 * afterChange hook in src/collections/Subscribers.ts). Editable here so the
 * copy can change without a code deploy; the Preview button shows the email
 * exactly as a subscriber would receive it.
 */
export const SubscribeEmail: GlobalConfig = {
  slug: "subscribe-email",
  label: "Subscriber Welcome Email",
  admin: {
    description:
      "Sent automatically when someone subscribes on the website. In the body, blank lines start a new paragraph and {name} becomes the subscriber's first name. Use the Preview button to check it before saving copy changes.",
    preview: () => `${SITE_URL}/subscribe-email-preview`,
    components: {
      elements: {
        PreviewButton: {
          path: "/components/admin/PreviewLinkButton#PreviewLinkButton",
          clientProps: { href: "/subscribe-email-preview" },
        },
      },
    },
  },
  fields: [
    {
      name: "subject",
      type: "text",
      required: true,
      defaultValue: SUBSCRIBE_EMAIL_DEFAULTS.subject,
    },
    {
      name: "heading",
      type: "text",
      required: true,
      defaultValue: SUBSCRIBE_EMAIL_DEFAULTS.heading,
      admin: { description: "The big headline at the top of the email." },
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      defaultValue: SUBSCRIBE_EMAIL_DEFAULTS.body,
      admin: {
        rows: 10,
        description:
          "Blank lines separate paragraphs. {name} is replaced with the subscriber's first name.",
      },
    },
  ],
};
