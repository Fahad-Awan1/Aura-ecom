"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Image from "next/image";
import { categories } from "@/lib/products";
import { gsap, useGSAP } from "@/lib/gsap";

export default function CategoryGrid() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-card]", {
        y: 120,
        rotationX: -25,
        autoAlpha: 0,
        transformOrigin: "50% 100%",
        duration: 1.4,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-grid]", start: "top 85%" },
      });

      // 3D tilt following the pointer
      if (!window.matchMedia("(hover: hover)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-tilt]");
      const cleanups = cards.map((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
        const shine = card.querySelector<HTMLElement>("[data-shine]")!;
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          ry(x * 14);
          rx(-y * 14);
          shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.55), transparent 55%)`;
        };
        const leave = () => {
          rx(0);
          ry(0);
          shine.style.background = "transparent";
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        };
      });
      return () => cleanups.forEach((c) => c());
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-white px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-24">
      <SectionHeading eyebrow="Shop by Category" title="Find Your Perfect Style" subtitle="Curated collections for every mood, moment and occasion." />

      <div data-grid className="mx-auto mt-12 grid max-w-[1180px] grid-cols-2 gap-4 [perspective:1400px] md:mt-14 md:gap-6 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.slug} data-card>
            <Link
              href={`/shop?category=${c.slug}`}
              data-tilt
             
              className="group relative block aspect-[0.86] overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-18px_rgba(59,42,30,0.35),0_0_0_1px_rgba(59,42,30,0.05)] transition-shadow duration-500 [transform-style:preserve-3d] hover:shadow-[0_40px_70px_-25px_rgba(59,42,30,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#f1ece6]" />
              <div className="absolute inset-x-[6%] bottom-0 top-[5%] transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1 group-hover:scale-[1.07]">
                <Image src={c.image} alt={c.label} fill sizes="(max-width:1024px) 45vw, 280px" className="object-contain object-bottom" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-white via-white/95 to-white/70 px-5 pb-4 pt-6 backdrop-blur-[2px] md:px-6 md:pb-5">
                <span className="font-display text-[1.1rem] md:text-[1.35rem]">{c.label}</span>
                <span className="relative grid h-8 w-8 place-items-center overflow-hidden">
                  <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-8" strokeWidth={1.4} />
                  <ArrowRight className="absolute h-5 w-5 -translate-x-8 text-gold transition-transform duration-500 group-hover:translate-x-0" strokeWidth={1.4} />
                </span>
              </div>
              <div data-shine className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
