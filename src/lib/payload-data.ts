/**
 * Data-access layer. Reads from Payload when content exists, otherwise falls
 * back to the static content in `content.ts`. This means the site always
 * renders — empty CMS, no DB, or build-time all degrade gracefully to the
 * existing copy. Used only from server components.
 */
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  testimonials as staticTestimonials,
  partners as staticPartners,
  posts as staticPosts,
  about,
  home,
  joinUs,
  type Post,
} from "./content";
import { org } from "./site";

/** Match a post author to a team member's head-shot, if there is one. */
function authorPhotoFor(name: string): string | undefined {
  const match = about.team.find(
    (m) => m.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return match?.photo || undefined;
}

export type Testimonial = { quote: string; name: string; role: string };
export type Partner = { name: string; logo: string; url?: string };
export type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  status: "current" | "past";
};
export type ListPost = Post & { likes: number };

function mediaUrl(value: unknown): string {
  if (value && typeof value === "object" && "url" in value) {
    return (value as { url?: string }).url ?? "";
  }
  return "";
}

function fmtDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "testimonials",
      limit: 50,
      depth: 0,
    });
    if (docs.length) {
      return docs.map((d: Record<string, unknown>) => ({
        quote: String(d.quote ?? ""),
        name: String(d.name ?? ""),
        role: String(d.role ?? ""),
      }));
    }
  } catch {
    // fall through to static content
  }
  return staticTestimonials;
}

export async function getPartners(): Promise<Partner[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "partners",
      limit: 50,
      depth: 1,
    });
    if (docs.length) {
      const mapped = docs
        .map((d: Record<string, unknown>) => ({
          name: String(d.name ?? ""),
          logo: mediaUrl(d.logo),
          url: d.url ? String(d.url) : undefined,
        }))
        .filter((p) => p.logo);
      if (mapped.length) return mapped;
    }
  } catch {
    // fall through
  }
  return staticPartners;
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "team-members",
      limit: 100,
      depth: 1,
      sort: "order",
    });
    if (docs.length) {
      return docs.map((d: Record<string, unknown>) => ({
        name: String(d.name ?? ""),
        role: String(d.role ?? ""),
        photo: mediaUrl(d.photo) || undefined,
        status: d.status === "past" ? ("past" as const) : ("current" as const),
      }));
    }
  } catch {
    // fall through
  }
  return about.team.map((m) => ({ ...m, status: "current" as const }));
}

function mapPost(d: Record<string, unknown>): ListPost {
  // Prefer the team-member picked in the "Author" dropdown (populated at
  // depth 2: writer -> photo); fall back to the legacy free-text author and
  // the static team-photo match for rows created before the dropdown.
  const writer =
    d.writer && typeof d.writer === "object"
      ? (d.writer as { name?: unknown; photo?: unknown })
      : null;
  const author = String(writer?.name ?? d.author ?? "");
  return {
    slug: String(d.slug ?? ""),
    title: String(d.title ?? ""),
    author,
    authorPhoto:
      (writer ? mediaUrl(writer.photo) : "") || authorPhotoFor(author),
    date: fmtDate(d.date),
    readTime: String(d.readTime ?? ""),
    excerpt: String(d.excerpt ?? ""),
    image: mediaUrl(d.image),
    likes: typeof d.likes === "number" ? d.likes : 0,
  };
}

export async function getPosts(category?: "blog" | "news"): Promise<ListPost[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      limit: 100,
      // depth 2 so writer (team member) arrives with its photo populated
      depth: 2,
      sort: "-date",
      // Drafts awaiting review must never reach the public site.
      where: {
        and: [
          { _status: { equals: "published" } },
          ...(category ? [{ category: { equals: category } }] : []),
        ],
      },
    });
    if (docs.length) return docs.map(mapPost);
  } catch {
    // fall through
  }
  return staticPosts.map((p) => ({ ...p, likes: 0 }));
}

export type PostDetail = ListPost & { content?: unknown };

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      // depth 2 so writer (team member) arrives with its photo populated
      depth: 2,
      limit: 1,
    });
    if (docs.length) {
      const d = docs[0] as Record<string, unknown>;
      return { ...mapPost(d), content: d.content };
    }
  } catch {
    // fall through
  }
  const fallback = staticPosts.find((p) => p.slug === slug);
  return fallback ? { ...fallback, likes: 0 } : null;
}

/**
 * A post by id including its latest draft — for the admin Preview button
 * only (see src/app/(frontend)/news-preview). Never call this from public
 * pages: it bypasses the published-only filter.
 */
export async function getPostPreviewById(
  id: string,
): Promise<PostDetail | null> {
  try {
    const payload = await getPayload({ config });
    const d = (await payload.findByID({
      collection: "posts",
      id,
      draft: true,
      // depth 2 so writer (team member) arrives with its photo populated
      depth: 2,
    })) as Record<string, unknown> | null;
    if (!d) return null;
    return { ...mapPost(d), content: d.content };
  } catch {
    return null;
  }
}

export type ImpactStat = { value: string; label: string };

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  donateUrl: string;
  /** "Fill out the interest form" button target on the Join Us page. */
  volunteerFormUrl: string;
  socials: { facebook: string; instagram: string; linkedin: string };
  /** "Our impact so far" metrics on the Home and Impact pages. */
  impactStats: ImpactStat[];
};

const staticImpactStats = (): ImpactStat[] =>
  home.impactStats.map((s) => ({ ...s }));

function mapImpactStats(value: unknown): ImpactStat[] {
  const rows = Array.isArray(value) ? value : [];
  const stats = rows
    .map((r: Record<string, unknown>) => ({
      value: String(r?.value ?? "").trim(),
      label: String(r?.label ?? "").trim(),
    }))
    .filter((s) => s.value && s.label);
  return stats.length ? stats : staticImpactStats();
}

export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const payload = await getPayload({ config });
      const s = (await payload.findGlobal({ slug: "settings" })) as Record<string, unknown>;
      const socials = (s.socials ?? {}) as Record<string, string>;
      const pick = (v: unknown, fallback: string) =>
        typeof v === "string" && v.trim() ? v : fallback;
      return {
        name: pick(s.name, org.name),
        tagline: pick(s.tagline, org.tagline),
        description: pick(s.description, org.description),
        email: pick(s.email, org.email),
        phone: pick(s.phone, org.phone),
        location: pick(s.location, org.location),
        donateUrl: pick(s.donateUrl, org.donateUrl),
        volunteerFormUrl: pick(s.volunteerFormUrl, joinUs.formUrl),
        socials: {
          facebook: pick(socials.facebook, org.socials.facebook),
          instagram: pick(socials.instagram, org.socials.instagram),
          linkedin: pick(socials.linkedin, org.socials.linkedin),
        },
        impactStats: mapImpactStats(s.impactStats),
      };
    } catch {
      return {
        name: org.name,
        tagline: org.tagline,
        description: org.description,
        email: org.email,
        phone: org.phone,
        location: org.location,
        donateUrl: org.donateUrl,
        volunteerFormUrl: joinUs.formUrl,
        socials: { ...org.socials },
        impactStats: staticImpactStats(),
      };
    }
  },
  ["site-settings"],
  { revalidate: 60, tags: ["settings"] },
);

export async function getPostSlugs(): Promise<string[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      limit: 200,
      depth: 0,
      where: { _status: { equals: "published" } },
    });
    if (docs.length) return docs.map((d: Record<string, unknown>) => String(d.slug ?? ""));
  } catch {
    // fall through
  }
  return staticPosts.map((p) => p.slug);
}
