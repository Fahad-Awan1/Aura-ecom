"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useShop } from "@/lib/store";
import { formatPrice, getColor, getProduct } from "@/lib/products";
import { gsap } from "@/lib/gsap";

const FREE_SHIPPING = 999;

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart } = useShop();
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const p = panel.current!;
    const o = overlay.current!;
    if (first.current) {
      gsap.set(p, { x: 0, xPercent: 100 }); // x:0 drops the px offset GSAP parses from the inline translateX
      gsap.set(o, { autoAlpha: 0 });
      first.current = false;
      if (!cartOpen) return;
    }
    if (cartOpen) {
      gsap.to(o, { autoAlpha: 1, duration: 0.5 });
      gsap.to(p, { xPercent: 0, duration: 0.8, ease: "expo.out" });
      gsap.fromTo(p.querySelectorAll("[data-line]"), { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.06, delay: 0.2, duration: 0.6, ease: "expo.out" });
    } else {
      gsap.to(o, { autoAlpha: 0, duration: 0.4 });
      gsap.to(p, { xPercent: 100, duration: 0.6, ease: "expo.inOut" });
    }
  }, [cartOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  const lines = cart
    .map((c) => {
      const product = getProduct(c.slug);
      return { ...c, product, variant: product && getColor(product, c.color) };
    })
    .filter((l) => l.product);
  const subtotal = lines.reduce((n, l) => n + l.product!.price * l.qty, 0);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <>
      <div ref={overlay} onClick={() => setCartOpen(false)} className="invisible fixed inset-0 z-[60] bg-brown-950/50 backdrop-blur-sm" />
      <aside
        ref={panel}
        aria-label="Shopping bag"
        aria-hidden={!cartOpen}
        className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-ivory text-ink shadow-2xl"
        data-lenis-prevent
        style={{ transform: "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-brown-900/10 px-7 py-6">
          <h2 className="font-display text-2xl">Your Bag</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-brown-900/5">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-7 pt-5">
          <p className="text-xs text-taupe">
            {remaining > 0 ? (
              <>
                You are <b className="text-brown-900">{formatPrice(remaining)}</b> away from free shipping
              </>
            ) : (
              "You've unlocked free shipping ✦"
            )}
          </p>
          <div className="mt-2 h-[3px] overflow-hidden rounded bg-brown-900/10">
            <div className="h-full bg-gold transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-6">
          {lines.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-xl">Your bag is empty</p>
              <Link href="/shop" onClick={() => setCartOpen(false)} className="eyebrow border-b border-brown-900 pb-1 text-[0.68rem]">
                Discover the collection
              </Link>
            </div>
          )}
          {lines.map((l, i) => (
            <div key={`${l.slug}-${l.size}-${l.color}`} data-line className="flex gap-4">
              <div className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-cream">
                <Image src={l.variant!.image} alt={`${l.product!.name} — ${l.variant!.name}`} fill sizes="90px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link href={`/shop/${l.slug}`} onClick={() => setCartOpen(false)} className="font-display text-lg leading-tight hover:text-gold">
                    {l.product!.name}
                  </Link>
                  <button onClick={() => removeFromCart(i)} aria-label="Remove" className="text-taupe hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-taupe">
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: l.variant!.hex }} /> {l.variant!.name} · {l.size}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-brown-900/15">
                    <button onClick={() => setQty(i, l.qty - 1)} className="grid h-8 w-8 place-items-center" aria-label="Decrease">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                    <button onClick={() => setQty(i, l.qty + 1)} className="grid h-8 w-8 place-items-center" aria-label="Increase">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(l.product!.price * l.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-brown-900/10 px-7 py-6">
          <div className="flex justify-between text-sm">
            <span className="text-taupe">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-taupe">Taxes and shipping calculated at checkout.</p>
          <button
            disabled={lines.length === 0}
            className="group relative mt-5 w-full overflow-hidden rounded-full bg-brown-900 py-4 text-xs font-medium uppercase tracking-[0.25em] text-cream disabled:opacity-40"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-500 group-hover:scale-y-100" />
            <span className="relative">Checkout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
