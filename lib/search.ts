import { products, type Product } from "@/lib/products";

// words shoppers use -> words that appear in our catalogue
const SYNONYMS: Record<string, string[]> = {
  women: ["women", "womens", "woman", "ladies", "female"],
  men: ["men", "mens", "man", "male", "gents"],
  accessories: ["accessories", "accessory", "bag", "bags", "handbag", "handbags", "purse", "satchel", "clutch"],
  footwear: ["footwear", "shoe", "shoes"],
  heels: ["heel", "heels", "pump", "pumps", "stiletto", "stilettos"],
  sneakers: ["sneaker", "sneakers", "trainer", "trainers"],
  coat: ["coat", "coats", "overcoat", "outerwear"],
  jacket: ["jacket", "jackets", "bomber"],
  blazer: ["blazer", "blazers"],
  dress: ["dress", "dresses", "gown", "gowns"],
  suit: ["suit", "suits", "tailoring"],
  shirt: ["shirt", "shirts", "blouse", "blouses", "top", "tops"],
  black: ["black", "noir", "midnight"],
  red: ["red", "rouge", "scarlet", "burgundy", "terracotta"],
  green: ["green", "emerald", "olive", "forest", "sage", "bottle"],
  blue: ["blue", "navy", "indigo", "chambray", "teal", "azure"],
  brown: ["brown", "camel", "cognac", "espresso", "sand", "tan"],
  white: ["white", "ivory", "cream", "champagne"],
  pink: ["pink", "blush", "rose", "plum"],
  grey: ["grey", "gray", "charcoal", "stone"],
};

// filler words (and vague adjectives) that shouldn't have to match a product
const STOP = new Set(
  ("a an the for me show some any i want need looking look find with in of and or do you have please something what is are your " +
    "how about like get buy shop can could would see browse there all my to on it its that this one ones " +
    "small mini big large nice good cute stylish elegant beautiful pretty classic piece pieces item items").split(" "),
);

/** Every word a product can be found by. */
function haystack(p: Product) {
  return [p.name, p.category, p.description, ...p.colors.map((c) => c.name), p.isNew ? "new arrivals latest" : ""]
    .join(" ")
    .toLowerCase();
}

function expand(term: string) {
  const out = new Set([term]);
  if (term.endsWith("s")) out.add(term.slice(0, -1));
  for (const group of Object.values(SYNONYMS)) if (group.includes(term)) group.forEach((w) => out.add(w));
  return [...out];
}

export type ParsedQuery = { terms: string[]; maxPrice?: number; minPrice?: number };

/** Pulls out price limits ("under 5000", "below ₹3k", "over 8000") and meaningful words. */
export function parseQuery(q: string): ParsedQuery {
  let text = q.toLowerCase().replace(/[₹,]/g, "").replace(/(\d+(?:\.\d+)?)\s*k\b/g, (_, n) => String(Number(n) * 1000));
  const res: ParsedQuery = { terms: [] };
  text = text.replace(/\b(under|below|less than|cheaper than|max|upto|up to)\s*(?:rs\.?|inr)?\s*(\d+)/g, (_, __, n) => {
    res.maxPrice = Number(n);
    return " ";
  });
  text = text.replace(/\b(over|above|more than|min)\s*(?:rs\.?|inr)?\s*(\d+)/g, (_, __, n) => {
    res.minPrice = Number(n);
    return " ";
  });
  res.terms = text
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));
  return res;
}

/** Every term (or one of its synonyms) must match; results are ranked by how strongly they match. */
export function searchProducts(q: string, source: Product[] = products): Product[] {
  const { terms, maxPrice, minPrice } = parseQuery(q);
  if (!terms.length && maxPrice == null && minPrice == null) return q.trim() ? [] : source;
  return source
    .filter((p) => (maxPrice == null || p.price <= maxPrice) && (minPrice == null || p.price >= minPrice))
    .map((p) => {
      const hay = haystack(p);
      const name = p.name.toLowerCase();
      let score = 0;
      for (const t of terms) {
        const words = expand(t);
        const hit = words.find((w) => new RegExp(`\\b${w}`).test(hay));
        if (!hit) return null;
        score += words.some((w) => name.includes(w)) ? 3 : p.category === hit ? 2 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** Which colour of a product a query asked for, if any ("red bag" -> the Rouge variant). */
export function matchColor(p: Product, q: string) {
  const terms = parseQuery(q).terms.flatMap(expand);
  return p.colors.find((c) => terms.some((t) => c.name.toLowerCase().split(" ").includes(t)));
}

export const POPULAR_SEARCHES = ["Coats", "Black dress", "Bags under 6000", "Men's blazer", "Heels", "New arrivals"];
