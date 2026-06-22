import Image from "next/image";
import { IconUser } from "./icons";

/**
 * Round avatar. Shows the photo when `src` is provided, otherwise a neutral
 * person icon (used for parent testimonials and authors without a head-shot).
 */
export function Avatar({
  src,
  name,
  className = "size-12",
}: {
  src?: string;
  name?: string;
  className?: string;
}) {
  if (src) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-dust/20 ${className}`}
      >
        <Image
          src={src}
          alt={name ?? "Avatar"}
          fill
          sizes="96px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-purple/10 text-purple ${className}`}
      aria-hidden
    >
      <IconUser className="h-1/2 w-1/2" />
    </span>
  );
}
