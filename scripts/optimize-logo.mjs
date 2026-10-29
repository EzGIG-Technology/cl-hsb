// One-time asset build: turns the Honey Spa source logo (src/assets/logo-source.jpg — a 450px JPG on a
// white background, as published on @honeyspabangi) into a transparent, tightly-cropped wordmark PNG so
// it sits cleanly on the blush/cream surfaces as well as white cards. The compact flower-and-bee mark is
// a hand-built SVG (components/Logo.tsx), so only the wordmark needs a raster asset. Run manually with
// `node scripts/optimize-logo.mjs` — not part of `dev`/`build`, since the source rarely changes.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'src', 'assets');
const source = join(assetsDir, 'logo-source.jpg');

// Crop box (source pixels) around "honey ✿ spa" + the RELAX | REJUVENATE | REJOICE strapline,
// hand-picked by inspecting the source art.
const WORDMARK_CROP = { left: 4, top: 168, width: 444, height: 122 };

async function main() {
  const { data, info } = await sharp(source).extract(WORDMARK_CROP).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // "Un-multiply" the white background: each pixel's alpha is how far its darkest-from-white channel is
  // from white, and its colour is recovered so it composites back to the same pixel over white.
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    const alpha = a < 0.06 ? 0 : a;
    const un = (c) => (alpha === 0 ? 0 : Math.round(Math.max(0, Math.min(255, (c - 255 * (1 - alpha)) / alpha))));
    out[o] = un(r);
    out[o + 1] = un(g);
    out[o + 2] = un(b);
    out[o + 3] = Math.round(alpha * 255);
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(join(assetsDir, 'logo-wordmark.png'));

  console.log('Wrote src/assets/logo-wordmark.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
