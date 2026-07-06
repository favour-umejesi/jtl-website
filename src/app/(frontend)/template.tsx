"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Route-transition wrapper. A template (unlike a layout) re-mounts on every
 * navigation, so this gives each page a gentle fade + rise as it enters.
 * Nav and Footer live in the layout (outside this), so they stay put while
 * the page content transitions. Reduced-motion users get a plain fade.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
