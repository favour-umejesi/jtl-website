# Images — how to add them

Drop image files into this folder, then point to them from
`src/lib/content.ts` (or `src/lib/site.ts`) using a path that starts with
`/images/...`. The page updates as soon as you save (with `npm run dev` running).

**Tip:** use `.jpg`/`.png`/`.webp` for photos, transparent `.png`/`.svg` for
logos. Keep photos reasonably sized (≈1600px wide max).

> **Formats that DON'T work on the web:** `.HEIC` (iPhone photos) and `.MOV`/
> `.mp4` (videos) will not display. Convert HEIC to JPG first — on a Mac:
> `sips -s format jpeg input.HEIC --out output.jpg`.
>
> The `PeaceCamp2025/` folder is a raw photo **library** (many HEIC/MOV). The
> images actually used on the site were converted/copied to clean names in this
> folder (e.g. `hero.jpg`, `programming.jpg`). To use another library photo,
> convert it to JPG and reference it.

## The logo

Save the globe logo as `jtl-logo.png` in this folder (transparent PNG or SVG).
It appears in the header and footer automatically — no code change needed.

## Where each image slot lives (edit the path in src/lib/content.ts)

| Content key | Suggested file | Shows on |
| --- | --- | --- |
| `home.hero.image` | `/images/hero.jpg` | Home hero |
| `home.programs.cards[].image` | `/images/program-1.jpg` … | Home — three-prong cards |
| `about.story.image` | `/images/about-story.jpg` | About — our story |
| `about.team[].photo` | `/images/team/olohi.jpg` … | About — team head-shots |
| `ourStory.image` | `/images/our-story.jpg` | Our Story page |
| `ourWork.pillars[].image` | `/images/pillar-1.jpg` … | Our Work — pillars |
| `donate.header.image` | `/images/donate.jpg` | Donate header |
| `newsEvent.image` | `/images/mathlove-camp.jpg` | News — featured event |
| `posts[].image` | `/images/blog/peace-camp.jpg` … | News + Blog cards |
| `posts[].authorPhoto` | `/images/team/olohi.jpg` | Blog — author avatar |
| `partners[].logo` | `/images/partners/davis.png` … | Home + About logo strip |

Leave a value as `""` to keep the neutral placeholder.
