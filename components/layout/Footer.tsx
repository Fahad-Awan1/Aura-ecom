"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { StarMark } from "@/components/ui/Logo";
import { gsap, useGSAP } from "@/lib/gsap";

const COLUMNS = [
  {
    title: "Navigation",
    links: [
      ["Men's Collection", "/shop?category=men"],
      ["Women's Collection", "/shop?category=women"],
      ["New Arrivals", "/new-arrivals"],
      ["Best Sellers", "/collections"],
    ],
  },
  {
    title: "Information",
    links: [
      ["Shipping Policy", "/about#shipping"],
      ["Returns & Exchanges", "/about#returns"],
      ["Privacy Policy", "/about#privacy"],
      ["Terms of Service", "/about#terms"],
    ],
  },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-f]", {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 85%" },
      });
      gsap.from("[data-wordmark] span", {
        yPercent: 100,
        duration: 1.4,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-wordmark]", start: "top 95%" },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="bg-white px-3 pb-3 md:px-6 md:pb-6">
      <div className="overflow-hidden rounded-[28px] bg-brown-900 text-cream">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-7 pb-10 pt-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:px-14">
          <div data-f>
            <div className="flex items-center gap-2.5">
              <StarMark className="h-5 w-5" />
              <span className="font-display text-2xl">Aura</span>
            </div>
            <p className="mt-6 max-w-xs text-[0.8rem] leading-relaxed text-cream/60">
              Redefining elegance for the modern generation. Quality craftsmanship and timeless design are at the heart of everything we do.
            </p>
            <form className="mt-8 flex max-w-xs items-center border-b border-cream/25 pb-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Join our newsletter"
                className="flex-1 bg-transparent text-sm text-cream placeholder:text-cream/40 focus:outline-none"
              />
              <button aria-label="Subscribe" className="text-gold transition-transform hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </form>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title} data-f>
              <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]">{c.title}</h4>
              <ul className="mt-6 space-y-3.5">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="group inline-flex items-center gap-1 text-[0.8rem] text-cream/60 transition-colors hover:text-cream">
                      <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div data-f>
            <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]">Customer Service</h4>
            <ul className="mt-6 space-y-3.5 text-[0.8rem] text-cream/60">
              <li>
                Email: <a href="mailto:safersolutionllc@gmail.com" className="hover:text-cream">safersolutionllc@gmail.com</a>
              </li>
              <li>
                Phone: <a href="tel:+17133645155" className="hover:text-cream">+1 713 364-5155</a>
              </li>
              <li>Hours: Mon-Sat | 10AM - 7PM</li>
            </ul>
          </div>
        </div>

        <div data-wordmark className="pointer-events-none flex select-none justify-center overflow-hidden px-4 font-serif leading-[0.8] text-cream/[0.05] text-[22vw]" aria-hidden>
          {"AURA".split("").map((l, i) => (
            <span key={i} className="inline-block">
              {l}
            </span>
          ))}
        </div>

        <div className="border-t border-cream/10">
          <p className="mx-auto max-w-[1440px] px-7 py-6 text-center text-[0.62rem] uppercase tracking-[0.25em] text-cream/45 md:px-14">
            © {new Date().getFullYear()} Aura. All rights reserved. Designed for excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
