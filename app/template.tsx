"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Re-mounts on every navigation: a brown curtain lifts to reveal the new page. */
export default function Template({ children }: { children: ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!(window as Window & { __auraLoaded?: boolean }).__auraLoaded) {
      gsap.set(curtain.current, { display: "none" });
      return;
    }
    gsap.fromTo(
      curtain.current,
      { yPercent: 0 },
      { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.05, onComplete: () => void gsap.set(curtain.current, { display: "none" }) },
    );
  });

  return (
    <>
      <div ref={curtain} className="pointer-events-none fixed inset-0 z-[70] bg-brown-900" aria-hidden />
      {children}
    </>
  );
}
