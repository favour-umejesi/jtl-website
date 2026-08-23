import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { IconChevronDown } from "@/components/ui/icons";
import { NewsletterForm } from "@/components/sections/NewsletterForm";
import { ChildSponsorCard } from "@/components/sections/ChildSponsorCard";
import { Reveal, Stagger, StaggerItem, HoverZoom } from "@/components/ui/motion";
import { donate } from "@/lib/content";
import { org } from "@/lib/site";

export const metadata: Metadata = { title: "Donate" };

export default function DonatePage() {
  const { options, sponsorSection, children, disclaimer } = donate;

  return (
    <>
      {/* Header */}
      <Section tone="purple">
        <div className="space-y-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="space-y-6">
              <Eyebrow className="text-yellow">{donate.header.eyebrow}</Eyebrow>
              <h1 className="text-4xl font-semibold leading-[1.1] md:text-5xl">
                {donate.header.title}
              </h1>
              <p className="text-lg leading-relaxed text-dust">
                {donate.header.body}
              </p>
              <Button href="#donation-options" variant="yellow">
                Explore ways to give
              </Button>
            </Reveal>
            <HoverZoom className="overflow-hidden">
              <ImagePlaceholder
                src={donate.header.image}
                className="aspect-[4/3] w-full"
                label="Children with Justice Through Literacy backpacks in Kwali"
              />
            </HoverZoom>
          </div>
          <Reveal delay={0.15} className="flex justify-center">
            <a
              href="#donation-options"
              className="inline-flex text-yellow transition-opacity hover:opacity-80"
              aria-label="Scroll to ways to give"
            >
              <IconChevronDown className="size-8 animate-bounce" />
            </a>
          </Reveal>
        </div>
      </Section>

      {/* Donation options + Sponsor a child */}
      <Section tone="surface" id="donation-options" className="scroll-mt-24">
        <div className="space-y-10">
          <Reveal className="space-y-3.5">
            <Eyebrow className="text-purple">{sponsorSection.eyebrow}</Eyebrow>
          </Reveal>

          <Stagger className="grid gap-6 md:grid-cols-2">
            <StaggerItem hoverLift>
              <article className="flex h-full flex-col space-y-3.5 rounded-none border border-dust/30 bg-surface p-7 transition-shadow hover:shadow-lg hover:shadow-purple/5">
                <p className="font-heading text-2xl font-semibold text-purple md:text-3xl">
                  {options.sponsorChild.title}
                </p>
                <p className="flex-1 text-[15px] leading-relaxed text-ink-soft">
                  {options.sponsorChild.blurb}
                </p>
                <div className="pt-2">
                  <Button href={options.sponsorChild.ctaHref} variant="primary">
                    {options.sponsorChild.ctaLabel}
                  </Button>
                </div>
              </article>
            </StaggerItem>
            <StaggerItem hoverLift>
              <article className="flex h-full flex-col space-y-3.5 rounded-none border border-dust/30 bg-surface p-7 transition-shadow hover:shadow-lg hover:shadow-purple/5">
                <p className="font-heading text-2xl font-semibold text-purple md:text-3xl">
                  {options.giveToJtl.title}
                </p>
                <p className="flex-1 text-[15px] leading-relaxed text-ink-soft">
                  {options.giveToJtl.blurb}
                </p>
                <div className="pt-2">
                  <Button href={org.donateUrl} variant="primary">
                    {options.giveToJtl.ctaLabel}
                  </Button>
                </div>
              </article>
            </StaggerItem>
          </Stagger>

          <Reveal>
            <p className="text-sm italic text-ink-soft">{disclaimer}</p>
          </Reveal>

          {/* Sponsor a Child — child bios */}
          <div id="sponsor-a-child" className="scroll-mt-24 space-y-8 pt-6">
            <Reveal className="max-w-3xl space-y-4">
              <h3 className="font-heading text-2xl font-semibold text-purple md:text-3xl">
                Sponsor a Child
              </h3>
              {sponsorSection.intro.split("\n\n").map((paragraph) => {
                const parts = paragraph.split(/(Learn [Mm]ore)/);
                return (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-base leading-relaxed text-ink-soft"
                  >
                    {parts.map((part, i) =>
                      /^Learn [Mm]ore$/.test(part) ? (
                        <span
                          key={`${part}-${i}`}
                          className="font-semibold text-purple"
                        >
                          {part}
                        </span>
                      ) : (
                        <span key={`${part.slice(0, 12)}-${i}`}>{part}</span>
                      ),
                    )}
                  </p>
                );
              })}
            </Reveal>

            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <StaggerItem key={child.id} hoverLift>
                  <ChildSponsorCard child={child} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      {/* Newsletter */}
      <Section tone="soft">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold leading-tight">
              Stay close to the work
            </h2>
            <p className="max-w-md text-base leading-relaxed text-ink-soft">
              Join our mailing list for stories from the field, camp updates, and
              ways to help.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <NewsletterForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
