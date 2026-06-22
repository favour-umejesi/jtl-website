import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconArrowRight,
} from "@/components/ui/icons";
import { footerNav, legalNav } from "@/lib/site";
import { getSettings } from "@/lib/payload-data";

const socialIcons = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  linkedin: IconLinkedin,
} as const;

export async function Footer() {
  const settings = await getSettings();

  const toUrl = (raw: string) =>
    /^(https?:|mailto:)/i.test(raw) ? raw : `https://${raw}`;

  const socials = (
    [
      { label: "Facebook", key: "facebook" as const },
      { label: "Instagram", key: "instagram" as const },
      { label: "LinkedIn", key: "linkedin" as const },
    ]
  )
    .filter((s) => settings.socials[s.key] && settings.socials[s.key] !== "#")
    .map((s) => ({
      ...s,
      href: toUrl(settings.socials[s.key]),
      Icon: socialIcons[s.key],
    }));

  return (
    <footer>
      {/* Footer 1 — main */}
      <div className="relative overflow-hidden bg-purple text-on-purple">
        {/* gold top rule */}
        <div className="h-1 w-full bg-yellow" />

        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr_1fr_1.1fr]">
          <div className="max-w-sm space-y-5">
            <Logo tone="light" />
            <p className="text-sm leading-relaxed text-dust">
              Promoting access to education for children in Nigeria&apos;s rural
              communities through camps, scholarships, and mentorship.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-10 place-items-center border border-white/25 text-on-purple transition-colors hover:border-yellow hover:bg-yellow hover:text-purple"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {footerNav.map((col) => (
            <nav key={col.heading} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-dust transition-colors hover:text-on-purple"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow">
              Contact
            </p>
            <ul className="space-y-3 text-[15px] text-dust">
              <li>{settings.location}</li>
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-on-purple">
                  {settings.email}
                </a>
              </li>
              <li>{settings.phone}</li>
            </ul>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-yellow px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Donate <IconArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </div>

      {/* Footer 2 — legal bar (white) */}
      <div className="border-t border-dust/30 bg-surface text-ink-soft">
        <Container className="flex flex-col items-center justify-between gap-4 py-5 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-purple">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
