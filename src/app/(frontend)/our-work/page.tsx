import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ourWork } from "@/lib/content";

export const metadata: Metadata = { title: "Our Work" };

export default function OurWorkPage() {
  return (
    <>
      <PageHeader {...ourWork.header} />

      {/* Pillars */}
      <Section tone="surface">
        <div className="space-y-16 md:space-y-24">
          {ourWork.pillars.map((pillar, i) => (
            <Reveal
              key={pillar.num}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <ImagePlaceholder
                src={pillar.image}
                className="aspect-[4/3] w-full"
                label={pillar.title}
              />
              <div className="space-y-4">
                <p className="font-heading text-xl font-semibold text-yellow">
                  {pillar.num}
                </p>
                <h2 className="font-heading text-3xl font-semibold leading-tight">
                  {pillar.title}
                </h2>
                <p className="text-base leading-relaxed text-ink-soft">
                  {pillar.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Camps */}
      <Section tone="soft">
        <div className="space-y-10">
          <Reveal className="space-y-3.5">
            <Eyebrow className="text-purple">On the Ground</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Our camps in action
            </h2>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-2">
            {ourWork.camps.map((camp) => (
              <StaggerItem key={camp.name} hoverLift className="h-full">
                <article
                  className="space-y-3.5 rounded-none border border-dust/25 bg-surface p-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow">
                    {camp.meta}
                  </p>
                  <h3 className="font-heading text-2xl font-semibold">{camp.name}</h3>
                  <p className="text-base leading-relaxed text-ink-soft">
                    {camp.body}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <CtaBand
        title="Bring a camp to more children"
        body="Your support funds the camps, scholarships, and mentors that change a child's path. Join us."
        ctas={[
          { label: "Donate now", href: "/donate", variant: "primary" },
          { label: "Join us", href: "/join-us", variant: "outline" },
        ]}
      />
    </>
  );
}
