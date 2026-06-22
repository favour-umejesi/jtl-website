"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@/components/ui/icons";
import { likePost } from "@/lib/actions";

/**
 * Interactive like control. Toggles on click, remembers the visitor's choice
 * in localStorage, and updates the shared count in Payload via a server action.
 */
export function LikeButton({
  slug,
  initialLikes = 0,
}: {
  slug: string;
  initialLikes?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Hydrate the visitor's saved choice after mount — localStorage is
    // unavailable during SSR, so this read must happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(localStorage.getItem(`liked:${slug}`) === "1");
  }, [slug]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    localStorage.setItem(`liked:${slug}`, next ? "1" : "0");

    setPending(true);
    const result = await likePost(slug, next ? 1 : -1);
    if (typeof result === "number") setCount(result);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-purple"
    >
      <IconHeart
        className={`size-4 transition-colors ${liked ? "fill-purple text-purple" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
