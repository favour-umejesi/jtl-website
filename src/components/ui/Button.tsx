"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Variant = "primary" | "yellow" | "outline" | "outlineLight";

const variantClasses: Record<Variant, string> = {
  primary: "bg-purple text-on-purple hover:opacity-90",
  yellow: "bg-yellow text-ink hover:brightness-95",
  outline: "border border-purple text-purple hover:bg-purple hover:text-on-purple",
  outlineLight:
    "border border-current text-current hover:bg-on-purple hover:text-purple",
};

const MotionLink = motion.create(Link);

/**
 * Site button. Colours change via CSS; the whole control springs up on hover
 * and presses in on tap (Framer Motion). Motion is skipped for users who
 * prefer reduced motion. Renders an <a> for external/mailto links, else Link.
 */
export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const classes = `inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold transition-colors ${variantClasses[variant]} ${className}`;
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const motionProps = {
    whileHover: reduce ? undefined : { scale: 1.04 },
    whileTap: reduce ? undefined : { scale: 0.96 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 },
  };

  if (isExternal) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <MotionLink href={href} className={classes} {...motionProps}>
      {children}
    </MotionLink>
  );
}
