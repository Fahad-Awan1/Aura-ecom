"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, Heart, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { formatPrice, getColor, type Product } from "@/lib/products";
import { useShop } from "@/lib/store";
import { flyToCart } from "@/lib/flyToCart";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onSiteLoaded } from "@/lib/loaded";

export default function ProductDetail({ product, related, initialColor }: { product: Product; related: Product[]; initialColor?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [colorName, setColorName] = useState(getColor(product, initialColor).name);
  const color = getColor(product, colorName);
  const [seen, setSeen] = useState<string[]>([color.name]);
  const showColor = (name: string) => {
    setSeen((s) => (s.includes(name) ? s : [...s, name]));
    setColorName(name);
    // keep the URL shareable without a navigation
    const url = new URL(window.location.href);
    if (name === product.colors[0].name) url.searchParams.delete("color");
    else url.searchParams.set("color", name);
    window.history.replaceState(null, "", url);
  };
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const addToCart = useShop((s) => s.addToCart);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const wished = useShop((s) => s.wishlist.includes(product.slug));
  const toggleWishlist = useShop((s) => s.toggleWishlist);

  useGSAP(
    () => {
      const split = SplitText.create("[data-name]", { type: "words", mask: "words" });
      gsap.set("[data-reveal-img]", { clipPath: "inset(100% 0 0 0)" });
      gsap.set("[data-zoom]", { scale: 1.3 });
      gsap.set(split.words, { yPercent: 110 });
      gsap.set("[data-info]", { autoAlpha: 0, y: 24 });
      const off = onSiteLoaded(() => {
        const tl = gsap.timeline({ delay: 0.4, defaults: { ease: "expo.out" } });
        tl.to("[data-reveal-img]", { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut" })
          .to("[data-zoom]", { scale: 1, duration: 2 }, 0.2)
          .to(split.words, { yPercent: 0, duration: 1.2, stagger: 0.06 }, 0.6)
          .to("[data-info]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 }, 0.8);
      });

      // pointer-driven zoom lens on the main image
      const wrap = imgWrap.current!;
      const img = wrap.querySelector<HTMLElement>("[data-lens]")!;
      const move = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        gsap.to(img, {
          scale: 1.6,
          xPercent: -((e.clientX - r.left) / r.width - 0.5) * 35,
          yPercent: -((e.clientY - r.top) / r.height - 0.5) * 35,
          duration: 0.6,
          ease: "power3",
        });
      };
      const leave = () => gsap.to(img, { scale: 1, xPercent: 0, yPercent: 0, duration: 0.8, ease: "power3" });
      wrap.addEventListener("pointermove", move);
      wrap.addEventListener("pointerleave", leave);
      return () => {
        off();
        split.revert();
        wrap.removeEventListener("pointermove", move);
        wrap.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  const add = () => {
    if (!size) {
      setError(true);
      gsap.fromTo("[data-sizes]", { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      return;
    }
    addToCart({ slug: product.slug, size, color: color.name }, qty);
    flyToCart(imgWrap.current!.querySelector<HTMLImageElement>("[data-active='true'] img"));
    window.setTimeout(() => setCartOpen(true), 1100);
  };

  return (
    <div ref={root} className="bg-white pt-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Link href="/shop" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-taupe hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
          <div data-reveal-img className="md:sticky md:top-24 md:self-start">
            <div ref={imgWrap} className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-cream">
              <div data-zoom className="absolute inset-0">
                <div data-lens className="absolute inset-0">
                  {product.colors
                    .filter((c) => seen.includes(c.name))
                    .map((c) => (
                      <div key={c.name} data-active={c.name === color.name} className={clsx("absolute inset-0 transition-opacity duration-700", c.name === color.name ? "opacity-100" : "opacity-0")}>
                        <Image src={c.image} alt={`${product.name} — ${c.name}`} fill preload={c.name === color.name} sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="no-scrollbar -mx-1 mt-2 flex gap-3 overflow-x-auto p-1">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => showColor(c.name)}
                  onPointerEnter={() => setSeen((s) => (s.includes(c.name) ? s : [...s, c.name]))}
                  aria-label={`Show ${c.name}`}
                  className={clsx(
                    "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 transition-all sm:w-20",
                    c.name === color.name ? "ring-brown-900" : "ring-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={c.image} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col py-2 md:py-10">
            <p data-info className="eyebrow text-gold">
              {product.category}
            </p>
            <h1 data-name className="mt-3 font-display text-[2.6rem] leading-[1.05] md:text-[3.8rem]">
              {product.name}
            </h1>
            <div data-info className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl">{formatPrice(product.price)}</span>
              {product.compareAt && <span className="text-taupe line-through">{formatPrice(product.compareAt)}</span>}
            </div>
            <p data-info className="mt-6 max-w-md leading-relaxed text-ink/70">
              {product.description}
            </p>

            <div data-info className="mt-9">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em]">
                Colour <span className="ml-2 normal-case tracking-normal text-taupe">{color.name}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => showColor(c.name)}
                    aria-label={`Colour ${c.name}`}
                    aria-pressed={color.name === c.name}
                    title={c.name}
                    className={clsx("h-9 w-9 rounded-full border-2 p-0.5 transition-all", color.name === c.name ? "border-brown-900" : "border-transparent hover:border-brown-900/30")}
                  >
                    <span className="block h-full w-full rounded-full border border-black/10" style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>

            <div data-info className="mt-8">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em]">
                Size {error && !size && <span className="ml-2 normal-case tracking-normal text-red-700">— please select a size</span>}
              </p>
              <div data-sizes className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={clsx(
                      "min-w-12 rounded-full border px-4 py-2.5 text-sm transition-colors",
                      size === s ? "border-brown-900 bg-brown-900 text-cream" : "border-brown-900/15 hover:border-brown-900",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div data-info className="mt-10 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-brown-900/15">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="grid h-14 w-12 place-items-center" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={add}
                className="group relative h-14 min-w-[220px] flex-1 overflow-hidden whitespace-nowrap rounded-full bg-brown-900 px-6 sm:px-10 text-xs font-medium uppercase tracking-[0.25em] text-cream"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:scale-y-100" />
                <span className="relative">Add to bag — {formatPrice(product.price * qty)}</span>
              </button>
              <button
                onClick={() => toggleWishlist(product.slug)}
                aria-label="Toggle wishlist"
                className="grid h-14 w-14 place-items-center rounded-full border border-brown-900/15 transition-colors hover:border-brown-900"
              >
                <Heart className={clsx("h-5 w-5", wished && "fill-gold text-gold")} strokeWidth={1.4} />
              </button>
            </div>

            <ul data-info className="mt-10 grid gap-4 border-t border-brown-900/10 pt-8 text-sm text-ink/70 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
              <li className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gold" strokeWidth={1.3} /> Free shipping over ₹999
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-gold" strokeWidth={1.3} /> 15-day returns
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gold" strokeWidth={1.3} /> Secure checkout
              </li>
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className="py-24">
            <h2 className="font-display text-3xl md:text-4xl">You may also like</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
