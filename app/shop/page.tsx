import type { Metadata } from "next";
import PageIntro from "@/components/shop/PageIntro";
import ShopGrid from "@/components/shop/ShopGrid";
import { categories, type Category } from "@/lib/products";

export const metadata: Metadata = { title: "Shop — Aura" };

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const cat = typeof sp.category === "string" && categories.some((c) => c.slug === sp.category) ? (sp.category as Category) : "all";
  const wishlist = sp.wishlist === "1";
  const q = typeof sp.q === "string" ? sp.q : "";
  return (
    <>
      <PageIntro eyebrow="The Collection" title="Shop" subtitle="Considered pieces in a warm, neutral palette — designed to be worn for years." />
      {/* key resets filter state when navigating here from a link or the search overlay */}
      <ShopGrid key={`${cat}-${wishlist}-${q}`} initialCategory={cat} initialWishlist={wishlist} initialQuery={q} />
    </>
  );
}
