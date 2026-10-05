import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const originals = join(process.cwd(), "public", "books", "originals");
const output = join(process.cwd(), "public", "books");
await mkdir(output, { recursive: true });

for (const subject of ["english", "maths"]) {
  for (const number of ["02", "04", "05"]) {
    const name = `${subject}-book-${number}`;
    const source = join(originals, `${name}-original.jpeg`);
    const { width, height } = await sharp(source).metadata();
    if (!width || !height) throw new Error(`Unable to read ${source}`);
    // The publisher's supplied spread has its front cover on the right.
    const left = Math.ceil(width / 2);
    await sharp(source)
      .extract({ left, top: 0, width: width - left, height })
      .resize({ width: 1200 })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(join(output, `${name}.jpg`));
  }
}
