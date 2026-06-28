"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

/**
 * Brand lockup: globe mark + stacked wordmark (JUSTICE / through / LITERACY).
 *
 * The logo file (`public/images/jtl-logo.png`) has a white background, so in
 * the nav (on white) it's shown bare and larger — no card. On the dark footer
 * (`tone="light"`) it sits on a small white tile so it stays visible.
 */
export function Logo({
  tone = "dark",
  size = "default",
}: {
  tone?: "dark" | "light";
  size?: "default" | "nav";
}) {
  const [logoOk, setLogoOk] = useState(true);

  const isNav = size === "nav";
  const onLight = tone === "light";
  // JUSTICE / LITERACY: purple on the white nav, white on the dark footer.
  const wordColor = onLight ? "text-on-purple" : "text-purple";
  const markBox = onLight ? "bg-yellow text-purple" : "bg-purple text-on-purple";

  const titleSize = isNav ? "text-lg" : "text-sm";
  const throughSize = isNav ? "text-sm" : "text-base";
  const imgClass = isNav ? "h-[4.25rem] w-auto shrink-0" : "h-10 w-auto";
  const imgW = isNav ? 82 : 44;
  const imgH = isNav ? 68 : 42;

  const logoImg = (
    <Image
      src="/images/jtl-logo.png"
      alt="Justice Through Literacy"
      width={imgW}
      height={imgH}
      className={imgClass}
      onError={() => setLogoOk(false)}
      priority
    />
  );

  return (
    <Link
      href="/"
      className={`flex items-center ${isNav ? "gap-4" : "gap-3"}`}
    >
      {logoOk ? (
        onLight ? (
          <span className="grid place-items-center rounded-md bg-white p-1">
            {logoImg}
          </span>
        ) : (
          logoImg
        )
      ) : (
        <span
          className={`grid place-items-center rounded-[10px] font-body font-bold ${
            isNav ? "size-[4.25rem] text-3xl" : "size-10 text-lg"
          } ${markBox}`}
          aria-hidden
        >
          J
        </span>
      )}

      <span className={`font-heading leading-[0.9] ${wordColor}`}>
        <span className={`block font-semibold uppercase tracking-wide ${titleSize}`}>
          Justice
        </span>
        <span
          className={`-my-0.5 block font-medium italic lowercase leading-none text-yellow ${throughSize}`}
        >
          through
        </span>
        <span className={`block font-semibold uppercase tracking-wide ${titleSize}`}>
          Literacy
        </span>
      </span>
    </Link>
  );
}
