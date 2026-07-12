/**
 * Page content. Mirrors the approved Pencil designs and the live site copy.
 *
 * Phase two (Payload): each export below maps to a CMS document.
 * `home`/`about`/etc. become a `Pages` collection with layout blocks,
 * `posts` becomes a `Posts` collection, `testimonials`/`partners` become
 * their own collections. Components reading this content stay unchanged.
 */

export type ProgramCard = {
  title: string;
  body: string;
  image: string;
  /** Optional call-to-action rendered at the bottom of the card. */
  link?: { label: string; href: string };
};

export const home = {
  hero: {
    eyebrow: "Bridging the Nigerian Literacy Gap",
    title: "Every child deserves to learn, and shape their own future",
    subhead:
      "Justice Through Literacy promotes access to education for children in Nigeria's rural communities through foundational camps, full scholarships, and continuous mentorship.",
    image: "/images/hero.jpg",
    ctas: [
      { label: "Donate now", href: "/donate", variant: "primary" as const },
      { label: "How we work", href: "/our-work", variant: "outline" as const },
    ],
  },
  challenge: {
    eyebrow: "The Challenge",
    number: "10.5M",
    unit: "children out of school in Nigeria",
    statement:
      "Not because they lack ability or curiosity, but because opportunity has been kept out of reach.",
    hope: "Across rural Nigeria, many children never sit within the walls of a classroom. We are changing that!",
  },
  mission: {
    eyebrow: "Who We Are",
    statement:
      "Every child deserves access to quality education, regardless of where they live. At JTL, we make that possible through camps, scholarships, and mentorship.",
  },
  video: {
    eyebrow: "See It In Action",
    title: "Our 2025 Peace Camp cohort",
    body: "These are the children who completed our 2025 Peace Camp in Kwali, ready for the next step toward school.",
    src: "/videos/see-jtl-in-action.mp4",
    poster: "/images/see-jtl-in-action-poster.jpg",
    link: {
      label: "Learn more about the Peace Camp",
      href: "/news/peace-camp-jtl-2025",
    },
  },
  programs: {
    eyebrow: "What We Do",
    title: "Our three-prong approach",
    cards: [
      {
        title: "Mindset Shift + Tutorial Camps",
        body: "JTL scholars start in introductory camps in math, English, and programming, with parents engaged to shift attitudes toward education. Our first Peace Camp in Kwali ended with 14 children awarded scholarships.",
        image: "/images/program-1.jpg",
      },
      {
        title: "Sponsor to School",
        body: "After camp graduation, we connect children with donors and partner schools to fund elementary education: the critical bridge between literacy and illiteracy.",
        image: "/images/sponsor.jpg",
        link: { label: "Sponsor a child now", href: "/donate" },
      },
      {
        title: "Support in School",
        body: "Dedicated mentors keep us connected through elementary school, and donors stay updated on each sponsored child's progress.",
        image: "/images/support-in-school.jpg",
      },
    ] as ProgramCard[],
  },
  impactStats: [
    { value: "8", label: "volunteers engaged" },
    { value: "20+", label: "children sponsored to school" },
    { value: "3", label: "partner organizations" },
    { value: "50%", label: "basic literacy achieved" },
  ],
  cta: {
    title: "Literacy is not a privilege, it's a right",
    body: "With your support, we run camps, cover school fees, and stay with children through mentorship.",
    ctas: [
      { label: "Donate now", href: "/donate", variant: "primary" as const },
      { label: "Get involved", href: "/join-us", variant: "outline" as const },
    ],
  },
};

export const testimonials = [
  {
    quote:
      "The program has greatly improved my son's intellect, especially in the area of computers. I am so impressed, he even asked us to get him a computer so he can teach his siblings. He seems to have mastered everything you've been teaching him, as he often narrates and explains it all to me at home.",
    name: "Ibrahim Blessing",
    role: "Parent, Justice Through Literacy",
  },
  {
    quote:
      "My child's personal stories when she gets home really make me happy, whether it's about the computer, reading, or everything she's learning. She has become very good at what she's being taught, and when she shares it with others, they often wish they were part of it too. I can clearly see the impact this program has had on her, and the fact that we didn't even have to pay anything makes me extremely grateful.",
    name: "Helen Sunday",
    role: "Parent, Justice Through Literacy",
  },
  {
    quote:
      "The program has greatly impacted my child by nurturing her passion for reading and strengthening her skills in solving math problems.",
    name: "Cheure Gabriel Gweje",
    role: "Parent, Justice Through Literacy",
  },
];

