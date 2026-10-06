"use client";

import Image from "next/image";
import { Check, X } from "lucide-react";
import { useShop } from "@/lib/store";

/** "Added to bag" confirmations, bottom-centre. */
export default function Toaster() {
  const toasts = useShop((s) => s.toasts);
  const dismiss = useShop((s) => s.dismissToast);
  const setCartOpen = useShop((s) => s.setCartOpen);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[66] sm:bottom-6 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_.5s_cubic-bezier(.2,.9,.3,1.2)] items-center gap-3 rounded-2xl bg-brown-900 p-2.5 pr-3 text-cream shadow-2xl"
        >
          {t.image ? (
            <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image src={t.image} alt="" fill sizes="40px" className="object-cover" />
            </span>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/20">
              <Check className="h-4 w-4 text-gold" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Added to bag</p>
            <p className="truncate text-sm">{t.title}</p>
          </div>
          <button
            onClick={() => {
              dismiss(t.id);
              setCartOpen(true);
            }}
            className="rounded-full border border-cream/25 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.18em] hover:bg-cream hover:text-brown-900"
          >
            View
          </button>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-cream/60 hover:text-cream">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
