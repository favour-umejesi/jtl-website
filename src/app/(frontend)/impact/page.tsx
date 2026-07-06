import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { IconQuote } from "@/components/ui/icons";
import { impact } from "@/lib/content";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Impact" };

export default function ImpactPage() {
  return (
    <>
      <PageHeader {...impact.header} />

      {/* Stats */}
      <Section tone="surface">
        <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {impact.stats.map((stat) => (
            <StaggerItem key={stat.label} className="space-y-2.5">
              <p className="font-heading text-5xl font-semibold text-purple md:text-6xl">
                <CountUp value={stat.value} />
              </p>
              <p className="text-base leading-snug text-ink-soft">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Outcomes */}
      <Section tone="soft">
        <div className="space-y-10">
          <Reveal className="space-y-3.5">
            <Eyebrow className="text-purple">What your support makes possible</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              What changes for children
            </h2>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {impact.outcomes.map((o) => (
              <StaggerItem key={o.title} hoverLift className="space-y-3.5 rounded-none border border-dust/25 bg-surface p-7">
                <h3 className="font-heading text-xl font-semibold">{o.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">{o.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Testimonial */}
      <Section tone="purple">
        <Reveal>
          <figure className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <IconQuote className="size-10 text-yellow" />
            <blockquote className="font-heading text-2xl font-medium leading-snug md:text-3xl">
              {impact.testimonial.quote}
            </blockquote>
            <figcaption className="font-semibold text-yellow">
              {impact.testimonial.cite}
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      <CtaBand
        title="Help us reach the next child"
        body="Your donation sponsors camp supplies, scholarships, and mentorship for children in Kwali."
        ctas={[
          { label: "Donate now", href: "/donate", variant: "primary" },
          { label: "Get involved", href: "/join-us", variant: "outline" },
        ]}
      />
    </>
  );
}