export const partners = [
  { name: "Davis Projects for Peace", logo: "/images/partners/davis.png" },
  { name: "Nifemi Brown Foundation", logo: "/images/partners/nifemi.webp" },
  { name: "Smith / Conway Center", logo: "/images/partners/smith.jpeg" },
];

export const about = {
  header: {
    eyebrow: "About Us",
    title: "Bridging Nigeria's rural and urban literacy gap",
    intro:
      "Justice Through Literacy (formerly Kwali Juvenile Education Foundation) promotes access to education for children in Nigeria's rural communities.",
    image: "/images/about-banner.jpg",
  },
  story: {
    eyebrow: "Our Story · Est. 2021",
    heading: "It began with children who wanted to keep learning",
    image: "/images/about-story.jpg",
    paragraphs: [
      "In 2021, Olohi John was teaching free after-school lessons to children in Kwali. They showed up curious and capable. But when each lesson ended, most had no way to keep going, their families couldn't afford school fees, and some had grown up hearing that classrooms weren't meant for children like them. Olohi started Justice Through Literacy, first known as the Kwali Juvenile Education Foundation, so those children wouldn't have to stop.",
      "Through a 3-pronged process, we provide opportunities for children in rural Nigeria, where more than 10 million children are out of school (UNICEF), to attend school. And we stay with them, through a first summer camp, a sponsored place at school, and the mentors who keep them going year after year.",
    ],
    founderQuote: {
      quote:
        "Seeing so many bright children leave the lessons with little hope of continuing their learning was deeply unsettling.",
      cite: "Olohi John, Founder",
    },
    highlights: [
      "Multiple awards from Smith College's Conway Center",
      "14 children earned scholarships through the Peace Camp, Kwali",
    ],
  },
  missionVision: [
    {
      eyebrow: "Our Mission",
      body: "To promote access to education for children in Nigeria's rural communities through three resources: foundational camps, full scholarships, and continuous mentorship.",
      accent: "purple" as const,
    },
    {
      eyebrow: "Our Vision",
      body: "A literate, empowered Nigeria where every child can reach their full potential through quality education.",
      accent: "yellow" as const,
    },
  ],
  team: [
    { name: "Olohi John", role: "Founder", photo: "/images/team/olohi.jpeg" },
    { name: "Shalom Mhanda", role: "Tech Lead", photo: "/images/team/shalom.jpg" },
    { name: "Oyale John", role: "Project Manager", photo: "/images/team/oyale.jpg" },
    { name: "Favour Hosea", role: "Education Specialist", photo: "/images/team/favour-hosea.jpg" },
    { name: "Agaba Great John", role: "Education Specialist", photo: "/images/team/agaba.jpg" },
    { name: "Favour Umejesi", role: "Web Developer", photo: "/images/team/favour-umejesi.jpg" },
    { name: "Darasimi Ikuyetijo", role: "Article Writer", photo: "/images/team/darasimi.jpg" },
    { name: "Ifeoma Okolo", role: "Article Writer", photo: "/images/team/ifeoma.jpg" },
  ],
};

