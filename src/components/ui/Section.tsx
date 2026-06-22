import { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "surface" | "soft" | "purple" | "yellow";

const toneClasses: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  soft: "bg-surface-soft text-ink",
  purple: "bg-purple text-on-purple",
  yellow: "bg-yellow text-ink",
};

export function Section({
  children,
  tone = "surface",
  className = "",
  containerClassName = "",
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${toneClasses[tone]} py-16 md:py-24 ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {children}
    </p>
  );
}
