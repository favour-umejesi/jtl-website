"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { IconArrowRight, IconSearch, IconClose } from "@/components/ui/icons";
import { mainNav } from "@/lib/site";
import { searchSite } from "@/lib/search";

export function Nav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const close = () => setOpen(false);
  const closeSearch = () => {
    setSearch(false);
    setQuery("");
  };

  const results = searchSite(query);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-stretch justify-between pl-6 md:pl-10">
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo size="nav" />
        </div>

        {/* Centered nav */}
        <nav className="hidden flex-1 items-stretch justify-center md:flex">
          {mainNav.map((item) =>
            item.children ? (
              <div key={item.href} className="group flex items-stretch">
                <Link
                  href={item.href}
                  className="relative flex items-center px-4 text-[15px] text-ink-soft transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-purple after:transition-transform group-hover:text-purple group-hover:after:scale-x-100"
                >
                  {item.label}
                </Link>

                {/* Full-width mega panel */}
                <div className="invisible absolute inset-x-0 top-full z-40 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="border-t border-dust/40 bg-surface-soft shadow-xl">
                    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-3 md:px-10">
                      <div>
                        <p className="font-heading text-xl font-semibold text-purple">
                          {item.label}
                        </p>
                        {item.blurb && (
                          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                            {item.blurb}
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 md:border-l md:border-dust/30 md:pl-10">
                        <li>
                          <Link
                            href={item.href}
                            className="text-[15px] font-medium text-ink transition-colors hover:text-purple"
                          >
                            {item.label} overview
                          </Link>
                        </li>
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="text-[15px] text-ink-soft transition-colors hover:text-purple"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {item.featured && (
                        <Link href={item.featured.href} className="group/feat block">
                          <ImagePlaceholder
                            src={item.featured.image}
                            className="aspect-[16/10] w-full"
                            label={item.featured.title}
                          />
                          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-purple">
                            {item.featured.title}
                            <IconArrowRight className="size-4 transition-transform group-hover/feat:translate-x-1" />
                          </p>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="group/link relative flex items-center px-4 text-[15px] text-ink-soft transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-purple after:transition-transform hover:text-purple hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right: search + Donate (desktop) / hamburger (mobile) */}
        <div className="flex shrink-0 items-stretch">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearch((v) => !v)}
            className="hidden items-center px-4 text-ink-soft transition-colors hover:text-purple md:flex"
          >
            <IconSearch className="size-5" />
          </button>

          <Link
            href="/donate"
            className="hidden items-center bg-yellow px-9 text-[15px] font-semibold text-ink transition hover:opacity-90 md:flex"
          >
            Donate
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center pr-6 text-ink md:hidden"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </div>
          </button>
        </div>
      </div>

      {/* Search bar overlay */}
      {search && (
        <div className="border-t border-dust/30 bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-4 md:px-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) {
                  router.push(results[0].href);
                  closeSearch();
                }
              }}
              className="flex items-center gap-3"
            >
              <IconSearch className="size-5 shrink-0 text-ink-soft" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the site…"
                className="flex-1 bg-transparent py-1.5 text-lg outline-none placeholder:text-ink-soft"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="shrink-0 text-ink-soft hover:text-purple"
              >
                <IconClose className="size-5" />
              </button>
            </form>

            {query.trim() && (
              <ul className="mt-2 border-t border-dust/20">
                {results.length === 0 ? (
                  <li className="py-3 text-sm text-ink-soft">
                    No results for &ldquo;{query}&rdquo;.
                  </li>
                ) : (
                  results.map((r) => (
                    <li key={`${r.href}-${r.title}`} className="border-b border-dust/15">
                      <Link
                        href={r.href}
                        onClick={closeSearch}
                        className="block py-3 transition-colors hover:text-purple"
                      >
                        <span className="text-[15px] font-medium">{r.title}</span>
                        <span className="mt-0.5 block truncate text-sm text-ink-soft">
                          {r.excerpt}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-black/5 bg-surface md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {mainNav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block px-2 py-2.5 text-base font-medium text-ink hover:text-purple"
                >
                  {item.label}
                </Link>
                {item.children?.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={close}
                    className="block px-6 py-2 text-[15px] text-ink-soft hover:text-purple"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/donate"
              onClick={close}
              className="mt-2 bg-yellow px-4 py-3 text-center font-semibold text-ink"
            >
              Donate
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
