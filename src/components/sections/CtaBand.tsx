import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/motion";

type Cta = { label: string; href: string; variant?: "primary" | "outline" };

export function CtaBand({
  title,
  body,
  ctas,
}: {
  title: string;
  body: string;
  ctas: Cta[];
}) {
  return (
    <Section tone="yellow">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
          {title}
        </h2>
        <p className="text-lg leading-relaxed">{body}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {ctas.map((c) => (
            <Button
              key={c.label}
              href={c.href}
              variant={c.variant === "outline" ? "outline" : "primary"}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
