import type { Metadata } from "next";
import PageIntro from "@/components/shop/PageIntro";
import Collections from "@/components/shop/Collections";

export const metadata: Metadata = { title: "Collections — Aura" };

export default function CollectionsPage() {
  return (
    <>
      <PageIntro eyebrow="Curated stories" title="Collections" subtitle="Edits built around a mood, a moment and an occasion." />
      <Collections />
    </>
  );
}
