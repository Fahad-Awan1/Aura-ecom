"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/products";
import { matchColor, POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { gsap } from "@/lib/gsap";

/** Full-width search sheet with live results. Opens from the header icon, "/" or Ctrl/⌘+K. */
export default function SearchOverlay() {
  const router = useRouter();
  const open = useShop((s) => s.searchOpen);
  const setOpen = useShop((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1); // -1 = nothing highlighted, Enter shows all results
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (q.trim() ? searchProducts(q).slice(0, 6) : []), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    const el = panel.current!;
    if (open) {
      gsap.set(el, { display: "block" });
      gsap.fromTo(el.querySelector("[data-sheet]"), { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: "expo.out" });
      gsap.fromTo(el.querySelector("[data-bg]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      window.setTimeout(() => input.current?.focus(), 150);
    } else if (el.style.display === "block") {
      gsap.to(el.querySelector("[data-sheet]"), { yPercent: -100, duration: 0.5, ease: "expo.in" });
      gsap.to(el.querySelector("[data-bg]"), { autoAlpha: 0, duration: 0.4, onComplete: () => void gsap.set(el, { display: "none" }) });
    }
  }, [open]);

  const go = (query: string) => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const p = results[active];
      if (p) {
        setOpen(false);
        router.push(`/shop/${p.slug}`);
      } else go(q);
    }
  };

  return (
    <div ref={panel} className="fixed inset-0 z-[65] hidden" role="dialog" aria-modal="true" aria-label="Search">
      <div data-bg onClick={() => setOpen(false)} className="absolute inset-0 bg-brown-950/50 backdrop-blur-sm" />
      <div data-sheet className="relative max-h-[100dvh] overflow-y-auto bg-ivory shadow-2xl" data-lenis-prevent>
        <div className="mx-auto max-w-[1100px] px-5 pb-10 pt-6 md:px-10 md:pt-10">
          <div className="flex items-center gap-3 border-b-2 border-brown-900 pb-3 md:gap-5 md:pb-4">
            <Search className="h-5 w-5 shrink-0 text-taupe md:h-6 md:w-6" strokeWidth={1.5} />
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search coats, red bags, heels under 5000…"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent font-display text-2xl text-ink placeholder:text-taupe/50 focus:outline-none md:text-4xl"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-xs uppercase tracking-[0.2em] text-taupe hover:text-ink">
                Clear
              </button>
            )}
            <button onClick={() => setOpen(false)} aria-label="Close search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-brown-900/5">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          {!q.trim() && (
            <div className="mt-8">
              <p className="eyebrow text-[0.68rem] text-taupe">Popular searches</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    type="button"
                    className="rounded-full border border-brown-900/15 px-4 py-2 text-sm transition-colors hover:border-brown-900 hover:bg-brown-900 hover:text-cream"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.trim() && (
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow text-[0.68rem] text-taupe">{results.length ? `Products (${searchProducts(q).length})` : "No matches"}</p>
                {results.length > 0 && (
                  <button onClick={() => go(q)} className="group flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]">
                    See all results <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
              {results.length === 0 ? (
                <p className="mt-6 text-ink/70">
                  Nothing found for “{q}”. Try a category like <b>bags</b>, a colour like <b>black</b>, or a budget like <b>under 5000</b>.
                </p>
              ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p, i) => {
                    const c = matchColor(p, q) ?? p.colors[0];
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/shop/${p.slug}${c.name !== p.colors[0].name ? `?color=${encodeURIComponent(c.name)}` : ""}`}
                          onClick={() => setOpen(false)}
                          onPointerEnter={() => setActive(i)}
                          className={`flex items-center gap-4 rounded-2xl p-2 transition-colors ${i === active ? "bg-cream" : ""}`}
                        >
                          <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                            <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-display text-lg leading-tight">{p.name}</span>
                            <span className="mt-0.5 block text-xs capitalize text-taupe">
                              {p.category} · {c.name}
                            </span>
                            <span className="mt-1 block text-sm">{formatPrice(p.price)}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
