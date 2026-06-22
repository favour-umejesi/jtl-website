import Image from "next/image";
import { IconImage } from "./icons";

/**
 * Renders a real image when `src` is set, otherwise a neutral placeholder.
 *
 * To add an image: drop the file in `public/images/` and pass its path, e.g.
 * `src="/images/hero.jpg"`. Paths are usually set in `src/lib/content.ts`.
 * Phase two swaps `src` for a Payload media field — components stay the same.
 */
export function ImagePlaceholder({
  src,
  className = "",
  label,
  rounded = "rounded-none",
  fit = "cover",
  containPadding = "p-2",
}: {
  src?: string;
  className?: string;
  label?: string;
  rounded?: string;
  /** "cover" for photos, "contain" for logos (no cropping). */
  fit?: "cover" | "contain";
  containPadding?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${rounded} ${className}`}>
        <Image
          src={src}
          alt={label ?? ""}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={
            fit === "contain"
              ? `object-contain ${containPadding}`
              : "object-cover"
          }
        />
      </div>
    );
  }

  return (
    <div
      className={`grid place-items-center overflow-hidden bg-dust/20 text-dust ${rounded} ${className}`}
      role="img"
      aria-label={label ?? "Image placeholder"}
    >
      <IconImage className="size-7" />
    </div>
  );
}

export { ImagePlaceholder as Media };
