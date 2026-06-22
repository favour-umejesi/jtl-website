import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "yellow" | "outline" | "outlineLight";

const variantClasses: Record<Variant, string> = {
  primary: "bg-purple text-on-purple hover:opacity-90",
  yellow: "bg-yellow text-ink hover:brightness-95",
  outline: "border border-purple text-purple hover:bg-purple hover:text-on-purple",
  outlineLight:
    "border border-current text-current hover:bg-on-purple hover:text-purple",
};

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
  const classes = `inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold transition-colors ${variantClasses[variant]} ${className}`;
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
