import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";
import { Partners } from "@/components/sections/Partners";
import { IconArrowRight } from "@/components/ui/icons";
import { about } from "@/lib/content";
import { getTeam, type TeamMember } from "@/lib/payload-data";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

/** Past staff sort to the end of the grid and get "(Past Staff)" by their role. */
function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => (
        <StaggerItem key={member.name} hoverLift>
          <div className="flex flex-col items-center gap-3.5 text-center">
            <ImagePlaceholder
              src={member.photo}
              rounded="rounded-full"
              className="size-28"
              label={member.name}
            />
            <span>
              <span className="block font-heading text-lg font-semibold">
                {member.name}
              </span>
              <span className="block text-sm text-purple">
                {member.role}
                {member.status === "past" && " (Past Staff)"}
              </span>
            </span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export default async function AboutPage() {
  const team = await getTeam();
  // Stable sort: current staff first (keeping their CMS order), past staff last.
  const sortedTeam = [...team].sort(
    (a, b) => Number(a.status === "past") - Number(b.status === "past"),
  );

  return (
    <>
      <PageHeader {...about.header} />

      {/* Mission & vision */}
      <Section tone="soft">
        <Stagger className="grid gap-6 md:grid-cols-2">
          {about.missionVision.map((b) => (
            <StaggerItem key={b.eyebrow} hoverLift className="h-full">
              <div className="h-full space-y-4 rounded-none border border-dust/25 bg-surface p-9">
                <Eyebrow className="text-ink-soft">{b.eyebrow}</Eyebrow>
                <p className="font-heading text-2xl font-medium leading-snug">
                  {b.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Our story */}
      <Section tone="surface">
        <Reveal className="grid items-start gap-12 lg:grid-cols-[480px_1fr] lg:gap-16">
          <ImagePlaceholder
            src={about.story.image}
            className="aspect-[4/5] w-full"
            label="Justice Through Literacy in the community"
          />
          <div className="space-y-6">
            <Eyebrow className="text-purple">{about.story.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl font-semibold leading-tight md:text-4xl">
              {about.story.heading}
            </h2>
            {about.story.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}

            <figure className="space-y-5">
              <blockquote className="font-heading text-lg font-semibold italic leading-snug md:text-[22px]">
                “{about.story.founderQuote.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3.5">
                <ImagePlaceholder
                  src="/images/team/olohi.jpeg"
                  rounded="rounded-full"
                  className="size-11 shrink-0"
                  label="Olohi John"
                />
                <cite className="text-sm not-italic leading-tight">
                  {about.story.founderQuote.cite
                    .split(",")
                    .map((part, i) => (
                      <span
                        key={part}
                        className={
                          i === 0
                            ? "block font-semibold text-purple"
                            : "block text-ink-soft"
                        }
                      >
                        {part.trim()}
                      </span>
                    ))}
                </cite>
              </figcaption>
            </figure>

            <ul className="space-y-3">
              {about.story.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-3 rounded-none bg-surface-soft px-4 py-3.5 text-sm"
                >
                  <span className="size-2.5 shrink-0 rounded-full bg-purple" />
                  {h}
                </li>
              ))}
            </ul>

            <Link
              href="/our-story"
              className="inline-flex items-center gap-2 font-semibold text-purple underline underline-offset-4"
            >
              Read our full story
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* Team — editable in the CMS under "Team Members" */}
      <Section tone="surface">
        <div className="space-y-12">
          <Reveal className="space-y-3.5">
            <Eyebrow className="text-purple">Our Team</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              The people behind JTL
            </h2>
          </Reveal>
          <TeamGrid members={sortedTeam} />
        </div>
      </Section>

      <Section tone="soft">
        <Partners />
      </Section>
    </>
  );
}
