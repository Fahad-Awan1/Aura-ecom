// Removes the background from every .jpg in a folder and writes transparent PNGs.
// Used once to produce public/images/hero-model.png and the category cutouts.
//
//   npm i -D @imgly/background-removal-node
//   node scripts/cutout.mjs <input-dir> <output-dir>
import { removeBackground } from "@imgly/background-removal-node";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("usage: node scripts/cutout.mjs <input-dir> <output-dir>");
  process.exit(1);
}
for (const f of fs.readdirSync(src).filter((f) => /\.jpe?g$/i.test(f))) {
  const blob = await removeBackground(pathToFileURL(path.join(src, f)).href, { model: "medium", output: { format: "image/png" } });
  fs.writeFileSync(path.join(out, f.replace(/\.jpe?g$/i, ".png")), Buffer.from(await blob.arrayBuffer()));
  console.log("done", f);
}
