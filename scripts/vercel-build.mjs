/**
 * Vercel Build Output API v3 build script.
 *
 * This script:
 * 1. Runs the normal workspace build (typecheck + build all packages).
 * 2. Creates the `.vercel/output` directory structure that Vercel consumes
 *    directly, bypassing all framework detection and routing overrides.
 * 3. Copies the frontend build output into `.vercel/output/static/`.
 * 4. Writes `.vercel/output/config.json` with SPA catch-all routing so that
 *    refreshing any client-side route serves index.html instead of a 404.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ── 1. Run the normal workspace build ────────────────────────────────────────
console.log("[vercel-build] Running workspace build…");
execSync("pnpm run build", { cwd: ROOT, stdio: "inherit" });

// ── 2. Paths ─────────────────────────────────────────────────────────────────
const FRONTEND_DIST = path.join(ROOT, "artifacts", "globaltrack", "dist", "public");
const VERCEL_OUTPUT = path.join(ROOT, ".vercel", "output");
const STATIC_DIR = path.join(VERCEL_OUTPUT, "static");

// ── 3. Verify frontend build output exists ───────────────────────────────────
if (!fs.existsSync(path.join(FRONTEND_DIST, "index.html"))) {
  console.error("[vercel-build] ERROR: index.html not found in", FRONTEND_DIST);
  process.exit(1);
}

// ── 4. Create .vercel/output directory structure ─────────────────────────────
console.log("[vercel-build] Creating .vercel/output structure…");

// Clean previous output if any
if (fs.existsSync(VERCEL_OUTPUT)) {
  fs.rmSync(VERCEL_OUTPUT, { recursive: true, force: true });
}
fs.mkdirSync(VERCEL_OUTPUT, { recursive: true });

// ── 5. Write config.json with SPA routing ────────────────────────────────────
const config = {
  version: 3,
  routes: [
    // First, try to serve the request from the filesystem (static assets)
    { handle: "filesystem" },
    // If no file matches, rewrite to index.html for client-side routing
    { src: "/(.*)", dest: "/index.html" },
  ],
};

fs.writeFileSync(
  path.join(VERCEL_OUTPUT, "config.json"),
  JSON.stringify(config, null, 2),
);
console.log("[vercel-build] Wrote config.json");

// ── 6. Copy frontend build output to static/ ─────────────────────────────────
function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("[vercel-build] Copying frontend build to .vercel/output/static/…");
copyRecursive(FRONTEND_DIST, STATIC_DIR);

// Don't include vercel.json or _redirects in the static output
for (const junk of ["vercel.json", "_redirects"]) {
  const junkPath = path.join(STATIC_DIR, junk);
  if (fs.existsSync(junkPath)) {
    fs.unlinkSync(junkPath);
  }
}

console.log("[vercel-build] Done! .vercel/output is ready.");
