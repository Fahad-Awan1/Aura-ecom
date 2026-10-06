"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/lib/products";
import { gsap, ScrollTrigger, useGSAP, SplitText } from "@/lib/gsap";

/** Pinned section: vertical scroll drives the product rail horizontally; cards skew with velocity. */
export default function NewArrivals() {
  const root = useRef<HTMLElement>(null);
  const items = products.filter((p) => p.isNew).concat(products.filter((p) => !p.isNew).slice(0, 3));

  useGSAP(
    () => {
      const split = SplitText.create("[data-big]", { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.03,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const rail = root.current!.querySelector<HTMLElement>("[data-rail]")!;
        const distance = () => rail.scrollWidth - window.innerWidth + 80;
        const skew = gsap.quickTo("[data-skewcard]", "skewX", { duration: 0.5, ease: "power3" });
        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (s) => {
              skew(gsap.utils.clamp(-8, 8, s.getVelocity() / -300));
              gsap.set("[data-progress]", { scaleX: s.progress });
            },
            onScrubComplete: () => skew(0),
          },
        });
        return () => tween.scrollTrigger?.kill();
      });
      return () => {
        split.revert();
        mm.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white">
      <div data-pin className="flex min-h-screen flex-col justify-center overflow-hidden py-16">
        <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6 px-5 md:px-10">
          <div>
            <p className="eyebrow text-gold">Just landed</p>
            <h2 data-big className="mt-2 font-display text-[3rem] leading-none md:text-[5.5rem]">
              New Arrivals
            </h2>
          </div>
          <Link href="/new-arrivals" className="group hidden items-center gap-3 pb-2 text-xs font-medium uppercase tracking-[0.22em] md:flex">
            View all
            <span className="grid h-10 w-10 place-items-center rounded-full border border-brown-900/20 transition-colors group-hover:bg-brown-900 group-hover:text-cream">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="mt-10 md:mt-14">
          <div data-rail className="no-scrollbar flex gap-5 overflow-x-auto px-5 max-md:snap-x max-md:snap-mandatory md:w-max md:gap-8 md:overflow-visible md:px-10">
            {items.map((p) => (
              <div key={p.slug} data-skewcard className="md:will-change-transform w-[70vw] shrink-0 snap-start sm:w-[42vw] md:w-[24vw] md:max-w-[340px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 hidden w-full max-w-[1440px] px-10 md:block">
          <div className="h-px w-full bg-brown-900/10">
            <div data-progress className="h-px origin-left scale-x-0 bg-brown-900" />
          </div>
        </div>
      </div>
    </section>
  );
}
