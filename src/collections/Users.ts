import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email" },
  // Email verification for new accounts. When an admin creates a user, Payload
  // emails them a verification link (needs SMTP configured); admins can also
  // flip the "_verified" toggle manually. Existing accounts must be marked
  // verified once (done via a one-off DB update) or they can't log in.
  auth: {
    verify: true,
  },
  fields: [
    { name: "name", type: "text" },
  ],
};
