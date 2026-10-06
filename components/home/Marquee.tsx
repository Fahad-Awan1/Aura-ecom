"use client";

import { useRef } from "react";
import { StarMark } from "@/components/ui/Logo";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const WORDS = ["Timeless", "Elegant", "Crafted", "Aura", "Effortless", "Refined"];

/** Infinite serif ticker; scrolling speeds it up and flips its direction. */
export default function Marquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      const loops = rows.map((row, i) =>
        gsap.to(row, { xPercent: i % 2 ? 0 : -50, startAt: { xPercent: i % 2 ? -50 : 0 }, duration: 38, ease: "none", repeat: -1 }),
      );
      let dir = 1;
      let boost = 0;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => {
          dir = s.direction;
          boost = Math.min(Math.abs(s.getVelocity()) / 400, 6);
        },
      });
      const tick = () => {
        boost *= 0.92;
        const target = dir * (1 + boost);
        loops.forEach((l) => l.timeScale(l.timeScale() + (target - l.timeScale()) * 0.1));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  const row = (outline: boolean) => (
    <div data-row className="flex w-max shrink-0 items-center">
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
          {WORDS.map((w) => (
            <span key={w} className="flex items-center">
              <span className={outline ? "text-transparent [-webkit-text-stroke:1.2px_var(--sand)]" : "text-brown-900"}>{w}</span>
              <StarMark className="mx-8 h-8 w-8 text-gold md:mx-12 md:h-10 md:w-10" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <section ref={root} className="overflow-hidden bg-white py-10 md:py-14" aria-label="Aura values">
      <div className="font-serif text-[16vw] leading-[1.05] md:text-[8.5rem]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
