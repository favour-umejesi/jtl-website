import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { OutlineFrame } from "@/components/ui/OutlineFrame";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Testimonials } from "@/components/sections/Testimonials";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { Partners } from "@/components/sections/Partners";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/ui/motion";
import { home } from "@/lib/content";
import { getTestimonials } from "@/lib/payload-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const testimonials = await getTestimonials();
  return (
    <>
      {/* Hero */}
      <Section tone="soft">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-7">
            <Eyebrow className="animate-fade-up text-purple">
              {home.hero.eyebrow}
            </Eyebrow>
            <h1 className="animate-fade-up text-4xl font-semibold leading-[1.05] [animation-delay:120ms] md:text-6xl">
              {home.hero.title}
            </h1>
            <p className="max-w-xl animate-fade-up text-lg leading-relaxed text-ink-soft [animation-delay:240ms]">
              {home.hero.subhead}
            </p>
            <div className="flex animate-fade-up flex-wrap gap-4 [animation-delay:360ms]">
              {home.hero.ctas.map((c) => (
                <Button key={c.label} href={c.href} variant={c.variant}>
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
          <ImagePlaceholder
            src={home.hero.image}
            className="aspect-[5/4] w-full animate-fade-up [animation-delay:300ms]"
            label="Children reading at a JTL camp"
          />
        </div>
      </Section>

      {/* The challenge */}
      <Section tone="purple">
        <Stagger className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <StaggerItem>
            <Eyebrow className="text-yellow">{home.challenge.eyebrow}</Eyebrow>
            <p className="mt-2 font-heading text-7xl font-semibold leading-none md:text-8xl">
              <CountUp value={home.challenge.number} />
            </p>
            <p className="mt-2 text-lg text-dust">{home.challenge.unit}</p>
          </StaggerItem>
          <StaggerItem className="space-y-4">
            <p className="font-heading text-2xl font-medium leading-snug md:text-3xl">
              {home.challenge.statement}
            </p>
            <p className="text-lg leading-relaxed text-dust">
              {home.challenge.hope}
            </p>
          </StaggerItem>
        </Stagger>
      </Section>

      {/* Mission */}
      <Section tone="surface">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Eyebrow className="text-yellow">{home.mission.eyebrow}</Eyebrow>
          <p className="font-heading text-2xl font-medium leading-snug md:text-3xl">
            {home.mission.statement}
          </p>
        </Reveal>
      </Section>

      {/* Event video */}
      <Section tone="purple">
        <Reveal>
          <VideoShowcase video={home.video} />
        </Reveal>
      </Section>

      {/* Programs */}
      <Section tone="soft">
        <div className="space-y-12">
          <Reveal className="space-y-3.5">
            <Eyebrow className="text-purple">{home.programs.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              {home.programs.title}
            </h2>
          </Reveal>
          <Stagger className="grid gap-8 md:grid-cols-3">
            {home.programs.cards.map((card) => (
              <StaggerItem key={card.title} hoverLift className="h-full">
                <OutlineFrame color="yellow">
                  <article className="flex h-full flex-col gap-5 border border-dust/25 p-7">
                    <ImagePlaceholder
                      src={card.image}
                      rounded="rounded-none"
                      className="aspect-[16/10] w-full"
                      label={card.title}
                    />
                    <h3 className="font-heading text-xl font-semibold">{card.title}</h3>
                    <p className="text-[15px] leading-relaxed text-ink-soft">
                      {card.body}
                    </p>
                  </article>
                </OutlineFrame>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Impact stats */}
      <Section tone="purple">
        <div className="space-y-10">
          <Reveal>
            <h2 className="text-3xl font-semibold md:text-4xl">Our impact so far</h2>
          </Reveal>
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {home.impactStats.map((stat) => (
              <StaggerItem key={stat.label} className="space-y-2">
                <p className="font-heading text-5xl font-semibold text-yellow">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-base leading-snug text-dust">{stat.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Testimonials */}
      <Section tone="surface">
        <Reveal>
          <Testimonials items={testimonials} />
        </Reveal>
      </Section>

      {/* Partners */}
      <Section tone="soft">
        <Partners />
      </Section>

      {/* Donate CTA */}
      <CtaBand
        title={home.cta.title}
        body={home.cta.body}
        ctas={home.cta.ctas}
      />
    </>
  );
}