export const ourStory = {
  header: {
    eyebrow: "Our Story",
    title: "Every child deserves the chance to learn",
    intro:
      "Founded in the Fall of 2021 as the Kwali Juvenile Education Foundation, Justice Through Literacy grew from after-school tutorials in Kwali into camps, scholarships, and mentorship across rural Nigeria.",
    image: "/images/our-story-header.jpg",
  },
  image: "/images/children.jpg",
  paragraphs: [
    "Justice Through Literacy (JTL), formerly called Kwali Juvenile Education Foundation (KJEF), was founded in the Fall of 2021 with a simple but powerful motivation: every child deserves the chance to learn, no matter their background.",
    "The initiative, which grew to become JTL, began with a series of casual math and English lessons where the founder, Olohi John, would organize after-school tutorials intended to supplement what the children learned in their classrooms. However, for some of the participants, the tutorials became the only access to education they had.",
    "This is unfortunately the case for over 10 million children in Nigeria, named by UNICEF as the country with the most out-of-school children in the world. As Olohi recounts from the tutorial days, \"seeing so many bright children leave the lessons with little hope of continuing their learning was deeply unsettling.\" It was this unsettling feeling that led to Olohi's founding of Justice Through Literacy, with the support of other talented Nigerians who were passionate about the cause.",
    "JTL has since grown to incorporate summer camps, scholarships, and solid mentorship as its main offerings, all tailored towards empowering children in rural communities to excel in education, hence bridging the socioeconomic literacy divide in Nigeria. The organization has received multiple recognitions, including two awards from Smith College's Conway Entrepreneurship Center.",
    "Today, Justice Through Literacy continues to grow, committed to creating a Nigeria where all children can learn, dream, and rise—regardless of socioeconomic background.",
  ],
  milestones: [
    {
      year: "2021",
      title: "Founded in Kwali",
      body: "Olohi John starts after-school math and English tutorials and founds the Kwali Juvenile Education Foundation (KJEF) in the Fall of 2021.",
    },
    {
      year: "",
      title: "Becoming Justice Through Literacy",
      body: "As the work grew beyond tutoring, KJEF became Justice Through Literacy—with the support of other talented Nigerians passionate about the cause.",
    },
    {
      year: "",
      title: "Camps, scholarships, and mentorship",
      body: "JTL expands its offerings to summer camps, scholarships, and solid mentorship for children in rural communities.",
    },
    {
      year: "",
      title: "Recognition",
      body: "JTL receives two awards from Smith College's Conway Entrepreneurship Center.",
    },
    {
      year: "",
      title: "Looking ahead",
      body: "JTL continues to grow, committed to a Nigeria where all children can learn, dream, and rise—regardless of socioeconomic background.",
    },
  ],
  founderQuote: {
    quote:
      "Seeing so many bright children leave the lessons with little hope of continuing their learning was deeply unsettling.",
    cite: "Olohi John, Founder",
  },
};

export const ourWork = {
  header: {
    eyebrow: "Our Work",
    title: "A three-prong approach to lasting change",
    intro:
      "We don't stop at a single lesson. We walk with each child from their first camp through every year of school.",
    image: "/images/camp-outdoor.jpg",
  },
  pillars: [
    {
      num: "01",
      title: "Mindset Shift + Tutorial Camps",
      body: "As a first step, JTL scholars attend a summer camp, at no cost, where they're introduced to fundamentals in math, English, and/or programming as a way to prepare them to transition to a formal school setting. During this time, the children's parents are simultaneously engaged in the process to shift attitudes toward education. Our first summer camp, The Peace Camp, was held in Kwali in the summer of 2025 and culminated with 14 children awarded scholarships.",
      image: "/images/programming.jpg",
    },
    {
      num: "02",
      title: "Sponsor to School",
      body: "Once a child graduates from a JTL camp and is ready to thrive in elementary school, we connect them with donors and partner schools to fund their elementary education. JTL focuses on elementary school as the critical bridge between literacy and illiteracy.",
      image: "/images/camp-scholarship.jpg",
    },
    {
      num: "03",
      title: "Support in School",
      body: "The journey doesn't end when a child enters school. Through dedicated mentors, we stay connected throughout elementary school. When a child is fully sponsored by a donor, we keep the donor updated on their progress.",
      image: "/images/support.jpg",
    },
  ],
  camps: [
    {
      name: "Peace Camp",
      meta: "May 12 – June 24, 2025",
      body: "A six-week summer camp in Kwali, Abuja serving 20 children, combining academic enrichment, confidence-building, and mentorship.",
    },
    {
      name: "MathLove Camp",
      meta: "August 3–28, 2026",
      body: "A four-week initiative making mathematics engaging for children with little or no access to formal schooling.",
    },
  ],
};

export const impact = {
  header: {
    eyebrow: "Our Impact",
    title: "What we've accomplished so far",
    intro:
      "14 children sponsored to school. 8 volunteers engaged. Parents, teachers, and donors making it happen in Kwali.",
    image: "/images/impact-header.jpg",
  },
  stats: home.impactStats,
  outcomes: [
    {
      title: "Children learning in camp",
      body: "Peace Camp served 20 children in Kwali with math, English, programming, and mentorship.",
    },
    {
      title: "Scholarships that last",
      body: "14 Peace Camp graduates moved into elementary school with full tuition covered.",
    },
    {
      title: "Parents in the loop",
      body: "Families stay involved through camp updates, home visits, and parent conversations.",
    },
  ],
  testimonial: {
    quote:
      "My child's personal stories when she gets home really make me happy, whether it's about the computer, reading, or everything she's learning. I can clearly see the impact this program has had on her, and the fact that we didn't even have to pay anything makes me extremely grateful.",
    cite: "Helen Sunday, Parent",
  },
};

