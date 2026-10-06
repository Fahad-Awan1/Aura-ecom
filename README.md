# Aura — animated fashion storefront

Next.js 16 (App Router) · Tailwind CSS v4 · GSAP (ScrollTrigger, SplitText) · Lenis · Three.js / React Three Fiber · Zustand

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Where things live

| Path | What |
| --- | --- |
| `app/page.tsx` | Homepage: Hero → Shop by Category → More Than Fashion → Marquee → New Arrivals |
| `app/shop`, `app/shop/[slug]` | Product listing (filters, sort, wishlist) and product detail |
| `components/home/*` | Homepage sections |
| `components/layout/*` | Header, footer, cart drawer, preloader, smooth scroll, custom cursor |
| `components/three/*` | WebGL: `SilkScene` (satin shader in the banner), `DistortImage` (hover ripple on images) |
| `lib/products.ts` | Catalogue + every image path — edit here to change products or photos |
| `lib/store.ts` | Cart & wishlist (persisted to localStorage) |
| `public/images` | Photos (Unsplash placeholders) and transparent cutouts |
| `scripts/cutout.mjs` | Regenerates transparent PNG cutouts from photos |
| `scripts/variants/` | Generates the recoloured product photos used by the colour swatches |
| `lib/search.ts` | Search used by the header overlay, shop filter and chatbot |
| `lib/chatbot.ts` | Aria's hardcoded answers (edit text/keywords here) |

## Swapping images

Replace files in `public/images` (keep names) or point `lib/products.ts` at new ones.
The hero model and category cards need **transparent PNGs** so the "STYLE" lettering can wrap around them — use `scripts/cutout.mjs`.

All animations respect `prefers-reduced-motion`.
