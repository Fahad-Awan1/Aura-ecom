"use client";

import Image from "next/image";
import { useRef } from "react";
import clsx from "clsx";
import { Headset, LayoutGrid, Package, ShieldCheck } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onSiteLoaded } from "@/lib/loaded";
import { siteImages } from "@/lib/products";

// solid / outline treatment per letter, as in the mockup
const LETTERS: { c: string; outline: boolean }[] = [
  { c: "S", outline: false },
  { c: "T", outline: true },
  { c: "Y", outline: false },
  { c: "L", outline: true },
  { c: "E", outline: false },
];

const FEATURES = [
  { icon: Package, title: "Free Shipping", sub: "On Orders Above ₹999" },
  { icon: ShieldCheck, title: "Secure Payment", sub: "100% Safe & Encrypted" },
  { icon: LayoutGrid, title: "Trendy Collections", sub: "New Styles Weekly" },
  { icon: Headset, title: "24/7 Support", sub: "We're Here for You" },
];

function Word({ layer }: { layer: "base" | "over" }) {
  return (
    <div
      aria-hidden={layer === "over"}
      className={clsx(
        "pointer-events-none absolute inset-x-0 top-[50%] flex -translate-y-[58%] justify-center font-serif leading-[0.78] tracking-[-0.02em] select-none",
        "text-[26vw] md:text-[clamp(5.5rem,22.5vw,24rem)]",
        layer === "base" ? "z-10" : "z-30",
      )}
    >
      {LETTERS.map((l, i) => (
        <span key={i} className="inline-block overflow-hidden px-[0.01em] pb-[0.04em]">
          <span
            data-l={i}
            className={clsx(
              "inline-block will-change-transform",
              layer === "base" && (l.outline ? "text-outline" : "text-cream"),
              // the overlay layer only draws hairlines so they cross the model
              layer === "over" && "text-transparent [-webkit-text-stroke:1px_rgba(245,239,232,0.55)]",
            )}
          >
            {l.c}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const q = gsap.utils.selector(root);

      // ---- intro (after preloader) ----
      gsap.set(q("[data-l]"), { yPercent: 105 });
      gsap.set(q("[data-model]"), { autoAlpha: 0, y: 80, scale: 1.08 });
      gsap.set(q("[data-feature], [data-caption] span"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-bar]"), { autoAlpha: 0, scaleX: 0.9 });
      gsap.set(q("[data-beam]"), { autoAlpha: 0 });

      const intro = () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(q("[data-beam]"), { autoAlpha: 1, duration: 2.4, ease: "power2.out" }, 0);
        LETTERS.forEach((_, i) => tl.to(q(`[data-l="${i}"]`), { yPercent: 0, duration: 1.5 }, 0.1 + i * 0.08));
        tl.to(q("[data-model]"), { autoAlpha: 1, y: 0, scale: 1, duration: 1.8 }, 0.35)
          .to(q("[data-caption] span"), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.9)
          .to(q("[data-bar]"), { autoAlpha: 1, scaleX: 1, duration: 1.2 }, 0.9)
          .to(q("[data-feature]"), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 1.05);
        if (reduce) tl.progress(1);
      };
      const off = onSiteLoaded(intro);
      if (reduce) return off;

      // ---- scroll: letters drift apart, model steps forward ----
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 };
      const spread = [-22, -10, 0, 10, 22];
      LETTERS.forEach((_, i) =>
        gsap.to(q(`[data-l="${i}"]`), { xPercent: spread[i] * 4, ease: "none", scrollTrigger: st }),
      );
      gsap.to(q("[data-model-scroll]"), { yPercent: 8, scale: 1.12, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-beam-scroll]"), { xPercent: 25, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-fade]"), { autoAlpha: 0, y: -40, ease: "none", scrollTrigger: { ...st, end: "40% top" } });

      // ---- pointer parallax with a hint of 3D ----
      if (!window.matchMedia("(hover: hover)").matches) return off;
      const word = q("[data-word]");
      const qx = (sel: string, d = 1) => gsap.quickTo(q(sel), "x", { duration: d, ease: "power3" });
      const qy = (sel: string, d = 1) => gsap.quickTo(q(sel), "y", { duration: d, ease: "power3" });
      const wordX = word.map((w) => gsap.quickTo(w, "rotationY", { duration: 1.2, ease: "power3" }));
      const wordY = word.map((w) => gsap.quickTo(w, "rotationX", { duration: 1.2, ease: "power3" }));
      const mX = qx("[data-model-move]"), mY = qy("[data-model-move]");
      const bX = qx("[data-beam-move]", 1.6), bY = qy("[data-beam-move]", 1.6);
      const tX = word.map((w) => gsap.quickTo(w, "x", { duration: 1.2, ease: "power3" }));

      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        wordX.forEach((f) => f(nx * 10));
        wordY.forEach((f) => f(-ny * 6));
        tX.forEach((f) => f(nx * -24));
        mX(nx * 26);
        mY(ny * 12);
        bX(nx * -60);
        bY(ny * -30);
      };
      root.current!.addEventListener("pointermove", move);
      return () => {
        off();
        root.current?.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#6b5442] [perspective:1200px]"
      style={{
        background:
          "radial-gradient(120% 90% at 60% 40%, #8a6f5a 0%, #6e5644 45%, #4f3b2d 100%)",
      }}
    >
      {/* floor shadow + vignette */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#3e2e22]/70 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_220px_rgba(30,20,12,0.55)]" />

      {/* diagonal light beam */}
      <div data-beam className="pointer-events-none absolute inset-0">
        <div data-beam-scroll className="absolute inset-0">
          <div data-beam-move className="absolute -right-[10%] -top-[30%] h-[160%] w-[38%] rotate-[28deg] bg-gradient-to-r from-transparent via-[#f3dcc1]/25 to-transparent blur-2xl" />
          <div data-beam-move className="absolute right-[12%] -top-[30%] h-[160%] w-[10%] rotate-[28deg] bg-gradient-to-r from-transparent via-[#f8e7d2]/15 to-transparent blur-xl" />
        </div>
      </div>

      <div data-word className="absolute inset-0 [transform-style:preserve-3d]">
        <Word layer="base" />
      </div>

      {/* model */}
      <div className="absolute inset-0 z-20 flex justify-center">
        <div data-model-scroll className="relative h-full w-full max-w-[1440px] origin-bottom">
          <div className="absolute bottom-[12%] left-1/2 aspect-[842/2063] h-[68%] -translate-x-1/2 md:bottom-[-2%] md:left-[57%] md:h-[86%]">
            <div data-model-move className="h-full w-full">
              <div data-model className="relative h-full w-full">
                <Image src={siteImages.heroModel} alt="Model wearing a camel wool coat" fill priority sizes="(max-width:768px) 60vw, 30vw" className="object-contain object-bottom drop-shadow-[0_40px_40px_rgba(20,12,6,0.45)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-word className="absolute inset-0 z-30 [transform-style:preserve-3d]">
        <Word layer="over" />
      </div>

      {/* side caption */}
      <p data-caption data-fade className="absolute right-[4%] top-[47%] z-30 hidden flex-col font-serif text-[0.82rem] leading-[1.6] text-cream/75 xl:flex">
        <span>Style is a way</span>
        <span>to say who you are</span>
        <span>without speaking.</span>
      </p>

      {/* glass feature bar */}
      <div data-fade className="absolute inset-x-0 bottom-[5%] z-40 px-4 md:px-[8%]">
        <div
          data-bar
          className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-3 gap-y-4 rounded-2xl border border-cream/35 bg-white/[0.07] px-4 py-4 backdrop-blur-md md:px-6 md:py-5 lg:grid-cols-4 lg:py-6"
        >
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div key={title} data-feature className="group flex items-center gap-3 md:gap-4 md:pl-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream/25 text-cream/80 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/20 md:h-10 md:w-10">
                <Icon className="h-4 w-4" strokeWidth={1.3} />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.72rem] font-medium text-cream md:text-[0.78rem]">{title}</span>
                <span className="block text-[0.62rem] text-cream/55 md:text-[0.68rem]">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
