"use client";

import { useId, useRef } from "react";
import clsx from "clsx";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Circular "scroll to discover" text that idles slowly and spins with scroll. */
export default function RotatingBadge({ text = "Scroll to discover • Aura • ", className }: { text?: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = `badge-${useId().replace(/:/g, "")}`;

  useGSAP(
    () => {
      gsap.to("[data-spin]", { rotation: 360, duration: 22, ease: "none", repeat: -1 });
      gsap.to("[data-spin-scroll]", {
        rotation: 540,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.5 },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={clsx("relative grid overflow-hidden h-32 w-32 place-items-center rounded-full bg-ivory text-brown-900 shadow-xl md:h-36 md:w-36", className)}>
      <div data-spin-scroll className="absolute inset-0">
        <svg data-spin viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-current text-[8.6px] uppercase tracking-[0.32em]" style={{ fontFamily: "var(--font-jost)" }}>
            <textPath href={`#${id}`}>{text}</textPath>
          </text>
        </svg>
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brown-900 text-cream">
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </span>
    </div>
  );
}
