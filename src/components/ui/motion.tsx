"use client";

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Require elements to be 80px inside the viewport vertically before they count
// as "in view". Vertical-only on purpose: a four-sided -80px margin also shrinks
// the viewport horizontally, so narrow elements near a screen edge (e.g. the
// single-digit "3" stat on a phone) would never intersect and never animate.
const VIEWPORT_MARGIN = "-80px 0px" as const;

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
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
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
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
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

/**
 * Animated number that "counts up" from 0 to its value when it scrolls into
 * view. Accepts the display string as-is (e.g. "$11K+", "10.5M", "50%") and
 * preserves the prefix/suffix and decimal places while only the digits tick.
 * Reduced-motion users just see the final value. Non-numeric strings render
 * unchanged.
 */
const NUMBER_RE = /^(\D*)([\d.]+)(.*)$/;

export function CountUp({
  value,
  className = "",
  duration = 1.6,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const match = value.match(NUMBER_RE);
  const isNumeric = match !== null;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: VIEWPORT_MARGIN });
  const reduce = useReducedMotion();

  const target = match ? parseFloat(match[2]) : 0;
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";
  const decimals =
    match && match[2].includes(".") ? match[2].split(".")[1].length : 0;

  const [n, setN] = useState(0);

  // Deps are all stable primitives — `match` (a fresh array each render) is
  // deliberately kept out so the effect doesn't restart the animation every
  // render. Reduced-motion users get the final value instantly (duration 0);
  // setN only runs in animate's async onUpdate, never synchronously here.
  useEffect(() => {
    if (!isNumeric || !inView) return;
    const controls = animate(0, target, {
      duration: reduce ? 0 : duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [inView, reduce, isNumeric, target, duration]);

  if (!match) return <span className={className}>{value}</span>;

  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
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
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
    >
      {children}
    </motion.div>
  );
}
