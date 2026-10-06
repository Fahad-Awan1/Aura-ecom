import { categories, formatPrice, products, type Product } from "@/lib/products";
import { matchColor, parseQuery, searchProducts } from "@/lib/search";

export type BotReply = {
  text: string;
  products?: { product: Product; color?: string }[];
  /** quick replies shown as chips under the message */
  suggestions?: string[];
  link?: { label: string; href: string };
};

type Intent = { keywords: (string | RegExp)[]; reply: () => BotReply };

const FREE_SHIPPING = 999;
const MAIN_MENU = ["Shipping & delivery", "Returns", "Size guide", "Show me new arrivals", "Payment options", "Talk to a human"];

const OCCASIONS: Record<string, string> = {
  "evening dresses": "dress",
  "office wear": "blazer",
};

const INTENTS: Intent[] = [
  {
    keywords: [/^(hi|hey|hello|hola|namaste|yo|good (morning|afternoon|evening))\b/],
    reply: () => ({
      text: "Hello and welcome to Aura ✦ I can help you find pieces, check sizes, or answer questions about delivery, returns and payments. What are you looking for today?",
      suggestions: ["Show me coats", "Black dresses", "Bags under 6000", "Shipping & delivery"],
    }),
  },
  {
    keywords: ["international", "abroad", "outside india", "overseas", "worldwide", "usa", "uk", "dubai"],
    reply: () => ({
      text: "Yes — we ship to 30+ countries including the UAE, UK, USA, Canada, Singapore and Australia. International delivery takes 7–12 business days, with shipping calculated at checkout. Duties may apply depending on your country.",
      suggestions: ["Payment options", "Returns"],
    }),
  },
  {
    keywords: ["ship", "deliver", "delivery", "dispatch", "how long", "arrive", "courier"],
    reply: () => ({
      text: `We offer **free shipping on orders above ${formatPrice(FREE_SHIPPING)}** (₹99 below that). Orders are dispatched within 48 hours and usually arrive in **3–6 business days** across India. Metro cities often get theirs in 2–3 days. Express delivery (1–2 days) is available at checkout for ₹249.`,
      suggestions: ["International shipping?", "Track my order", "Returns"],
    }),
  },
  {
    keywords: [/\btrack(ing)?\b/, "where is my order", "order status"],
    reply: () => ({
      text: "As soon as your order ships you'll receive an email and SMS with a tracking link. You can also share your order number (it starts with **AUR-**) with our team at safersolutionllc@gmail.com or +1 713 364-5155 and we'll check it for you right away.",
      suggestions: ["Cancel an order", "Talk to a human"],
    }),
  },
  {
    keywords: ["cancel"],
    reply: () => ({
      text: "Orders can be cancelled free of charge until they're dispatched — usually within 12 hours of purchase. Just email safersolutionllc@gmail.com with your order number. Once shipped, you can return the item instead.",
      suggestions: ["Returns", "Track my order"],
    }),
  },
  {
    keywords: ["return", "exchange", "refund", "send back", "wrong size"],
    reply: () => ({
      text: "Changed your mind? You can **return or exchange unworn pieces within 15 days** of delivery — we'll even arrange a free pickup. Refunds go back to your original payment method within 5–7 business days of the item reaching us. Sale items are exchange-only.",
      suggestions: ["Size guide", "Talk to a human"],
      link: { label: "Read the full policy", href: "/about#returns" },
    }),
  },
  {
    keywords: ["size", "sizing", /\bfit\b/, "measurement", "measure"],
    reply: () => ({
      text:
        "Our apparel runs true to size. A quick guide (bust / waist in inches):\n" +
        "• **XS** 32 / 25  • **S** 34 / 27  • **M** 36 / 29  • **L** 38 / 31  • **XL** 40 / 33\n" +
        "Shoes are in EU sizes 36–41 (EU 38 ≈ UK 5 ≈ US 7.5). Coats and blazers have a relaxed fit — size down if you prefer it closer to the body.",
      suggestions: ["Returns", "Show me blazers"],
    }),
  },
  {
    keywords: ["contact", "human", "agent", "person", /\bcall\b/, "phone", "email", "support", "customer care", "talk"],
    reply: () => ({
      text: "Our stylists are here Monday to Saturday, 10AM – 7PM IST:\n• Email: **safersolutionllc@gmail.com**\n• Phone: **+1 713 364-5155**\nWe reply to emails within a few hours.",
      suggestions: ["Store hours", "Returns"],
    }),
  },
  {
    keywords: ["gift", "wrap", "present", "gift card", "voucher"],
    reply: () => ({
      text: "Every order arrives in our signature sand-coloured box. Add complimentary gift wrapping and a handwritten note at checkout. Digital gift cards from ₹1,000 to ₹50,000 are available too.",
      suggestions: ["Shipping & delivery", "Show me bags"],
    }),
  },
  {
    keywords: ["pay", "payment", "upi", "card", "cod", "cash on delivery", "emi", "wallet", "netbanking"],
    reply: () => ({
      text: "We accept UPI, all major credit & debit cards, net banking, wallets and **Cash on Delivery** (orders up to ₹15,000). No-cost EMI is available on cards for orders above ₹5,000. All payments are 100% secure and encrypted.",
      suggestions: ["Discounts or offers?", "Shipping & delivery"],
    }),
  },
  {
    keywords: ["discount", "offer", "coupon", "promo", "code", "sale", "deal"],
    reply: () => {
      const sale = products.filter((p) => p.compareAt);
      return {
        text: `Join our newsletter (at the bottom of any page) for **10% off your first order**. These pieces are on sale right now:`,
        products: sale.map((product) => ({ product })),
        suggestions: ["Show me new arrivals", "Payment options"],
      };
    },
  },
  {
    keywords: [/\b(care|wash|clean|iron|material|fabric|quality)\b/, "made of"],
    reply: () => ({
      text: "We use natural fibres wherever possible — Italian wool, washed silk, linen, crepe and full-grain leather. Every piece ships with a care label; as a rule, dry clean wool, silk and velvet, hand-wash linen cold, and store leather bags stuffed and in their dust bag.",
      suggestions: ["About Aura", "Size guide"],
    }),
  },
  {
    keywords: ["hours", "open", "timing", "store", "boutique", "visit", "location", "address"],
    reply: () => ({
      text: "Our Mumbai atelier at 14 Linking Road, Bandra West is open Mon–Sat, 11AM – 8PM. Online support runs Mon–Sat, 10AM – 7PM.",
      suggestions: ["Talk to a human", "Show me new arrivals"],
    }),
  },
  {
    keywords: [/\b(thanks|thank you|thx|great|perfect|awesome|love it)\b/],
    reply: () => ({ text: "My pleasure! Anything else I can help you with?", suggestions: MAIN_MENU.slice(0, 4) }),
  },
  {
    keywords: [/\b(bye|goodbye|see you|that's all)\b/],
    reply: () => ({ text: "Thank you for visiting Aura — happy styling! ✦" }),
  },
];

const FALLBACK_INTENTS: Intent[] = [
  {
    keywords: [/\b(wedding|party|cocktail|gala|date night|date|office|work|meeting|interview|vacation|holiday|brunch|occasion|outfit|look|styling|style me)\b/],
    reply: () => ({
      text: "I'd love to help you put a look together! Here are a few pieces our stylists reach for — tell me the occasion and your budget for more ideas (e.g. “evening dress under 10000”).",
      products: ["scarlet-flow-gown", "velvet-off-shoulder-dress", "navy-tailored-suit", "camel-wool-coat", "rouge-structured-bag", "noir-pointed-pumps"].map((slug) => ({ product: products.find((p) => p.slug === slug)! })),
      suggestions: ["Evening dresses", "Office wear", "Bags", "Size guide"],
    }),
  },
  {
    keywords: ["colour", "color", "shades", "other colours", "available in"],
    reply: () => ({
      text: "Every piece comes in 4 colours — just tap the swatches under a product to see it change. Tell me a colour and a category (e.g. “red bags” or “green dresses”) and I'll find them for you.",
      suggestions: ["Red bags", "Black dresses", "Navy suits"],
    }),
  },
  {
    keywords: [/\babout (aura|you|us|the brand)\b/, "who are you", /\bbrand\b/, "your story"],
    reply: () => ({
      text: "Aura designs timeless pieces in a warm, neutral palette, made with small ateliers using natural fibres. Style is a way to say who you are without speaking ✦",
      link: { label: "Our story", href: "/about" },
      suggestions: ["Show me new arrivals", "Materials & care"],
    }),
  },
];

function productReply(q: string, found: Product[]): BotReply {
  const { maxPrice, minPrice } = parseQuery(q);
  const top = found.slice(0, 6);
  const budget = maxPrice ? ` under ${formatPrice(maxPrice)}` : minPrice ? ` above ${formatPrice(minPrice)}` : "";
  return {
    text:
      found.length === 1
        ? `I found exactly one piece${budget} for you:`
        : `Here ${found.length > 6 ? `are 6 of ${found.length}` : `are ${found.length}`} pieces${budget} I think you'll love:`,
    products: top.map((product) => ({ product, color: matchColor(product, q)?.name })),
    link: { label: "See all results", href: `/shop?q=${encodeURIComponent(q)}` },
    suggestions: ["Size guide", "Shipping & delivery", "Something cheaper"],
  };
}

const matches = (text: string, k: string | RegExp) => (typeof k === "string" ? text.includes(k) : k.test(text));

/** Context the bot keeps between turns (for "something cheaper" etc.). */
export type ChatMemory = { lastQuery?: string };

export function answer(input: string, memory: ChatMemory): BotReply {
  const text = input.toLowerCase().trim();

  if (/cheaper|less expensive|lower price|budget/.test(text) && memory.lastQuery) {
    const prev = searchProducts(memory.lastQuery);
    const max = prev.length ? Math.min(...prev.map((p) => p.price)) : 5000;
    const found = searchProducts(memory.lastQuery.replace(/\b(under|below)\s*\d+/g, "")).filter((p) => p.price < max);
    const any = found.length ? found : products.filter((p) => p.price < 4000);
    return { ...productReply(memory.lastQuery, any), text: found.length ? "Here are some more affordable options:" : "Our most affordable pieces right now:" };
  }

  if (/\b(new arrivals?|latest|what's new|whats new|just in)\b/.test(text)) {
    memory.lastQuery = "new arrivals";
    return { ...productReply("new", products.filter((p) => p.isNew)), text: "Fresh in this week:" , link: { label: "All new arrivals", href: "/new-arrivals" } };
  }

  if (/\b(cheapest|lowest price|most affordable)\b/.test(text)) {
    const sorted = [...products].sort((a, b) => a.price - b.price).slice(0, 4);
    return { text: "Our most affordable pieces:", products: sorted.map((product) => ({ product })), suggestions: ["Discounts or offers?"] };
  }

  if (/\b(most expensive|premium|luxury|best)\b/.test(text) && !/quality/.test(text)) {
    const sorted = [...products].sort((a, b) => b.price - a.price).slice(0, 4);
    return { text: "Our signature investment pieces:", products: sorted.map((product) => ({ product })) };
  }

  // service questions first ("do you ship shoes abroad?" is about shipping, not shoes)
  for (const intent of INTENTS) {
    if (intent.keywords.some((k) => matches(text, k))) return intent.reply();
  }

  const found = searchProducts(OCCASIONS[text] ?? text);
  if (found.length) {
    memory.lastQuery = text;
    return productReply(text, found);
  }

  for (const intent of FALLBACK_INTENTS) {
    if (intent.keywords.some((k) => matches(text, k))) return intent.reply();
  }

  const cat = categories.find((c) => text.includes(c.slug));
  if (cat) {
    memory.lastQuery = cat.slug;
    return productReply(cat.slug, products.filter((p) => p.category === cat.slug));
  }

  return {
    text: "I'm not sure I caught that. I can help you find products (try “camel coat” or “heels under 5000”) or answer questions about:",
    suggestions: MAIN_MENU,
  };
}

export const WELCOME: BotReply = {
  text: "Hi, I'm Aria, your Aura style assistant ✦ Ask me about products, sizes, delivery or returns.",
  suggestions: ["Show me new arrivals", "Bags under 6000", "Shipping & delivery", "Size guide", "Returns"],
};
