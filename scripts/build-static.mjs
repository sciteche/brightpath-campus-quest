#!/usr/bin/env node
/**
 * Builds the fully static version of the site (for GitHub Pages / Hostinger) into dist/.
 *
 * - Sets BRIGHTPATH_STATIC_BUILD=1 so vite.config.ts skips nitro, prerenders "/" and uses a
 *   relative base (the regular `bun run build` keeps producing the Lovable/Cloudflare output).
 * - Flattens the prerendered client output into dist/ so there is one folder to upload.
 * - TanStack Start normalizes Vite's relative base to "/./" in the URLs it emits itself
 *   (modulepreload links, the entry script and the inline route manifest), which would resolve
 *   to the domain root and break sub-folder hosting — rewrite those to "./" in the HTML.
 * - Adds 404.html (copy of index.html) so GitHub Pages serves the app for unknown paths,
 *   .nojekyll so GitHub Pages serves files verbatim, and .htaccess so Apache hosts
 *   (Hostinger) rewrite unknown paths back to index.html.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const vitePkg = require.resolve("vite/package.json");
const viteBin = path.join(path.dirname(vitePkg), require(vitePkg).bin.vite);

const result = spawnSync(process.execPath, [viteBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, BRIGHTPATH_STATIC_BUILD: "1" },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const dist = path.join(root, "dist");
const client = path.join(dist, "client");

if (!existsSync(path.join(client, "index.html"))) {
  console.error(`Static build failed: ${path.join(client, "index.html")} was not generated.`);
  process.exit(1);
}

// Flatten dist/client into dist and drop the (unused) SSR server build.
const staging = path.join(root, ".static-dist-tmp");
rmSync(staging, { recursive: true, force: true });
cpSync(client, staging, { recursive: true });
rmSync(dist, { recursive: true, force: true });
renameSync(staging, dist);

// Rewrite TanStack Start's "/./" asset URLs to plain relative "./" in every emitted page.
for (const file of readdirSync(dist)) {
  if (!file.endsWith(".html")) continue;
  const filePath = path.join(dist, file);
  const html = readFileSync(filePath, "utf8");
  writeFileSync(filePath, html.replaceAll("/./assets/", "./assets/"));
}

// GitHub Pages: serve the app shell for unknown URLs and skip Jekyll processing.
copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
writeFileSync(path.join(dist, ".nojekyll"), "");

// Apache (Hostinger): rewrite unknown paths to index.html so deep links never 404.
writeFileSync(
  path.join(dist, ".htaccess"),
  [
    "Options -MultiViews",
    "RewriteEngine On",
    "RewriteCond %{REQUEST_FILENAME} !-f",
    "RewriteCond %{REQUEST_FILENAME} !-d",
    "RewriteRule ^ index.html [L]",
    "",
  ].join("\n"),
);

console.log(`\nStatic site ready in ${dist}`);
