import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
const root = process.cwd();
const generated = await readFile(path.join(root, "src/data/catalog.generated.ts"), "utf8");
async function images(directory) { const result = []; for (const entry of await readdir(directory, { withFileTypes: true })) { const full = path.join(directory, entry.name); if (entry.isDirectory()) result.push(...await images(full)); else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(entry.name)) result.push(full); } return result; }
test("sync includes six homepage images and the five named series", async () => { assert.match(generated, /heroImages = \[/); assert.equal((await images(path.join(root, "public/home-hero"))).length, 6); for (const slug of ["single-cup-collection", "coffee-cup-collection", "christmas-collection", "easter-autumn", "ocean-collection"]) assert.match(generated, new RegExp(`"slug": "${slug}"`)); });
test("series covers are retained separately and old catalog assets are absent", async () => { assert.match(generated, /"cover": \{/); assert.doesNotMatch(generated, /cups-reactive-glaze|fusheng/); assert.ok((await images(path.join(root, "public/catalog"))).length > 0); });
