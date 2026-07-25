import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "win32") {
  process.exit(0);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundleServerPath = path.join(
  projectRoot,
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "build",
  "bundle-server.js",
);

const marker = "    const openNextServer = path.join(outputPath, packagePath, `index.mjs`);";
const patchMarker = "repairWindowsPnpmLinks";
const repairCode = `
    // pnpm directory symlinks copied by OpenNext cannot be traversed reliably on
    // Windows. Recreate only those generated links as directory junctions.
    if (process.platform === "win32") {
        const repairWindowsPnpmLinks = (root) => {
            if (!fs.existsSync(root)) return;
            const pending = [root];
            while (pending.length > 0) {
                const directory = pending.pop();
                for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                    const entryPath = path.join(directory, entry.name);
                    const stats = fs.lstatSync(entryPath);
                    if (stats.isSymbolicLink()) {
                        const target = path.resolve(path.dirname(entryPath), fs.readlinkSync(entryPath));
                        fs.unlinkSync(entryPath);
                        fs.symlinkSync(target, entryPath, "junction");
                    }
                    else if (stats.isDirectory()) {
                        pending.push(entryPath);
                    }
                }
            }
        };
        repairWindowsPnpmLinks(path.join(outputPath, packagePath, "node_modules", ".pnpm"));
    }
`;

const source = fs.readFileSync(bundleServerPath, "utf8");
if (source.includes(patchMarker)) {
  process.exit(0);
}
if (!source.includes(marker)) {
  throw new Error("Unsupported @opennextjs/cloudflare bundle-server layout.");
}

fs.writeFileSync(bundleServerPath, source.replace(marker, `${repairCode}\n${marker}`));

