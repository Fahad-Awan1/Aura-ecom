// All imagery lives in /public/images. Swap files there to rebrand — paths are referenced only from this file.

export type Category = "women" | "men" | "accessories" | "footwear";

export type Color = { name: string; hex: string; image: string };

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  /** first entry is the original photo; the rest are recoloured variants in /images/products/variants */
  colors: Color[];
  sizes: string[];
  description: string;
  isNew?: boolean;
};

export const categories: { slug: Category; label: string; image: string }[] = [
  { slug: "women", label: "Women", image: "/images/cat-women.webp" },
  { slug: "men", label: "Men", image: "/images/cat-men.webp" },
  { slug: "accessories", label: "Accessories", image: "/images/cat-accessories.webp" },
  { slug: "footwear", label: "Footwear", image: "/images/cat-footwear.webp" },
];

export const siteImages = {
  heroModel: "/images/hero-model.webp",
  rack: "/images/rack.jpg",
  editorial: "/images/editorial-1.jpg",
  store: "/images/store.jpg",
};

const c = (slug: string, list: [name: string, hex: string][]): Color[] =>
  list.map(([name, hex], i) => ({
    name,
    hex,
    image: i === 0 ? `/images/products/${slug}.jpg` : `/images/products/variants/${slug}--${name.toLowerCase().replace(/ /g, "-")}.jpg`,
  }));
const APPAREL = ["XS", "S", "M", "L", "XL"];
const SHOES = ["36", "37", "38", "39", "40", "41"];
const ONE = ["One Size"];

