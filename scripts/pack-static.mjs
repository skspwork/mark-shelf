#!/usr/bin/env node
/**
 * Copy Next.js static assets into the standalone output so that
 * the packaged CLI can serve everything from a single directory.
 */
import { cpSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.error("Error: .next/standalone not found. Did `next build` run?");
  process.exit(1);
}

// Copy .next/static → .next/standalone/.next/static
cpSync(join(root, ".next/static"), join(standalone, ".next/static"), { recursive: true });

// Copy public/ → .next/standalone/public (if exists)
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
}

console.log("Packed static assets into .next/standalone");
