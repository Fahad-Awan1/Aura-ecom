import type { Metadata } from "next";
import Image from "next/image";
import PageIntro from "@/components/shop/PageIntro";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import Marquee from "@/components/home/Marquee";
import { siteImages } from "@/lib/products";

export const metadata: Metadata = { title: "About — Aura" };

const POLICIES = [
  { id: "shipping", title: "Shipping Policy", text: "Complimentary shipping on orders above ₹999. Orders dispatch within 48 hours and arrive in 3–6 business days." },
  { id: "returns", title: "Returns & Exchanges", text: "Changed your mind? Return or exchange unworn pieces within 15 days of delivery — pickup is on us." },
  { id: "privacy", title: "Privacy Policy", text: "We only collect what we need to fulfil your order and never sell your data." },
  { id: "terms", title: "Terms of Service", text: "By shopping with Aura you agree to our standard terms of sale and fair-use policy." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Our story" title="About Aura" subtitle="Style is a way to say who you are without speaking." />
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image src={siteImages.store} alt="Inside the Aura atelier" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-display text-4xl md:text-5xl">Redefining elegance for the modern generation.</h2>
          <p className="mt-6 leading-relaxed text-ink/70">
            Aura began with a simple belief: that the pieces you love most should be the ones you wear for years. We work with small ateliers to
            craft garments in natural fibres and a warm, timeless palette — quality craftsmanship and considered design are at the heart of
            everything we do.
          </p>
        </div>
      </section>
      <WelcomeBanner />
      <Marquee />
      <section className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-24 md:grid-cols-2 md:px-10">
        {POLICIES.map((p) => (
          <div key={p.id} id={p.id} className="scroll-mt-28 border-t border-brown-900/10 pt-6">
            <h3 className="font-display text-2xl">{p.title}</h3>
            <p className="mt-3 leading-relaxed text-ink/70">{p.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
