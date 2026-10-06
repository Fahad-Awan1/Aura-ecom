import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/shop/ProductDetail";
import { getProduct, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product ? `${product.name} — Aura` : "Aura" };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/shop/[slug]">) {
  const product = getProduct((await params).slug);
  const color = (await searchParams).color;
  if (!product) notFound();
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  return <ProductDetail key={product.slug} product={product} related={related} initialColor={typeof color === "string" ? color : undefined} />;
}
