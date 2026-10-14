import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import sharp from "sharp";
import OutfitStack, { type OutfitItem } from "@/components/outfit-stack";

const catalog: Record<string, { name: string; price: number; order: number }> =
  {
    "05755301707-f1.png": {
      name: "Knitted sweater",
      price: 79.99,
      order: 1,
    },
    "06861740800-f1.png": {
      name: "Black wide-leg trousers",
      price: 49.99,
      order: 2,
    },
    "12016821800-f1.png": {
      name: "Black chukka boots",
      price: 69.99,
      order: 3,
    },
    "02521021700-f1.png": {
      name: "Black leather jacket",
      price: 199.99,
      order: 1,
    },
    "01195331981-f1.png": {
      name: "Light blue shirt",
      price: 49.95,
      order: 2,
    },
    "00706740710-f1.png": {
      name: "Beige pleated trousers",
      price: 35.95,
      order: 3,
    },
  };

const publicDir = path.join(process.cwd(), "public", "catalog");

async function topMarginFraction(file: string) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 8) return y / height;
    }
  }
  return 0;
}

async function ensureTransparentPng(imagePath: string) {
  const pngPath = imagePath.replace(/\.jpe?g$/i, ".png");
  if (fs.existsSync(pngPath)) return;

  const { data, info } = await sharp(imagePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = width * height;
  const out = Buffer.alloc(pixels * 4);
  for (let i = 0; i < pixels; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const min = Math.min(r, g, b);
    const alpha =
      min >= 250 ? 0 : min <= 242 ? 255 : Math.round((255 * (250 - min)) / 8);
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = alpha;
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(pngPath);
}

async function getOutfits() {
  const entries = fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const outfits = await Promise.all(
    entries.map(async (entry) => {
      const folder = entry.name;
      const dir = path.join(publicDir, folder);
      for (const file of fs.readdirSync(dir)) {
        if (/\.jpe?g$/i.test(file)) {
          await ensureTransparentPng(path.join(dir, file));
        }
      }
      const files = fs
        .readdirSync(dir)
        .filter((file) => /\.png$/i.test(file))
        .sort((a, b) => {
          const orderA = catalog[a]?.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = catalog[b]?.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB || a.localeCompare(b);
        });
      const items: OutfitItem[] = files.map((file) => ({
        src: `/catalog/${folder}/${file}`,
        alt: catalog[file]?.name ?? file,
        price: catalog[file]?.price ?? 0,
      }));
      const total = items.reduce((sum, item) => sum + item.price, 0);
      const topOffset = files.length
        ? await topMarginFraction(path.join(dir, files[0]))
        : 0;
      return { folder, items, total, topOffset };
    }),
  );

  return outfits.filter((outfit) => outfit.items.length > 0);
}

const outfits = await getOutfits();

export default function Home() {
  return (
    <main className="grid flex-1 grid-cols-10 grid-rows-10 overflow-x-clip px-8 pb-8 pt-16">
      <header className="col-start-1 row-start-1 self-start flex items-center gap-2">
        <h1 className="text-[16px] font-semibold tracking-tight">masallah</h1>
        <Image
          src="/nazar-boncugu.svg"
          alt="Nazar boncuğu"
          width={20}
          height={20}
          priority
        />
      </header>
      <section className="col-start-2 col-end-11 row-start-1 row-end-11 grid content-start grid-cols-3 justify-items-center gap-y-12">
        {outfits.map((outfit, i) => (
          <div key={outfit.folder} className="relative hover:z-10">
            <div style={{ marginTop: `-${(outfit.topOffset * 150).toFixed(2)}%` }}>
              <OutfitStack items={outfit.items} eager={i < 3} />
              <div className="mt-6">
                <p>{outfit.folder}</p>
                <p>€{outfit.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
