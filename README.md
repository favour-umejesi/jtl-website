# Justice Through Literacy — Website

Marketing site for **Justice Through Literacy (JTL)**, a non-profit bridging the
Nigerian literacy gap. Built with Next.js (App Router) + Tailwind, designed to
become CMS-editable for a non-technical content team.

## Stack

- **Next.js 16** (App Router, React 19) + **TypeScript**
- **Tailwind CSS v4** — brand tokens defined in [`src/app/globals.css`](src/app/globals.css)
- Fonts: **Fraunces** (headings) + **Inter** (body) via `next/font`
- _Phase two:_ **Payload CMS** (Postgres on Neon, deploy on Vercel)

## Brand tokens

| Token | Value | Use |
| --- | --- | --- |
| `purple` | `#2c016d` | Primary — headings, dark bands |
| `purple-dark` | `#1b0142` | Footer, challenge band |
| `yellow` | `#d7ad0d` | Accent — CTAs, highlights |
| `dust` | `#9c9c9c` | Muted text, placeholders |

Use as Tailwind utilities: `bg-purple`, `text-yellow`, `font-heading`, etc.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure

```
src/
  app/                 # one folder per route (/, /about, /our-story, …)
  components/
    layout/            # Nav, Footer, Logo
    sections/          # PageHeader, Testimonials, Partners, CtaBand, NewsletterForm
    ui/                # Container, Section, Button, ImagePlaceholder, icons
  lib/
    site.ts            # org info, nav, footer  (→ Payload globals later)
    content.ts         # all page copy           (→ Payload collections later)
```

## Editing content & images (before the CMS)

Until Payload (phase two) gives a visual editor, content is edited in code —
but it's all in one place and the dev server live-reloads:

1. Run `npm run dev` and open http://localhost:3000.
2. **Text:** edit [`src/lib/content.ts`](src/lib/content.ts) (page copy) or
   [`src/lib/site.ts`](src/lib/site.ts) (org name, nav, footer, contact).
3. **Images:** drop files in [`public/images/`](public/images/) and set the
   matching path (e.g. `image: "/images/hero.jpg"`). See
   [`public/images/README.md`](public/images/README.md) for the full slot map.
4. **Logo:** save the globe as `public/images/jtl-logo.png` — it appears in the
   header and footer automatically.

Save and the page refreshes automatically. Any image left as `""` shows a
neutral placeholder.

## Content & the CMS plan

All copy lives in [`src/lib/content.ts`](src/lib/content.ts) and
[`src/lib/site.ts`](src/lib/site.ts) as typed data. Components read from these
modules only — so when **Payload** is added, each export maps to a CMS
document (`Pages` blocks, `Posts`, `Testimonials`, `Partners`, `Settings`) and
the components don't change.

## Still to do (placeholders)

- Real **photos** — currently neutral `ImagePlaceholder` boxes
- Real **partner logos** — logo slots on the Home/About partner strips
- Wire the **newsletter form** to Mailchimp (or a Payload form submission)
- **Phase two:** add Payload CMS once a Neon Postgres connection string exists
