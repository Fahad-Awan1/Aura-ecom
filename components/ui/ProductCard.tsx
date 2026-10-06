"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Heart, Plus, X } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { useShop } from "@/lib/store";
import { flyToCart } from "@/lib/flyToCart";

type Props = { product: Product; initialColor?: string; className?: string; sizes?: string };

export default function ProductCard({ product, initialColor, className, sizes = "(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" }: Props) {
  const addToCart = useShop((s) => s.addToCart);
  const toast = useShop((s) => s.toast);
  const wished = useShop((s) => s.wishlist.includes(product.slug));
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const [color, setColor] = useState(initialColor ?? product.colors[0].name);
  // colour images are only mounted once requested (hover/tap on a swatch) so cards stay light
  const [loaded, setLoaded] = useState<string[]>([color]);
  const [picking, setPicking] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const current = product.colors.find((c) => c.name === color) ?? product.colors[0];
  const href = `/shop/${product.slug}${current.name !== product.colors[0].name ? `?color=${encodeURIComponent(current.name)}` : ""}`;

  const preload = (name: string) => setLoaded((l) => (l.includes(name) ? l : [...l, name]));
  const pick = (name: string) => {
    preload(name);
    setColor(name);
  };

  const add = (size: string) => {
    addToCart({ slug: product.slug, size, color: current.name });
    flyToCart(frame.current?.querySelector<HTMLImageElement>("[data-active='true'] img") ?? null);
    toast({ title: `${product.name} · ${current.name}${size !== "One Size" ? ` · ${size}` : ""}`, image: current.image });
    setPicking(false);
  };

  // gentle 3D tilt + moving light, written straight to CSS variables (no re-render)
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = frame.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = (e: React.PointerEvent) => {
    // touch fires pointerleave right after a tap, which would close the size picker immediately
    if (e.pointerType !== "mouse") return;
    const el = frame.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    setPicking(false);
  };

  return (
    <article className={clsx("group/card relative [perspective:1000px]", className)}>
      <div
        ref={frame}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream shadow-[0_1px_0_rgba(59,42,30,0.04)] transition-[transform,box-shadow] duration-500 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] group-hover/card:shadow-[0_30px_60px_-25px_rgba(59,42,30,0.45)]"
      >
        <Link href={href} aria-label={`${product.name} in ${current.name}`} className="absolute inset-0">
          {product.colors
            .filter((c) => loaded.includes(c.name))
            .map((c) => (
              <div
                key={c.name}
                data-active={c.name === current.name}
                className={clsx("absolute inset-0 transition-opacity duration-700", c.name === current.name ? "opacity-100" : "opacity-0")}
              >
                <Image
                  src={c.image}
                  alt={`${product.name} — ${c.name}`}
                  fill
                  sizes={sizes}
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:scale-[1.08]"
                />
              </div>
            ))}
          {/* light that follows the pointer */}
          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.28),transparent_55%)] group-hover/card:opacity-100" />
          {/* sheen sweep */}
          <span className="pointer-events-none absolute -inset-y-4 left-0 w-1/2 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1.1s] ease-out group-hover/card:translate-x-[260%]" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brown-950/35 to-transparent opacity-70 transition-opacity duration-500 group-hover/card:opacity-100" />
        </Link>

        {product.isNew && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-ivory/90 px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.2em] text-brown-900 backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-[0.6rem]">
            New
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-ivory/90 text-brown-900 backdrop-blur transition-transform hover:scale-110 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart className={clsx("h-4 w-4 transition-colors", wished && "fill-gold text-gold")} strokeWidth={1.5} />
        </button>

        {/* quick add: always visible; apparel opens an inline size picker */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3">
          {picking ? (
            <div className="rounded-xl bg-ivory/95 p-2.5 shadow-lg backdrop-blur-md sm:p-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-taupe sm:text-[0.62rem]">Select size</span>
                <button onClick={() => setPicking(false)} aria-label="Close size picker" className="grid h-6 w-6 place-items-center rounded-full hover:bg-brown-900/5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => add(s)}
                    className="min-w-9 rounded-full border border-brown-900/15 px-2 py-1.5 text-[0.7rem] transition-colors hover:border-brown-900 hover:bg-brown-900 hover:text-cream"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => (product.sizes.length === 1 ? add(product.sizes[0]) : setPicking(true))}
              className="group/btn relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-brown-900/90 py-2.5 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cream shadow-lg backdrop-blur transition-colors sm:gap-2 sm:py-3 sm:text-[0.65rem]"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover/btn:scale-y-100" />
              <Plus className="relative h-3.5 w-3.5" />
              <span className="relative">Quick add</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2 sm:mt-4 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.58rem] uppercase tracking-[0.2em] text-taupe sm:text-[0.62rem]">
            {product.category} · {current.name}
          </p>
          <Link href={href} className="mt-1 block font-display text-[0.95rem] leading-snug hover:text-gold sm:text-lg">
            {product.name}
          </Link>
        </div>
        <div className="shrink-0 text-right text-[0.8rem] sm:text-sm">
          <p className="font-medium">{formatPrice(product.price)}</p>
          {product.compareAt && <p className="text-[0.7rem] text-taupe line-through sm:text-xs">{formatPrice(product.compareAt)}</p>}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2" role="radiogroup" aria-label="Colour">
        {product.colors.map((c) => (
          <button
            key={c.name}
            role="radio"
            aria-checked={c.name === current.name}
            aria-label={c.name}
            title={c.name}
            onPointerEnter={() => preload(c.name)}
            onClick={() => pick(c.name)}
            className={clsx(
              "relative h-5 w-5 rounded-full p-[2px] ring-1 transition-all duration-300 sm:h-[22px] sm:w-[22px]",
              c.name === current.name ? "ring-brown-900" : "ring-transparent hover:ring-brown-900/30",
            )}
          >
            <span className="block h-full w-full rounded-full border border-black/10" style={{ background: c.hex }} />
          </button>
        ))}
      </div>
    </article>
  );
}
