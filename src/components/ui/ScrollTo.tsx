"use client";

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

/**
 * Scrolls to an in-page section without appending a #hash to the URL.
 */
export function ScrollToButton({
  targetId,
  children,
  variant = "primary",
  className = "",
}: {
  targetId: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const classes = `inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold transition-colors ${variantClasses[variant]} ${className}`;

  return (
    <motion.button
      type="button"
      className={classes}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {children}
    </motion.button>
  );
}

export function ScrollToLink({
  targetId,
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  targetId: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {children}
    </button>
  );
}
