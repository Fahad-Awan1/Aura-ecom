import type { Metadata } from "next";
import PageIntro from "@/components/shop/PageIntro";
import ShopGrid from "@/components/shop/ShopGrid";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "New Arrivals — Aura" };

export default function NewArrivalsPage() {
  return (
    <>
      <PageIntro eyebrow="Just landed" title="New Arrivals" subtitle="Fresh silhouettes and seasonal textures, added every week." />
      <ShopGrid source={products.filter((p) => p.isNew)} basePath="/new-arrivals" />
    </>
  );
}
