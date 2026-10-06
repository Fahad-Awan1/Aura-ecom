"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { products, siteImages } from "@/lib/products";

const COLLECTIONS = [
  { title: "The Camel Edit", text: "Warm wools, soft tailoring and the colour of late-autumn light.", image: siteImages.editorial, href: "/shop?category=women" },
  { title: "Modern Tailoring", text: "Suiting reimagined with relaxed shoulders and fluid lines.", image: products.find((p) => p.slug === "sand-linen-blazer")!.colors[0].image, href: "/shop?category=men" },
  { title: "Evening Hours", text: "Liquid gowns and velvet for when the lights go low.", image: products.find((p) => p.slug === "scarlet-flow-gown")!.colors[0].image, href: "/shop?category=women" },
  { title: "Finishing Touches", text: "Structured bags and shoes that complete the look.", image: products.find((p) => p.slug === "woven-top-handle-bag")!.colors[0].image, href: "/shop?category=accessories" },
];

/** Alternating editorial rows: images unmask and parallax as they scroll through. */
export default function Collections() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        const img = row.querySelector("[data-img]");
        const inner = row.querySelector("[data-inner]");
        gsap.fromTo(img, { clipPath: "inset(15% 15% 15% 15% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: { trigger: row, start: "top 90%", end: "top 30%", scrub: 0.6 } });
        gsap.fromTo(inner, { yPercent: -12, scale: 1.25 }, { yPercent: 12, scale: 1.1, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from(row.querySelectorAll("[data-txt]"), { y: 50, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 70%" } });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-[1300px] space-y-24 px-5 py-24 md:space-y-36 md:px-10">
      {COLLECTIONS.map((c, i) => (
        <div key={c.title} data-row className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
          <Link href={c.href} className={i % 2 ? "md:order-2" : ""}>
            <div data-img className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <div data-inner className="absolute inset-0">
                <Image src={c.image} alt={c.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
          </Link>
          <div>
            <p data-txt className="font-serif text-7xl text-gold/40 md:text-8xl">0{i + 1}</p>
            <h2 data-txt className="mt-2 font-display text-4xl md:text-6xl">
              {c.title}
            </h2>
            <p data-txt className="mt-5 max-w-sm leading-relaxed text-ink/70">
              {c.text}
            </p>
            <Link data-txt href={c.href} className="group mt-8 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
              Explore
              <span className="grid h-11 w-11 place-items-center rounded-full border border-brown-900/20 transition-colors group-hover:bg-brown-900 group-hover:text-cream">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
