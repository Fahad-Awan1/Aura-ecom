"use client";

import { gsap } from "@/lib/gsap";

/** Clones an image and arcs it into the header bag icon, then bumps the icon. */
export function flyToCart(img: HTMLImageElement | null) {
  const target = document.getElementById("cart-button");
  if (!img || !target) return;
  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const ghost = img.cloneNode() as HTMLImageElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: "cover",
    borderRadius: "16px",
    zIndex: "80",
    pointerEvents: "none",
    opacity: "1",
  });
  ghost.removeAttribute("srcset");
  ghost.src = img.currentSrc || img.src;
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { x: dx, duration: 0.9, ease: "power2.in" }, 0)
    .to(ghost, { y: dy, duration: 0.9, ease: "back.in(1.4)" }, 0)
    .to(ghost, { scale: 0.06, borderRadius: "50%", duration: 0.9, ease: "power3.in" }, 0)
    .to(target, { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 0.85);
}
