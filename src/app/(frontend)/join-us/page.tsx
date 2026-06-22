import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { joinUs } from "@/lib/content";
import { org } from "@/lib/site";

export const metadata: Metadata = { title: "Join Us" };

export default function JoinUsPage() {
  return (
    <>
      <PageHeader {...joinUs.header} />

      {/* Steps */}
      <Section tone="surface">
        <ol className="space-y-6">
          {joinUs.steps.map((step) => (
            <li
              key={step.n}
              className="flex items-center gap-6 rounded-none bg-surface-soft px-6 py-5"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-purple font-heading text-2xl font-semibold text-on-purple">
                {step.n}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Roles */}
      <Section tone="soft">
        <div className="space-y-10">
          <div className="space-y-3.5">
            <Eyebrow className="text-purple">Where you can help</Eyebrow>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Roles we&apos;re looking for
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {joinUs.roles.map((role) => (
              <article key={role.title} className="space-y-3.5 rounded-none border border-dust/25 bg-surface p-7">
                <h3 className="font-heading text-lg font-semibold">{role.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {role.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title="Ready to make an impact?"
        body="Fill out our interest form and we'll be in touch about the role that fits you best."
        ctas={[
          {
            label: "Fill out the interest form",
            href: joinUs.formUrl,
            variant: "primary",
          },
          { label: "Contact us", href: `mailto:${org.email}`, variant: "outline" },
        ]}
      />
    </>
  );
}
