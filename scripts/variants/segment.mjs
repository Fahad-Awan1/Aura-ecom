import { pipeline, RawImage } from '@huggingface/transformers';
import fs from 'node:fs'; import path from 'node:path';
const [src, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const seg = await pipeline('image-segmentation', 'Xenova/segformer_b2_clothes');
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.jpg'))) {
  const img = await RawImage.read(path.join(src, f));
  const res = await seg(img);
  const labels = [];
  for (const r of res) {
    const name = `${f.replace('.jpg','')}__${r.label.replace(/[^a-z0-9]+/gi,'_')}.png`;
    await r.mask.save(path.join(out, name));
    let n = 0; for (const v of r.mask.data) if (v > 127) n++;
    labels.push(`${r.label}:${(100*n/r.mask.data.length).toFixed(1)}%`);
  }
  console.log(f, labels.join(' '));
}
