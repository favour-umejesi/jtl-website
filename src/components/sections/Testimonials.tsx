"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import {
  IconChevronLeft,
  IconChevronRight,
  IconQuote,
} from "@/components/ui/icons";

type Testimonial = { quote: string; name: string; role: string };

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const count = items.length;
  const active = items[index];

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  return (
    <div className="flex flex-col items-center gap-9">
      <div className="space-y-3 text-center">
        <Eyebrow className="text-purple">Voices from our families</Eyebrow>
        <h2 className="text-3xl font-semibold md:text-4xl">
          What parents are saying
        </h2>
      </div>

      <div className="flex w-full items-center gap-4 md:gap-7">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => go(-1)}
          className="hidden size-12 shrink-0 items-center justify-center border border-purple text-purple transition-colors hover:bg-purple hover:text-on-purple sm:flex"
        >
          <IconChevronLeft className="size-5" />
        </button>

        <figure className="flex flex-1 flex-col items-center gap-7 rounded-none border border-dust/40 bg-surface px-6 py-10 text-center shadow-sm md:px-12">
          <IconQuote className="size-9 text-yellow" />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center gap-7"
            >
              <blockquote className="max-w-3xl font-heading text-xl font-medium leading-snug text-ink md:text-2xl">
                {active.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3.5">
                <Avatar name={active.name} className="size-12" />
                <span className="text-left">
                  <span className="block font-semibold text-ink">{active.name}</span>
                  <span className="block text-sm text-purple">{active.role}</span>
                </span>
              </figcaption>
            </motion.div>
          </AnimatePresence>
        </figure>

        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => go(1)}
          className="hidden size-12 shrink-0 items-center justify-center border border-purple text-purple transition-colors hover:bg-purple hover:text-on-purple sm:flex"
        >
          <IconChevronRight className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {items.map((t, i) => (
          <button
            key={t.name}
            type="button"
            aria-label={`Show testimonial ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-7 bg-purple" : "w-2.5 bg-dust/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
