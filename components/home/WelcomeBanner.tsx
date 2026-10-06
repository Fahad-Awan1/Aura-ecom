"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Gem, Heart } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { siteImages } from "@/lib/products";
import { onSiteLoaded } from "@/lib/loaded";

const SilkScene = dynamic(() => import("@/components/three/SilkScene"), { ssr: false });

function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 7.5a2 2 0 1 0-2-2" />
      <path d="M12 7.5v1.2L2.8 15.4a1.3 1.3 0 0 0 .8 2.4h16.8a1.3 1.3 0 0 0 .8-2.4L12 8.7" />
    </svg>
  );
}

const VALUES = [
  { icon: Gem, title: "Premium Quality", sub: "Crafted with care" },
  { icon: Hanger, title: "Latest Collections", sub: "Stay on trend" },
  { icon: Heart, title: "Your Style, Our Promise", sub: "Made to make you shine" },
];

export default function WelcomeBanner() {
  const root = useRef<HTMLElement>(null);
  const velocity = useRef(0);
  const [active, setActive] = useState(false);
  // the three.js chunk (~900KB) is only fetched once the visitor scrolls near the banner
  const [near, setNear] = useState(false);

  useGSAP(
    () => {
      // Set up WebGL while the visitor is still reading the hero: after the intro has played, in idle time.
      // Scrolling close to the banner first also triggers it, whichever happens sooner.
      const idle = (fn: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
      let timer = 0;
      const offLoaded = onSiteLoaded(() => {
        timer = window.setTimeout(() => idle(() => setNear(true)), 2600);
      });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom+=50%",
        once: true,
        onEnter: () => setNear(true),
      });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (s) => setActive(s.isActive),
        onUpdate: (s) => (velocity.current = Math.min(Math.abs(s.getVelocity()) / 2500, 1.5)),
      });

      // card grows into place; a transform stays on the GPU, unlike the clip-path this used to scrub
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          "[data-card]",
          { scale: 0.86 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 95%", end: "top 25%", scrub: 0.8 },
          },
        );
      });
      gsap.fromTo("[data-rack]", { yPercent: -10, scale: 1.2 }, { yPercent: 10, scale: 1.05, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });

      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-values]", start: "top 85%" } });
      tl.from("[data-ring] circle", { strokeDashoffset: 176, duration: 1.4, stagger: 0.15, ease: "expo.out" })
        .from("[data-ico]", { scale: 0, rotation: -40, duration: 1, stagger: 0.15, ease: "back.out(2)" }, 0.2)
        .from("[data-vtext]", { y: 20, autoAlpha: 0, duration: 1, stagger: 0.15, ease: "expo.out" }, 0.3)
        .from("[data-vline]", { scaleY: 0, duration: 1, stagger: 0.15, ease: "expo.out" }, 0.3)
        .from("[data-dash]", { scaleX: 0, duration: 0.8, stagger: 0.15, ease: "expo.out" }, 0.6);

      return () => {
        mm.revert();
        offLoaded();
        window.clearTimeout(timer);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white px-3 pb-16 md:px-[4.5%] md:pb-24">
      <div data-card className="relative mx-auto grid will-change-transform max-w-[1320px] overflow-hidden rounded-[28px] bg-brown-900 md:min-h-[560px] md:grid-cols-[0.95fr_1.05fr]">
        {/* warm wall glow */}
        <div className="absolute inset-0 bg-[radial-gradient(80%_100%_at_20%_30%,#7a5a40_0%,#4a3426_45%,#2f2118_100%)]" />

        {/* rack photo, fading into the card */}
        <div className="relative h-[340px] overflow-hidden md:h-auto">
          <div data-rack className="absolute inset-0 will-change-transform">
            <Image src={siteImages.rack} alt="Clothing rack with neutral-toned garments" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-brown-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-brown-900" />
          <div className="absolute inset-0 bg-[#3b2a1e]/20 mix-blend-multiply" />
        </div>

        {/* content */}
        <div className="relative flex flex-col items-center justify-center px-6 py-14 md:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen">
            {near && <SilkScene active={active} velocity={velocity} />}
          </div>
          <div className="relative">
            <SectionHeading eyebrow="Welcome to" title="More Than Fashion" subtitle="Discover quality. Experience elegance." tone="light" />
            <div className="mx-auto mt-5 h-px w-12 bg-gold/70" />

            <div data-values className="mt-10 grid grid-cols-3">
              {VALUES.map(({ icon: Icon, title, sub }, i) => (
                <div key={title} className="relative flex flex-col items-center px-2 text-center md:px-5">
                  {i > 0 && <span data-vline className="absolute left-0 top-0 h-[80%] w-px origin-top bg-cream/25" />}
                  <div className="group relative grid h-14 w-14 place-items-center md:h-16 md:w-16">
                    <svg data-ring viewBox="0 0 60 60" className="absolute inset-0 h-full w-full -rotate-90 text-cream/70 transition-colors duration-500 group-hover:text-gold">
                      <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="176" strokeDashoffset="0" />
                    </svg>
                    <span data-ico className="block text-cream">
                      <Icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.2} />
                    </span>
                  </div>
                  <p data-vtext className="mt-4 text-[0.72rem] font-medium text-cream md:text-[0.85rem]">
                    {title}
                  </p>
                  <p data-vtext className="mt-1 text-[0.62rem] text-cream/60 md:text-[0.72rem]">
                    {sub}
                  </p>
                  <span data-dash className="mt-3 h-px w-5 bg-gold/70" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
