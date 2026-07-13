import type { Access, CollectionConfig } from "payload";
import { SITE_URL } from "@/lib/site-url";
import { emailMasthead, escapeHtml } from "@/lib/email-branding";

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
  hooks: {
    beforeChange: [
      // The welcome email below includes the password the admin typed, so new
      // users know what to sign in with. The plaintext password only exists
      // during this create request; stashing it on req.context lets the
      // verification email (sent later in the same request) read it. It is
      // never stored anywhere.
      ({ data, operation, req }) => {
        if (operation === "create" && typeof data?.password === "string") {
          req.context.newUserPassword = data.password;
        }
        return data;
      },
    ],
  },
  // Email verification for new accounts. When an admin creates a user, Payload
  // emails them the branded welcome email below with their sign-in details and
  // verification link (requires SMTP configured in production, else it only
  // logs to the server console). Admins can also flip the "_verified" toggle
  // manually. Existing accounts must be marked verified once (done via a
  // one-off DB update) or they can't log in.
  auth: {
    verify: {
      generateEmailSubject: () =>
        "Your JTL admin account · Justice Through Literacy",
      generateEmailHTML: ({ req, token, user }) => {
        const name =
          (user as { name?: string })?.name?.split(" ")[0] || "there";
        const email = (user as { email?: string })?.email ?? "";
        const url = `${SITE_URL}/admin/users/verify/${token}`;
        // Present only when this email is sent from the create request (see
        // the beforeChange hook above); absent if verification is re-sent.
        const password = req.context.newUserPassword;
        const credentials =
          typeof password === "string"
            ? `
    <div style="background:#f7f3ff;border:1px solid #e0d3f5;border-radius:6px;padding:16px 20px;margin:20px 0;">
      <p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#310061;font-weight:bold;margin:0 0 10px;">Your sign-in details</p>
      <p style="font-size:15px;margin:0 0 6px;">Email: <strong>${escapeHtml(email)}</strong></p>
      <p style="font-size:15px;margin:0;">Password: <strong style="font-family:'Courier New',Courier,monospace;">${escapeHtml(password)}</strong></p>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#444;">You can keep using this password, or change it any time from <a href="${SITE_URL}/admin/account" style="color:#310061;">your account page</a> after signing in.</p>`
            : `
    <p style="font-size:14px;line-height:1.6;color:#444;">Sign in with your email address and the password you were given. Forgot it? <a href="${SITE_URL}/admin/forgot" style="color:#310061;">Reset it here</a>.</p>`;
        return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:8px;color:#1a1a1a;">
    ${emailMasthead()}
    <h1 style="color:#310061;font-size:22px;margin:0 0 12px;">Welcome to Justice Through Literacy</h1>
    <p style="font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)}, an account has been created for you on the JTL admin. First, confirm your email address to activate it.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#d7ad0d;color:#310061;padding:12px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">Verify my email</a>
    </p>
    ${credentials}
    <p style="font-size:13px;color:#666;line-height:1.5;">If the button doesn't work, paste this link into your browser:<br><a href="${url}" style="color:#310061;">${url}</a></p>
    <p style="font-size:12px;color:#999;margin-top:24px;">If you weren't expecting this, you can ignore this email.</p>
  </div>`;
      },
    },
  },
  fields: [
    { name: "name", type: "text" },
    {
      // "Admin" reviews and publishes news/blogs (see src/lib/editorial.ts);
      // "Staff" can create and edit drafts. Only the user managers above may
      // change someone's title, so staff can't promote themselves.
      name: "role",
      label: "Title",
      type: "select",
      required: true,
      defaultValue: "staff",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Staff", value: "staff" },
      ],
      access: {
        create: ({ req }) => isUserManager(req.user?.email),
        update: ({ req }) => isUserManager(req.user?.email),
      },
      admin: {
        description:
          "Admins review and publish news and blogs. Staff can write and edit drafts.",
      },
    },
  ],
};