export const products: Product[] = [
  { slug: "camel-wool-coat", name: "Camel Wool Coat", category: "women", price: 8990, compareAt: 10990, colors: c("camel-wool-coat", [["Camel", "#b48a62"], ["Espresso", "#3b2a1e"], ["Ivory", "#e6dccb"], ["Burgundy", "#6b1e2b"]]), sizes: APPAREL, description: "A long-line coat in brushed Italian wool with softly dropped shoulders and a relaxed, wrap-ready silhouette.", isNew: true },
  { slug: "tailored-check-blazer", name: "Tailored Check Blazer", category: "women", price: 6490, colors: c("tailored-check-blazer", [["Grey Check", "#8d8a86"], ["Camel", "#b48a62"], ["Navy", "#25304d"], ["Olive", "#5f5c3b"]]), sizes: APPAREL, description: "Double-breasted blazer cut from a fine Prince of Wales check with sharp lapels and a nipped waist.", isNew: true },
  { slug: "silk-wrap-blouse", name: "Silk Wrap Blouse", category: "women", price: 3990, colors: c("silk-wrap-blouse", [["Champagne", "#e3d6c3"], ["Blush", "#d6a39b"], ["Sage", "#9aa58a"], ["Noir", "#222020"]]), sizes: APPAREL, description: "Fluid washed-silk blouse with a draped wrap front and blouson sleeves." },
  { slug: "noir-turtleneck-set", name: "Noir Turtleneck Set", category: "women", price: 5290, colors: c("noir-turtleneck-set", [["Noir", "#1d1712"], ["Camel", "#a9805a"], ["Burgundy", "#6b1e2b"], ["Forest", "#2f4a3a"]]), sizes: APPAREL, description: "Fine-rib turtleneck paired with a check wrap skirt — effortless evening minimalism." },
  { slug: "scarlet-flow-gown", name: "Scarlet Flow Gown", category: "women", price: 12490, colors: c("scarlet-flow-gown", [["Scarlet", "#b3232b"], ["Emerald", "#1f6b4f"], ["Midnight", "#1f2847"], ["Champagne", "#d8c3a5"]]), sizes: APPAREL, description: "A floor-sweeping gown in liquid crepe that moves with every step." },
  { slug: "velvet-off-shoulder-dress", name: "Velvet Off-Shoulder Dress", category: "women", price: 7490, colors: c("velvet-off-shoulder-dress", [["Plum", "#5c1a3b"], ["Emerald", "#1f5c45"], ["Noir", "#1a1716"], ["Rouge", "#9e1b32"]]), sizes: APPAREL, description: "Plush velvet sculpted into an off-the-shoulder neckline and body-skimming midi length.", isNew: true },
  { slug: "sand-linen-blazer", name: "Sand Linen Blazer", category: "men", price: 6990, colors: c("sand-linen-blazer", [["Sand", "#c19a6b"], ["Olive", "#6b6a45"], ["Navy", "#25304d"], ["Stone", "#b9b2a6"]]), sizes: APPAREL, description: "Unstructured linen blazer with patch pockets — made for warm-weather tailoring.", isNew: true },
  { slug: "navy-tailored-suit", name: "Navy Tailored Suit", category: "men", price: 15990, compareAt: 18990, colors: c("navy-tailored-suit", [["Navy", "#1f2a44"], ["Charcoal", "#3a3a3c"], ["Camel", "#a9805a"], ["Bottle Green", "#2c4a3e"]]), sizes: APPAREL, description: "Two-piece suit in Super 120s wool with a slim, modern cut." },
  { slug: "midnight-dinner-jacket", name: "Midnight Dinner Jacket", category: "men", price: 11490, colors: c("midnight-dinner-jacket", [["Midnight", "#151515"], ["Ivory", "#e6dccb"], ["Burgundy", "#5e1a26"], ["Emerald", "#1f4f3f"]]), sizes: APPAREL, description: "Satin-faced peak lapels on a midnight wool dinner jacket for after-dark occasions." },
  { slug: "chambray-dot-shirt", name: "Chambray Dot Shirt", category: "men", price: 2490, colors: c("chambray-dot-shirt", [["Chambray", "#5b7a99"], ["Sand", "#c9b29a"], ["Sage", "#8f9c80"], ["Rose", "#c48e8e"]]), sizes: APPAREL, description: "Soft chambray shirt with a micro-dot print and mother-of-pearl buttons." },
  { slug: "terracotta-bomber", name: "Terracotta Bomber", category: "men", price: 4990, colors: c("terracotta-bomber", [["Terracotta", "#b06a48"], ["Olive", "#5f5c3b"], ["Noir", "#1e1c1b"], ["Navy", "#25304d"]]), sizes: APPAREL, description: "Lightweight satin bomber with ribbed trims in a sun-baked terracotta." },
  { slug: "heritage-denim-jacket", name: "Heritage Denim Jacket", category: "men", price: 4590, colors: c("heritage-denim-jacket", [["Indigo", "#2e3d5c"], ["Black Denim", "#252528"], ["Sand", "#bfa889"], ["Olive", "#59583c"]]), sizes: APPAREL, description: "Selvedge denim trucker jacket with a corduroy collar." },
  { slug: "woven-top-handle-bag", name: "Woven Top-Handle Bag", category: "accessories", price: 5990, colors: c("woven-top-handle-bag", [["Tangerine", "#d4793a"], ["Cognac", "#8a4b2a"], ["Noir", "#1e1c1b"], ["Cream", "#e6d9c2"]]), sizes: ONE, description: "Hand-woven rattan body with a polished leather flap and top handle.", isNew: true },
  { slug: "rouge-structured-bag", name: "Rouge Structured Bag", category: "accessories", price: 7490, colors: c("rouge-structured-bag", [["Rouge", "#c0392b"], ["Noir", "#1e1c1b"], ["Camel", "#b48a62"], ["Bottle Green", "#2c4a3e"]]), sizes: ONE, description: "Architectural top-handle bag in glossy calf leather with a signature clasp." },
  { slug: "quilted-chain-bag", name: "Quilted Chain Bag", category: "accessories", price: 8990, colors: c("quilted-chain-bag", [["Noir", "#111111"], ["Blush", "#d6a39b"], ["Ivory", "#e6dccb"], ["Burgundy", "#6b1e2b"]]), sizes: ONE, description: "Chevron-quilted leather camera bag on a gold-tone chain strap." },
  { slug: "teal-satchel", name: "Teal Satchel", category: "accessories", price: 4790, colors: c("teal-satchel", [["Teal", "#1f6f78"], ["Cognac", "#8a4b2a"], ["Noir", "#1e1c1b"], ["Blush", "#d6a39b"]]), sizes: ONE, description: "Pebbled leather satchel with a push-lock fastening." },
  { slug: "noir-pointed-pumps", name: "Noir Pointed Pumps", category: "footwear", price: 4290, colors: c("noir-pointed-pumps", [["Noir", "#111111"], ["Nude", "#d8b99b"], ["Rouge", "#a3202c"], ["Navy", "#25304d"]]), sizes: SHOES, description: "Classic 100mm pointed pumps in smooth patent leather.", isNew: true },
  { slug: "floral-stiletto", name: "Floral Stiletto", category: "footwear", price: 3990, colors: c("floral-stiletto", [["Azure Floral", "#2a5aa8"], ["Blush Floral", "#d18fa0"], ["Emerald Floral", "#2b7a5c"], ["Noir Floral", "#2a2a2e"]]), sizes: SHOES, description: "Printed satin stilettos that bring a garden to every step." },
  { slug: "suede-court-sneaker", name: "Suede Court Sneaker", category: "footwear", price: 3490, colors: c("suede-court-sneaker", [["Ivory", "#f0e9df"], ["Sand", "#c9b29a"], ["Sage", "#9aa58a"], ["Noir", "#222020"]]), sizes: SHOES, description: "Low-profile leather sneaker with suede overlays and a cushioned sole." },
  { slug: "emerald-brogue", name: "Emerald Brogue", category: "footwear", price: 5490, colors: c("emerald-brogue", [["Emerald", "#2f8f7a"], ["Cognac", "#8a4b2a"], ["Navy", "#25304d"], ["Burgundy", "#6b1e2b"]]), sizes: SHOES, description: "Hand-burnished suede brogue with a stacked leather heel." },
];

export const getProduct = (slug: string) => products.find((x) => x.slug === slug);

/** Looks a colour up by name (falls back to the original photo). */
export const getColor = (product: Product, name?: string) => product.colors.find((c) => c.name === name) ?? product.colors[0];

export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
