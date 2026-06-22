import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { NewsletterForm } from "@/components/sections/NewsletterForm";
import { donate } from "@/lib/content";
import { org } from "@/lib/site";

export const metadata: Metadata = { title: "Donate" };

export default function DonatePage() {
  return (
    <>
      {/* Header */}
      <Section tone="purple">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <Eyebrow className="text-yellow">{donate.header.eyebrow}</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.1] md:text-5xl">
              {donate.header.title}
            </h1>
            <p className="text-lg leading-relaxed text-dust">
              {donate.header.body}
            </p>
            <Button href={org.donateUrl} variant="yellow">
              Donate via GoFundMe
            </Button>
          </div>
          <ImagePlaceholder
            src={donate.header.image}
            className="aspect-[8/7] w-full"
            label="A child supported by Justice Through Literacy"
          />
        </div>
      </Section>

      {/* Tiers */}
      <Section tone="surface">
        <div className="space-y-10">
          <div className="space-y-3.5">
            <Eyebrow className="text-purple">How you can help</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Sponsor a child&apos;s MathLove Camp experience
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {donate.tiers.map((tier) => (
              <article
                key={tier.amount}
                className="space-y-3.5 rounded-none border border-dust/30 bg-surface p-7"
              >
                <p className="font-heading text-3xl font-semibold text-purple">
                  {tier.amount}
                </p>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {tier.desc}
                </p>
              </article>
            ))}
          </div>
          <p className="text-sm italic text-ink-soft">{donate.disclaimer}</p>
        </div>
      </Section>

      {/* Newsletter */}
      <Section tone="soft">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold leading-tight">
              Stay close to the work
            </h2>
            <p className="max-w-md text-base leading-relaxed text-ink-soft">
              Join our mailing list for stories from the field, camp updates, and
              ways to help.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </Section>
    </>
  );
}
