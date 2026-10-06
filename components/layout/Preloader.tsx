"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { markSiteLoaded as finish } from "@/lib/loaded";

/**
 * Resolves once web fonts are ready and every image in the first viewport is decoded,
 * so the reveal never lands on half-painted content. Capped so a slow network can't hold the page.
 */
function pageReady(maxMs = 3000) {
  const images = [...document.querySelectorAll<HTMLImageElement>("main img")]
    .filter((img) => img.getBoundingClientRect().top < window.innerHeight)
    .map((img) => (img.complete ? img.decode() : new Promise((r) => img.addEventListener("load", r, { once: true })).then(() => img.decode())).catch(() => {}));
  return Promise.race([Promise.all([document.fonts.ready, ...images]), new Promise((r) => setTimeout(r, maxMs))]);
}

const SEEN_KEY = "aura-seen";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        finish();
        setDone(true);
        return;
      }
      const counter = { v: 0 };
      const num = root.current!.querySelector<HTMLSpanElement>("[data-count]")!;
      let ready = false;
      const readyPromise = pageReady().then(() => (ready = true));
      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });
      tl.from("[data-letter]", { yPercent: 110, duration: 0.9, stagger: 0.07, ease: "expo.out" })
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, "0")),
        }, 0.1)
        .to("[data-bar]", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.1)
        // hold here until fonts and above-the-fold images are decoded
        .add(() => {
          if (ready) return;
          tl.pause();
          readyPromise.then(() => tl.resume());
        })
        .to("[data-letter]", { yPercent: -110, duration: 0.6, stagger: 0.04, ease: "expo.in" }, ">-0.1")
        .to("[data-meta]", { autoAlpha: 0, duration: 0.3 }, "<")
        .add(finish, ">-0.1")
        .to("[data-panel]", { yPercent: -100, duration: 1.1, stagger: 0.08, ease: "expo.inOut" }, "<");

      // reloads within the same session get a quick version of the intro
      try {
        if (sessionStorage.getItem(SEEN_KEY)) tl.timeScale(2.6);
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] pointer-events-auto" aria-hidden>
      <div data-panel className="absolute inset-0 bg-gold" />
      <div data-panel className="absolute inset-0 bg-brown-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex overflow-hidden font-serif text-[18vw] md:text-[10rem] leading-none text-cream">
            {"AURA".split("").map((l, i) => (
              <span key={i} data-letter className="inline-block">
                {l}
              </span>
            ))}
          </div>
          <div data-meta className="flex w-64 items-center gap-4 text-cream/70">
            <div className="relative h-px flex-1 bg-cream/20">
              <div data-bar className="absolute inset-0 origin-left scale-x-0 bg-gold" />
            </div>
            <span data-count className="font-sans text-xs tracking-[0.3em] tabular-nums">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
