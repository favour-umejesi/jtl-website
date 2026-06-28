"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Reusable Framer Motion (motion) primitives — client "islands" that can be
 * dropped inside server components. All effects respect prefers-reduced-motion:
 * users who opt out get a quiet fade (or nothing) instead of movement.
 */

/** Fade + slide in once the element scrolls into view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers the entrance of its <StaggerItem> children. */
export function Stagger({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        show: { transition: { staggerChildren: 0.12, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child. Set `hoverLift` to raise it on hover. */
export function StaggerItem({
  children,
  className = "",
  hoverLift = false,
}: {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      whileHover={hoverLift && !reduce ? { y: -8 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/** Inline wrapper that pops on hover and presses in on tap — for buttons. */
export function Pop({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

/** Image frame that eases in on scroll and zooms gently on hover. */
export function HoverZoom({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
    >
      {children}
    </motion.div>
  );
}
