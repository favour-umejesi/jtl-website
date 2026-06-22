/**
 * Site-wide configuration: organization details, navigation, and footer.
 *
 * This module is the single source of truth for global content. When Payload
 * is added (phase two), these exports get replaced by a `Settings` global and
 * a `Navigation` global fetched from the CMS, components consuming them won't
 * need to change.
 */

export type Featured = { title: string; href: string; image?: string };
export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
  /** Shown in the mega-menu panel for top-level items that have one. */
  blurb?: string;
  featured?: Featured;
};

export const org = {
  name: "Justice Through Literacy",
  shortName: "JTL",
  tagline: "Bridging the Nigerian Literacy Gap",
  description:
    "Justice Through Literacy promotes access to education for children in Nigeria's rural communities through foundational camps, full scholarships, and continuous mentorship.",
  email: "educatenigeriankids@gmail.com",
  phone: "1-413-472-9711",
  location: "Abuja, Nigeria",
  donateUrl:
    "https://www.gofundme.com/f/help-a-child-access-education-with-justice-through-literacy",
  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

export const mainNav: NavLink[] = [
  {
    label: "About",
    href: "/about",
    blurb:
      "Who we are, the story behind Justice Through Literacy, and the people making it happen.",
    children: [{ label: "Our Story", href: "/our-story" }],
    featured: {
      title: "Read our full story",
      href: "/our-story",
      image: "/images/nav-featured-story.jpg",
    },
  },
  { label: "Our Work", href: "/our-work" },
  { label: "Impact", href: "/impact" },
  {
    label: "News",
    href: "/news",
    blurb: "The latest from the field, stories, camp updates, and our blog.",
    children: [{ label: "Blog", href: "/blog" }],
    featured: {
      title: "From the Peace Camp to the classroom",
      href: "/news",
      image: "/images/nav-featured-news.jpg",
    },
  },
  {
    label: "Join Us",
    href: "/join-us",
    blurb:
      "Lend your skills or your support, there's a place for everyone at JTL.",
    children: [{ label: "Donate", href: "/donate" }],
    featured: {
      title: "Support a child today",
      href: "/donate",
      image: "/images/nav-featured-give.jpg",
    },
  },
];

export const legalNav: NavLink[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Work", href: "/our-work" },
      { label: "Impact", href: "/impact" },
      { label: "News", href: "/news" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { label: "Donate", href: "/donate" },
      { label: "Join Us", href: "/join-us" },
      { label: "Our Story", href: "/our-story" },
    ],
  },
];
