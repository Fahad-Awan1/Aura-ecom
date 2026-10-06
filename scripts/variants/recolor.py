"""Generate colour-variant product photos: garment mask + Lab recolour that keeps shading/texture.

Steps (run from this folder):
  1. node segment.mjs ../../public/images/products ./masks        (needs: npm i @huggingface/transformers)
  2. node ../cutout.mjs <folder of bag/shoe .jpgs> ./stillcut      (background masks for still-life shots)
  3. python recolor.py [slug ...]                                  (needs: numpy, pillow)
Then add the colour names/hex values to lib/products.ts in the same order as CFG below.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, "..", "..", "public", "images", "products")
OUT = os.path.join(PROD, "variants")
MASKS = os.path.join(HERE, "masks")
STILL = os.path.join(HERE, "stillcut")
os.makedirs(OUT, exist_ok=True)

SKIN = ["Face", "Left-arm", "Right-arm", "Left-leg", "Right-leg", "Hair"]

# slug -> (mask spec, protect white underlayers, [ (name, hex) ... ]) ; first colour is the original photo
CFG = {
    "camel-wool-coat": (["Upper-clothes"], False, [("Camel", "#b48a62"), ("Espresso", "#3b2a1e"), ("Ivory", "#e6dccb"), ("Burgundy", "#6b1e2b")]),
    "tailored-check-blazer": (["Upper-clothes"], True, [("Grey Check", "#8d8a86"), ("Camel", "#b48a62"), ("Navy", "#25304d"), ("Olive", "#5f5c3b")]),
    "silk-wrap-blouse": (["Upper-clothes"], False, [("Champagne", "#e3d6c3"), ("Blush", "#d6a39b"), ("Sage", "#9aa58a"), ("Noir", "#222020")]),
    "noir-turtleneck-set": (["Upper-clothes", "Skirt"], False, [("Noir", "#1d1712"), ("Camel", "#a9805a"), ("Burgundy", "#6b1e2b"), ("Forest", "#2f4a3a")]),
    "scarlet-flow-gown": (["Dress"], False, [("Scarlet", "#b3232b"), ("Emerald", "#1f6b4f"), ("Midnight", "#1f2847"), ("Champagne", "#d8c3a5")]),
    "velvet-off-shoulder-dress": (["Dress"], False, [("Plum", "#5c1a3b"), ("Emerald", "#1f5c45"), ("Noir", "#1a1716"), ("Rouge", "#9e1b32")]),
    "sand-linen-blazer": (["Upper-clothes"], True, [("Sand", "#c19a6b"), ("Olive", "#6b6a45"), ("Navy", "#25304d"), ("Stone", "#b9b2a6")]),
    "navy-tailored-suit": (["Upper-clothes", "Pants"], True, [("Navy", "#1f2a44"), ("Charcoal", "#3a3a3c"), ("Camel", "#a9805a"), ("Bottle Green", "#2c4a3e")]),
    "midnight-dinner-jacket": (["Upper-clothes"], True, [("Midnight", "#151515"), ("Ivory", "#e6dccb"), ("Burgundy", "#5e1a26"), ("Emerald", "#1f4f3f")]),
    "chambray-dot-shirt": (["Upper-clothes"], False, [("Chambray", "#5b7a99"), ("Sand", "#c9b29a"), ("Sage", "#8f9c80"), ("Rose", "#c48e8e")]),
    "terracotta-bomber": (["Upper-clothes"], False, [("Terracotta", "#b06a48"), ("Olive", "#5f5c3b"), ("Noir", "#1e1c1b"), ("Navy", "#25304d")]),
    "heritage-denim-jacket": (["Upper-clothes"], False, [("Indigo", "#2e3d5c"), ("Black Denim", "#252528"), ("Sand", "#bfa889"), ("Olive", "#59583c")]),
    "woven-top-handle-bag": ("still", False, [("Tangerine", "#d4793a"), ("Cognac", "#8a4b2a"), ("Noir", "#1e1c1b"), ("Cream", "#e6d9c2")]),
    "rouge-structured-bag": ("still", False, [("Rouge", "#c0392b"), ("Noir", "#1e1c1b"), ("Camel", "#b48a62"), ("Bottle Green", "#2c4a3e")]),
    "quilted-chain-bag": ("still", False, [("Noir", "#111111"), ("Blush", "#d6a39b"), ("Ivory", "#e6dccb"), ("Burgundy", "#6b1e2b")]),
    "teal-satchel": ("still", False, [("Teal", "#1f6f78"), ("Cognac", "#8a4b2a"), ("Noir", "#1e1c1b"), ("Blush", "#d6a39b")]),
    "noir-pointed-pumps": ("still", False, [("Noir", "#111111"), ("Nude", "#d8b99b"), ("Rouge", "#a3202c"), ("Navy", "#25304d")]),
    "floral-stiletto": ("still", False, [("Azure Floral", "#2a5aa8"), ("Blush Floral", "#d18fa0"), ("Emerald Floral", "#2b7a5c"), ("Noir Floral", "#2a2a2e")]),
    "suede-court-sneaker": ("still", False, [("Ivory", "#f0e9df"), ("Sand", "#c9b29a"), ("Sage", "#9aa58a"), ("Noir", "#222020")]),
    "emerald-brogue": ("still", False, [("Emerald", "#2f8f7a"), ("Cognac", "#8a4b2a"), ("Navy", "#25304d"), ("Burgundy", "#6b1e2b")]),
}

# --- colour space helpers (sRGB D65 <-> CIE Lab) ---
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
Minv = np.linalg.inv(M)
WHITE = np.array([0.95047, 1.0, 1.08883])

def rgb2lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ M.T / WHITE
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

def lab2rgb(lab):
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    f = np.stack([fx, fy, fz], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * WHITE
    c = xyz @ Minv.T
    c = np.where(c > 0.0031308, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055, 12.92 * c)
    return np.clip(c * 255, 0, 255)

def hex2lab(h):
    rgb = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)]], dtype=float)
    return rgb2lab(rgb)[0]

def load_label(slug, label, size):
    p = os.path.join(MASKS, f"{slug}__{label.replace('-', '_')}.png")
    if not os.path.exists(p):
        return np.zeros(size[::-1])
    return np.asarray(Image.open(p).convert("L").resize(size), dtype=float) / 255

def build_mask(slug, spec, protect_white, img, lab):
    size = img.size
    if spec == "still":
        cut = Image.open(os.path.join(STILL, slug + ".png")).convert("RGBA").resize(size)
        m = np.asarray(cut, dtype=float)[..., 3] / 255
        skin = sum(load_label(slug, s, size) for s in SKIN)
        skin = np.asarray(Image.fromarray((np.clip(skin, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)), dtype=float) / 255
        m = m * (1 - skin)
    else:
        m = np.clip(sum(load_label(slug, l, size) for l in spec), 0, 1)
    if protect_white:  # keep white shirts / tees under jackets untouched
        chroma = np.hypot(lab[..., 1], lab[..., 2])
        m = m * (1 - ((lab[..., 0] > 78) & (chroma < 12)))
    m8 = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.6))
    return np.asarray(m8, dtype=float) / 255

def recolor(lab, mask, target):
    w = mask > 0.5
    mL, ma, mb = (lab[..., i][w].mean() for i in range(3))
    sL = lab[..., 0][w].std() + 1e-3
    tL, ta, tb = target
    # very dark garments carry little shading -> stretch contrast when lifting them
    k = np.clip(14 / sL, 1, 2.2) if (mL < 30 and tL > mL + 15) else 1.0
    new = np.empty_like(lab)
    new[..., 0] = np.clip((lab[..., 0] - mL) * k + tL, 0, 100)
    new[..., 1] = ta + (lab[..., 1] - ma) * 0.35
    new[..., 2] = tb + (lab[..., 2] - mb) * 0.35
    a = mask[..., None]
    return lab * (1 - a) + new * a

manifest = {}
only = sys.argv[1:]
for slug, (spec, protect, colors) in CFG.items():
    if only and slug not in only:
        continue
    img = Image.open(os.path.join(PROD, slug + ".jpg")).convert("RGB")
    rgb = np.asarray(img, dtype=float)
    lab = rgb2lab(rgb)
    mask = build_mask(slug, spec, protect, img, lab)
    entries = [{"name": colors[0][0], "hex": colors[0][1], "image": f"/images/products/{slug}.jpg"}]
    for name, hx in colors[1:]:
        out = lab2rgb(recolor(lab, mask, hex2lab(hx))).astype(np.uint8)
        fn = f"{slug}--{name.lower().replace(' ', '-')}.jpg"
        Image.fromarray(out).save(os.path.join(OUT, fn), quality=82, optimize=True)
        entries.append({"name": name, "hex": hx, "image": f"/images/products/variants/{fn}"})
    manifest[slug] = entries
    print("ok", slug, f"mask={mask.mean():.2f}")

with open(os.path.join(HERE, "variants.json"), "w") as f:
    json.dump(manifest, f, indent=1)
