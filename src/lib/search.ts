/**
 * Lightweight client-side search. Builds an in-memory index from the site
 * content (no backend needed). Phase two can swap this for Payload search.
 */

import {
  home,
  about,
  ourStory,
  ourWork,
  impact,
  donate,
  joinUs,
  posts,
} from "./content";

export type SearchDoc = {
  title: string;
  href: string;
  excerpt: string;
  keywords: string;
};

const join = (parts: string[]) => parts.filter(Boolean).join(" ");

export const searchIndex: SearchDoc[] = [
  {
    title: "Home",
    href: "/",
    excerpt: home.hero.subhead,
    keywords: join([home.hero.title, home.hero.subhead, home.mission.statement, home.programs.title]),
  },
  {
    title: "About",
    href: "/about",
    excerpt: about.header.intro,
    keywords: join([about.header.title, about.header.intro, about.story.heading, ...about.missionVision.map((m) => m.body)]),
  },
  {
    title: "Our Story",
    href: "/our-story",
    excerpt: ourStory.header.intro,
    keywords: join([ourStory.header.title, ourStory.header.intro, ...ourStory.paragraphs]),
  },
  {
    title: "Our Work",
    href: "/our-work",
    excerpt: ourWork.header.intro,
    keywords: join([ourWork.header.title, ourWork.header.intro, ...ourWork.pillars.map((p) => `${p.title} ${p.body}`), ...ourWork.camps.map((c) => `${c.name} ${c.body}`)]),
  },
  {
    title: "Impact",
    href: "/impact",
    excerpt: impact.header.intro,
    keywords: join([impact.header.title, impact.header.intro, ...impact.outcomes.map((o) => `${o.title} ${o.body}`)]),
  },
  {
    title: "Donate",
    href: "/donate",
    excerpt: donate.header.body,
    keywords: join([donate.header.title, donate.header.body, ...donate.tiers.map((t) => `${t.amount} ${t.desc}`)]),
  },
  {
    title: "Join Us",
    href: "/join-us",
    excerpt: joinUs.header.intro,
    keywords: join([joinUs.header.title, joinUs.header.intro, ...joinUs.roles.map((r) => `${r.title} ${r.body}`)]),
  },
  {
    title: "News",
    href: "/news",
    excerpt: "Updates and stories from the field.",
    keywords: join(["news stories updates events", ...posts.map((p) => `${p.title} ${p.excerpt}`)]),
  },
  {
    title: "Blog",
    href: "/blog",
    excerpt: "All posts from Justice Through Literacy.",
    keywords: join(["blog posts articles", ...posts.map((p) => p.title)]),
  },
  ...posts.map((p) => ({
    title: p.title,
    href: "/blog",
    excerpt: p.excerpt,
    keywords: join([p.title, p.excerpt, p.author, p.date]),
  })),
  { title: "Terms & Conditions", href: "/terms", excerpt: "Our terms of use.", keywords: "terms conditions legal use" },
  { title: "Privacy Policy", href: "/privacy", excerpt: "How we handle your data.", keywords: "privacy policy data personal information" },
  { title: "Refund Policy", href: "/refund", excerpt: "About donation refunds.", keywords: "refund donation policy gofundme" },
];

export function searchSite(query: string, limit = 8): SearchDoc[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  return searchIndex
    .map((doc) => {
      const haystack = `${doc.title} ${doc.keywords}`.toLowerCase();
      const titleLc = doc.title.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (titleLc.includes(t)) score += 3;
        else if (haystack.includes(t)) score += 1;
      }
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.doc);
}
