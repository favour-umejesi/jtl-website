import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { IconQuote } from "@/components/ui/icons";
import { ourStory } from "@/lib/content";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Our Story" };

export default function OurStoryPage() {
  return (
    <>
      <PageHeader {...ourStory.header} />

      {/* Narrative */}
      <Section tone="surface">
        <div className="grid items-start gap-12 lg:grid-cols-[480px_1fr] lg:gap-16">
          <ImagePlaceholder
            src={ourStory.image}
            className="aspect-[6/7] w-full"
            label="Children learning in Kwali"
          />
          <Reveal className="space-y-6">
            {ourStory.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="text-[17px] leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* Milestones */}
      <Section tone="soft">
        <div className="space-y-10">
          <Reveal>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Milestones along the way
            </h2>
          </Reveal>
          <Stagger className="relative space-y-7">
            <span
              aria-hidden
              className="absolute bottom-5 left-2 top-5 w-px -translate-x-1/2 bg-dust/50"
            />
            {ourStory.milestones.map((m) => (
              <StaggerItem key={m.title} className="relative flex gap-6">
                <span
                  className="mt-2 size-4 shrink-0 rounded-full bg-purple ring-4 ring-surface-soft"
                  aria-hidden
                />
                <div className="space-y-1.5">
                  {m.year && (
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow">
                      {m.year}
                    </p>
                  )}
                  <h3 className="font-heading text-xl font-semibold">{m.title}</h3>
                  <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
                    {m.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Founder quote */}
      <Section tone="purple">
        <Reveal>
          <figure className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <IconQuote className="size-11 text-yellow" />
            <blockquote className="font-heading text-3xl font-medium leading-snug">
              {ourStory.founderQuote.quote}
            </blockquote>
            <figcaption className="font-semibold text-yellow">
              {ourStory.founderQuote.cite}
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      <CtaBand
        title="Be part of what comes next"
        body="Every child we reach is the start of another story. Help us write more of them."
        ctas={[
          { label: "Donate now", href: "/donate", variant: "primary" },
          { label: "Get involved", href: "/join-us", variant: "outline" },
        ]}
      />
    </>
  );
}
