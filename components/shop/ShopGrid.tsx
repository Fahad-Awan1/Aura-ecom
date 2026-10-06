"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Heart, Search, X } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { categories, products, type Category, type Product } from "@/lib/products";
import { matchColor, searchProducts } from "@/lib/search";
import { useShop } from "@/lib/store";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Sort = "featured" | "price-asc" | "price-desc" | "new";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

type Props = {
  initialCategory?: Category | "all";
  initialWishlist?: boolean;
  initialQuery?: string;
  /** restrict the catalogue, e.g. new arrivals only */
  source?: Product[];
  basePath?: string;
};

export default function ShopGrid({ initialCategory = "all", initialWishlist = false, initialQuery = "", source = products, basePath = "/shop" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [sort, setSort] = useState<Sort>("featured");
  const [onlyWishlist, setOnlyWishlist] = useState(initialWishlist);
  const [query, setQuery] = useState(initialQuery);
  const wishlist = useShop((s) => s.wishlist);

  const list = useMemo(() => {
    let l = searchProducts(query, source).filter((p) => (category === "all" || p.category === category) && (!onlyWishlist || wishlist.includes(p.slug)));
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "new") l = [...l].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return l;
  }, [source, query, category, sort, onlyWishlist, wishlist]);

  // re-run the staggered entrance whenever the visible set changes
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-item]");
      gsap.set(cards, { autoAlpha: 0, y: 60 });
      ScrollTrigger.batch(cards, {
        start: "top 95%",
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", overwrite: true }),
      });
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [list], revertOnUpdate: true },
  );

  // mirror filters into the URL without a navigation so links stay shareable
  const syncUrl = (next: { category?: Category | "all"; wishlist?: boolean; q?: string }) => {
    const c = next.category ?? category;
    const w = next.wishlist ?? onlyWishlist;
    const q = next.q ?? query;
    const params = new URLSearchParams();
    if (c !== "all") params.set("category", c);
    if (w) params.set("wishlist", "1");
    if (q.trim()) params.set("q", q.trim());
    window.history.replaceState(null, "", `${basePath}${params.size ? `?${params}` : ""}`);
  };

  const reset = () => {
    setCategory("all");
    setOnlyWishlist(false);
    setQuery("");
    syncUrl({ category: "all", wishlist: false, q: "" });
  };

  return (
    <div ref={root} className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-5 md:px-10 md:pt-10">
      <div className="sticky top-[var(--header-offset,60px)] z-20 -mx-4 border-b border-brown-900/10 bg-white/90 px-4 py-3 backdrop-blur-md transition-[top] duration-500 sm:-mx-5 sm:px-5 md:-mx-10 md:px-10 md:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 lg:order-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-brown-900/15 px-4 py-2 transition-colors focus-within:border-brown-900 lg:w-72 lg:flex-none">
              <Search className="h-4 w-4 shrink-0 text-taupe" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  syncUrl({ q: e.target.value });
                }}
                placeholder="Search products, colours…"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    syncUrl({ q: "" });
                  }}
                  aria-label="Clear search"
                  className="text-taupe hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="shrink-0 rounded-full border border-brown-900/15 bg-transparent px-3 py-2 text-xs focus:border-brown-900 focus:outline-none sm:px-4"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:order-1">
            {[{ slug: "all" as const, label: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  setCategory(c.slug);
                  syncUrl({ category: c.slug });
                }}
                className={clsx(
                  "shrink-0 rounded-full border px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 sm:px-5 sm:text-[0.68rem]",
                  category === c.slug ? "border-brown-900 bg-brown-900 text-cream" : "border-brown-900/15 text-ink hover:border-brown-900",
                )}
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={() => {
                setOnlyWishlist(!onlyWishlist);
                syncUrl({ wishlist: !onlyWishlist });
              }}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors sm:text-[0.68rem]",
                onlyWishlist ? "border-gold bg-gold text-white" : "border-brown-900/15 hover:border-brown-900",
              )}
            >
              <Heart className="h-3.5 w-3.5" /> Wishlist
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-taupe" aria-live="polite">
        {query.trim() ? (
          <>
            {list.length} {list.length === 1 ? "result" : "results"} for <span className="text-ink">“{query.trim()}”</span>
          </>
        ) : (
          `${list.length} pieces`
        )}
      </p>

      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-ink md:text-3xl">Nothing matches just yet.</p>
          <p className="mt-3 text-sm text-taupe">Try another word, a colour like “black”, or a budget like “under 5000”.</p>
          <button onClick={reset} className="mt-6 rounded-full bg-brown-900 px-6 py-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream hover:bg-gold">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 md:gap-x-8 md:gap-y-14 xl:grid-cols-4">
          {list.map((p) => {
            const color = query ? matchColor(p, query)?.name : undefined;
            return (
              <div key={`${p.slug}-${color ?? ""}`} data-item>
                <ProductCard product={p} initialColor={color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
