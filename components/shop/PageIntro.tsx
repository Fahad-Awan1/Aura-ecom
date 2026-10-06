"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onSiteLoaded } from "@/lib/loaded";

/** Dark banner at the top of inner pages; the title rises letter by letter. */
export default function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create("[data-t]", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set("[data-fade]", { autoAlpha: 0, y: 20 });
      const off = onSiteLoaded(() => {
        gsap.to(split.chars, { yPercent: 0, duration: 1.3, stagger: 0.025, ease: "expo.out", delay: 0.45 });
        gsap.to("[data-fade]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out", delay: 0.6 });
      });
      gsap.to("[data-t]", { yPercent: 30, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      return () => {
        off();
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden px-5 pb-16 pt-40 text-center text-cream md:pb-24 md:pt-48"
      style={{ background: "radial-gradient(120% 120% at 60% 0%, #7d6350 0%, #4f3b2d 55%, #3b2a1e 100%)" }}
    >
      <div className="pointer-events-none absolute -right-[10%] -top-1/2 h-[200%] w-[30%] rotate-[28deg] bg-gradient-to-r from-transparent via-[#f3dcc1]/15 to-transparent blur-2xl" />
      <p data-fade className="eyebrow text-gold">
        {eyebrow}
      </p>
      <h1 data-t className="mt-4 font-serif text-[clamp(3rem,10vw,8rem)] leading-[0.95]">
        {title}
      </h1>
      {subtitle && (
        <p data-fade className="mx-auto mt-5 max-w-xl text-cream/70">
          {subtitle}
        </p>
      )}
    </section>
  );
}