export const donate = {
  header: {
    eyebrow: "Support Our Mission",
    title: "Literacy is not a privilege, it's a right",
    body: "In rural Nigeria, over 10.5 million children are out of school, often because families can't afford the resources or hold misconceptions about education. Your gift sponsors a child through MathLove Camp and into the classroom.",
    image: "/images/donate-children.jpg",
  },
  tiers: [
    {
      amount: "$20–50",
      desc: "Provides a child's camp learning supplies, notebooks, pencils, and learning materials.",
    },
    {
      amount: "$80–150",
      desc: "Covers a child's meals, camp supplies, and digital learning access throughout the camp.",
    },
    {
      amount: "$150+",
      desc: "Covers all of the above, and goes toward their first-year tuition in elementary school.",
    },
  ],
  disclaimer:
    "Every gift goes toward camp supplies, scholarships, and mentorship for children in Kwali.",
};

export const joinUs = {
  formUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSdUf9VNVlW7vC4abV5jCGEgAI_oF7pE35J4FtULh5zkHYNhYg/viewform",
  header: {
    eyebrow: "Join Us",
    title: "From interest to impact: your path to joining JTL",
    intro:
      "Teachers, writers, developers, and social-media helpers, there's a place for you. Here's how to get started.",
    image: "/images/join-us-header.jpg",
  },
  steps: [
    {
      n: "1",
      title: "Fill out the interest form",
      body: "Share your background, skills, and why you want to join Justice Through Literacy.",
    },
    {
      n: "2",
      title: "Short conversation or email exchange",
      body: "We learn about your interests and match you with the roles that fit you best.",
    },
    {
      n: "3",
      title: "Role assignment & agreement",
      body: "You receive a volunteer agreement outlining your responsibilities and time commitment.",
    },
    {
      n: "4",
      title: "Orientation & onboarding",
      body: "A welcome guide and mission overview get you ready to contribute with confidence.",
    },
    {
      n: "5",
      title: "Start making impact",
      body: "Join team meetings and begin contributing to real projects for children.",
    },
  ],
  roles: [
    { title: "Teaching", body: "Lead camp sessions and tutor children in math, English, and programming." },
    { title: "Writing", body: "Tell our story through articles, newsletters, and grant applications." },
    { title: "Web development", body: "Build and maintain the tools and website that power our work." },
    { title: "Social media", body: "Grow our reach and share the impact of literacy online." },
  ],
};

export type Post = {
  slug: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  /** e.g. "/images/blog/peace-camp.jpg" */
  image?: string;
  /** Optional author head-shot, e.g. "/images/team/olohi.jpg" */
  authorPhoto?: string;
};

export const posts: Post[] = [
  {
    slug: "from-the-peace-camp-to-the-classroom",
    title: "From the Peace Camp to the classroom",
    author: "Favour Umejesi",
    date: "Nov 13, 2025",
    readTime: "3 min read",
    excerpt:
      "Peace Camp graduates Samuel and Precious begin their academic year after overcoming financial hardship and displacement.",
    image: "/images/blog/nov-13-2025.png",
    authorPhoto: "/images/team/favour-umejesi.jpg",
  },
  {
    slug: "peace-camp-jtl-2025",
    title: "Peace Camp JTL 2025",
    author: "Olohi John",
    date: "Aug 1, 2025",
    readTime: "3 min read",
    excerpt:
      "A six-week summer camp served 20 children in Kwali, Abuja — academic enrichment, confidence-building, and mentorship.",
    image: "/images/blog/aug-1-2025.jpg",
    authorPhoto: "/images/team/olohi.jpeg",
  },
  {
    slug: "emmanuel-and-godiya",
    title: "Emmanuel and Godiya: a journey from uncertainty to opportunity",
    author: "Olohi John",
    date: "Mar 30, 2025",
    readTime: "2 min read",
    excerpt:
      "Two brothers raised by their grandmother received home tutoring, then sponsorship and mentorship for elementary school.",
    image: "/images/blog/mar-30-2025.jpg",
    authorPhoto: "/images/team/olohi.jpeg",
  },
];

export const news = {
  header: {
    eyebrow: "News & Stories",
    title: "Updates from the field",
    image: "/images/camp-celebration.jpg",
  },
};

export const newsEvent = {
  tag: "Upcoming Event · Aug 3–28, 2026",
  title: "MathLove Camp 2026",
  body: "A four-week summer initiative making mathematics engaging for children with restricted or no access to formal schooling, building foundational skills that last.",
  image: "/images/building-blocks.jpg",
};
