// One-time asset build: the source logo (src/assets/logo.png) is a 2048x2048 ~3.3MB PNG, but the
// app only ever displays it at 16-64px. This generates two small, purpose-sized assets so Logo.tsx
// doesn't ship the full-res original at runtime. Run manually via `npm run optimize-logo` — not
// part of `dev`/`build`, since the source rarely changes.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'src', 'assets');
const source = join(assetsDir, 'logo.png');

// Crop box (in source-image pixels) around just the mother-and-baby silhouette on the right side
// of the wordmark, hand-picked by inspecting the source art — used for the compact `icon` variant.
const ICON_CROP = { left: 1130, top: 520, width: 820, height: 820 };

async function main() {
  await sharp(source).resize(256, 256).png({ quality: 90 }).toFile(join(assetsDir, 'logo-256.png'));

  await sharp(source)
    .extract(ICON_CROP)
    .resize(256, 256)
    .png({ quality: 90 })
    .toFile(join(assetsDir, 'logo-icon-256.png'));

  console.log('Wrote src/assets/logo-256.png and src/assets/logo-icon-256.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
