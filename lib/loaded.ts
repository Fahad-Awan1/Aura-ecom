declare global {
  interface Window {
    __auraLoaded?: boolean;
  }
}

/** Runs `cb` once the preloader has finished (immediately if it already has). Returns an unsubscribe. */
export function onSiteLoaded(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (window.__auraLoaded) {
    cb();
    return () => {};
  }
  window.addEventListener("aura:loaded", cb, { once: true });
  return () => window.removeEventListener("aura:loaded", cb);
}

export function markSiteLoaded() {
  window.__auraLoaded = true;
  // dispatch outside the caller's GSAP context, otherwise listeners' selectors get scoped to the preloader
  window.setTimeout(() => window.dispatchEvent(new Event("aura:loaded")), 0);
}
