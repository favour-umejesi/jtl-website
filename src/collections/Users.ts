import type { Access, CollectionConfig } from "payload";

// Absolute site URL used in email links. Auto-resolves on Vercel (system env),
// overridable via NEXT_PUBLIC_SERVER_URL, and falls back to localhost in dev.
const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// Only these accounts may add or remove admin users. Everyone else can still
// log in and edit content — they just can't touch the Users collection beyond
// their own profile.
const USER_MANAGERS = ["umejesif@gmail.com", "educatenigeriankids@gmail.com"];

const isUserManager = (email?: string | null) =>
  Boolean(email && USER_MANAGERS.includes(email.toLowerCase()));

const canManageUsers: Access = ({ req: { user } }) =>
  isUserManager(user?.email);

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email" },
  access: {
    create: canManageUsers,
    delete: canManageUsers,
    // User managers can edit anyone; other users only their own profile
    // (name/password), never other accounts.
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (isUserManager(user.email)) return true;
      return { id: { equals: user.id } };
    },
    unlock: canManageUsers,
  },
  // Email verification for new accounts. When an admin creates a user, Payload
  // emails them the branded verification link below (requires SMTP configured
  // in production, else it only logs to the server console). Admins can also
  // flip the "_verified" toggle manually. Existing accounts must be marked
  // verified once (done via a one-off DB update) or they can't log in.
  auth: {
    verify: {
      generateEmailSubject: () =>
        "Verify your email · Justice Through Literacy",
      generateEmailHTML: ({ token, user }) => {
        const name =
          (user as { name?: string })?.name?.split(" ")[0] || "there";
        const url = `${SITE_URL}/admin/users/verify/${token}`;
        return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:8px;color:#1a1a1a;">
    <h1 style="color:#310061;font-size:22px;margin:0 0 12px;">Welcome to Justice Through Literacy</h1>
    <p style="font-size:15px;line-height:1.6;">Hi ${name}, an account has been created for you on the JTL admin. Confirm your email address to activate it.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#d7ad0d;color:#310061;padding:12px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Verify my email</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5;">Or paste this link into your browser:<br><a href="${url}" style="color:#310061;">${url}</a></p>
    <p style="font-size:12px;color:#999;margin-top:24px;">If you weren't expecting this, you can ignore this email.</p>
  </div>`;
      },
    },
  },
  fields: [
    { name: "name", type: "text" },
  ],
};
