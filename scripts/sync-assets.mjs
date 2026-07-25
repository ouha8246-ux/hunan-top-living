import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.resolve(process.env.CATALOG_SOURCE_DIR || "C:\\Users\\Administrator\\Desktop\\网站图片\\产品图片");
const outputRoot = path.join(projectRoot, "public", "catalog");
const heroOutputRoot = path.join(projectRoot, "public", "home-hero");
const manifestPath = path.join(projectRoot, "src", "data", "catalog.generated.ts");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

const names = {
  "单杯系列": ["Single Cup Collection", "single-cup-collection"],
  "咖啡杯系列": ["Coffee Cup Collection", "coffee-cup-collection"],
  "圣诞系列": ["Christmas Collection", "christmas-collection"],
  "复活节和秋天": ["Easter & Autumn", "easter-autumn"],
  "海洋系列": ["Ocean Collection", "ocean-collection"],
  "反应釉": ["Reactive Glaze", "reactive-glaze"],
  "喷涂": ["Spray Coating", "spray-coating"],
  "电镀": ["Electroplated", "electroplated"],
  "色釉": ["Colored Glaze", "colored-glaze"],
  "复活节": ["Easter", "easter"],
  "秋天": ["Autumn", "autumn"],
  "包装": ["Packaging", "packaging"],
};

function naturalSort(a, b) { return a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" }); }
function slugify(value) { return value.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "collection"; }
function translatedName(zh) {
  if (names[zh]) return { en: names[zh][0], slug: names[zh][1] };
  if (/^\d+$/.test(zh)) return { en: `Collection ${zh}`, slug: `collection-${zh}` };
  return { en: zh, slug: slugify(zh) };
}
function isImage(entry) { return entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()); }
function isCover(fileName) { return fileName.includes("系列主图"); }

async function imageDimensions(filePath) {
  const buffer = await readFile(filePath);
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      offset += length + 2;
    }
  }
  throw new Error(`Unable to read image dimensions: ${filePath}`);
}

async function entries(directory) { return (await readdir(directory, { withFileTypes: true })).sort((a, b) => naturalSort(a.name, b.name)); }
async function directImages(directory) { return (await entries(directory)).filter(isImage); }
async function recursiveImages(directory) {
  const result = [];
  for (const entry of await entries(directory)) {
    const fullPath = path.join(directory, entry.name);
    if (isImage(entry)) result.push({ diskName: entry.name, fullPath });
    if (entry.isDirectory()) result.push(...await recursiveImages(fullPath));
  }
  return result;
}
async function copyImage(file, destination) {
  await cp(file.fullPath, destination);
  return { ...await imageDimensions(file.fullPath), sourceName: file.diskName };
}

await rm(outputRoot, { recursive: true, force: true });
await rm(heroOutputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await mkdir(heroOutputRoot, { recursive: true });

const heroDirectory = path.join(sourceRoot, "主页轮播图");
const heroes = [];
for (const [index, entry] of (await directImages(heroDirectory)).entries()) {
  const extension = path.extname(entry.name).toLowerCase();
  const file = { diskName: entry.name, fullPath: path.join(heroDirectory, entry.name) };
  const outputName = `${String(index + 1).padStart(3, "0")}${extension}`;
  heroes.push({ id: `hero-${index + 1}`, src: `/home-hero/${outputName}`, ...await copyImage(file, path.join(heroOutputRoot, outputName)) });
}

const catalog = [];
let productImageCount = 0;
for (const seriesEntry of await entries(sourceRoot)) {
  if (!seriesEntry.isDirectory() || seriesEntry.name === "主页轮播图") continue;
  const seriesPath = path.join(sourceRoot, seriesEntry.name);
  const seriesName = translatedName(seriesEntry.name);
  const children = await entries(seriesPath);
  const childDirectories = children.filter((entry) => entry.isDirectory());
  const typeSources = childDirectories.length
    ? childDirectories.map((entry) => ({ name: entry.name, path: path.join(seriesPath, entry.name) }))
    : [{ name: seriesEntry.name, path: seriesPath }];
  const types = [];

  for (const [typeIndex, typeSource] of typeSources.entries()) {
    const typeName = translatedName(typeSource.name);
    const files = await recursiveImages(typeSource.path);
    const coverFile = files.find((file) => isCover(file.diskName));
    const productFiles = files.filter((file) => !isCover(file.diskName));
    if (!coverFile && productFiles.length === 0) continue;
    const destination = path.join(outputRoot, seriesName.slug, typeName.slug);
    await mkdir(destination, { recursive: true });
    let cover;
    if (coverFile) {
      const outputName = `cover${path.extname(coverFile.diskName).toLowerCase()}`;
      cover = { id: `${seriesName.slug}-${typeName.slug}-cover`, src: `/catalog/${seriesName.slug}/${typeName.slug}/${outputName}`, ...await copyImage(coverFile, path.join(destination, outputName)) };
    }
    const images = [];
    for (const [imageIndex, file] of productFiles.entries()) {
      const outputName = `${String(imageIndex + 1).padStart(3, "0")}${path.extname(file.diskName).toLowerCase()}`;
      images.push({ id: `${seriesName.slug}-${typeName.slug}-${imageIndex + 1}`, src: `/catalog/${seriesName.slug}/${typeName.slug}/${outputName}`, ...await copyImage(file, path.join(destination, outputName)) });
      productImageCount += 1;
    }
    types.push({ order: typeIndex + 1, slug: typeName.slug, name: { en: typeName.en, zh: typeSource.name }, cover, images });
  }
  if (types.length) catalog.push({ order: catalog.length + 1, slug: seriesName.slug, name: { en: seriesName.en, zh: seriesEntry.name }, types });
}

const generated = `// Generated by scripts/sync-assets.mjs. Do not edit by hand.\nimport type { HeroImage, Series } from "@/types/catalog";\n\nexport const heroImages = ${JSON.stringify(heroes, null, 2)} as const satisfies readonly HeroImage[];\n\nexport const catalog = ${JSON.stringify(catalog, null, 2)} as const satisfies readonly Series[];\n\nexport const catalogImageCount = ${productImageCount};\n`;
await writeFile(manifestPath, generated, "utf8");
console.log(`Synced ${heroes.length} hero images and ${productImageCount} product images across ${catalog.length} series.`);
