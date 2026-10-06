"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
  className?: string;
};

/** "— EYEBROW —" + serif title + subtitle, revealed word-by-word on scroll. */
export default function SectionHeading({ eyebrow, title, subtitle, tone = "dark", className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create("[data-title]", { type: "words", mask: "words" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 85%" } });
      tl.from("[data-rule]", { scaleX: 0, duration: 1.2, ease: "expo.out" })
        .from("[data-eyebrow]", { autoAlpha: 0, letterSpacing: "0.6em", duration: 1.2, ease: "expo.out" }, 0)
        .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.06, ease: "expo.out" }, 0.1)
        .from("[data-sub]", { autoAlpha: 0, y: 16, duration: 1, ease: "expo.out" }, 0.4);
      return () => split.revert();
    },
    { scope: root },
  );

  const light = tone === "light";
  return (
    <div ref={root} className={clsx("text-center", className)}>
      <div className={clsx("flex items-center justify-center gap-5", light ? "text-gold" : "text-ink")}>
        <span data-rule className={clsx("h-px w-8 origin-right", light ? "bg-gold/70" : "bg-gold")} />
        <span data-eyebrow className="eyebrow text-[0.72rem] md:text-[0.8rem]">
          {eyebrow}
        </span>
        <span data-rule className={clsx("h-px w-8 origin-left", light ? "bg-gold/70" : "bg-gold")} />
      </div>
      <h2 data-title className={clsx("mt-3 font-display text-[2.4rem] leading-[1.1] md:text-[3.4rem]", light ? "text-cream" : "text-ink")}>
        {title}
      </h2>
      {subtitle && (
        <p data-sub className={clsx("mt-3 text-[0.95rem] md:text-base", light ? "text-cream/75" : "text-ink/75")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
