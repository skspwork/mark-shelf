#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

// --help / -h
if (args.includes("-h") || args.includes("--help")) {
  console.log(`MarkShelf - Structured markdown viewer for git repositories

Usage:
  markshelf [directory] [options]

Arguments:
  directory             Directory to serve (defaults to current working directory)

Options:
  -p, --port <port>     Port to listen on (default: 3000)
  -h, --help            Show this help

Examples:
  markshelf                  # Serve current directory
  markshelf ./docs           # Serve ./docs
  markshelf -p 8080 ./docs   # Serve on port 8080
`);
  process.exit(0);
}

// Parse --port / -p
let port = process.env.PORT || "3000";
const rest = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-p" || a === "--port") {
    port = args[++i];
  } else {
    rest.push(a);
  }
}

// First remaining positional arg = target directory
const targetDir = rest[0] ? resolve(rest[0]) : process.cwd();

if (!existsSync(targetDir)) {
  console.error(`Error: directory not found: ${targetDir}`);
  process.exit(1);
}

const serverPath = join(__dirname, "..", ".next", "standalone", "server.js");
if (!existsSync(serverPath)) {
  console.error(`Error: build output not found at ${serverPath}`);
  console.error("Run `npm run build` first.");
  process.exit(1);
}

process.env.MARKSHELF_ROOT = targetDir;

const child = spawn("node", [serverPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: "0.0.0.0",
  },
});

console.log(`MarkShelf running at http://localhost:${port}`);
console.log(`Serving: ${targetDir}`);

child.on("exit", (code) => process.exit(code || 0));
process.on("SIGINT", () => { child.kill(); process.exit(); });
process.on("SIGTERM", () => { child.kill(); process.exit(); });
