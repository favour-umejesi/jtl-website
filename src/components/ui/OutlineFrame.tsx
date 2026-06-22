import { ReactNode } from "react";

/**
 * Stationery-style layered outline: a sharp rectangular border offset behind
 * the content (inspired by Malala Fund's card frames). The content card sits
 * on top; the outline peeks out at the bottom-right.
 */
const colorMap = {
  yellow: "border-yellow",
  dust: "border-dust",
  purple: "border-purple",
} as const;

export function OutlineFrame({
  children,
  color = "yellow",
  className = "",
}: {
  children: ReactNode;
  color?: keyof typeof colorMap;
  className?: string;
}) {
  return (
    <div className={`relative h-full ${className}`}>
      <span
        aria-hidden
        className={`absolute inset-0 translate-x-2.5 translate-y-2.5 border-2 ${colorMap[color]}`}
      />
      <div className="relative h-full bg-surface">{children}</div>
    </div>
  );
}
