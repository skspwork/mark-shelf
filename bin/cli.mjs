#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || "3000";

// Set MARKSHELF_ROOT to cwd so the app reads from where the user runs the command
process.env.MARKSHELF_ROOT = process.cwd();

const serverPath = join(__dirname, "..", ".next", "standalone", "server.js");

const child = spawn("node", [serverPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: "0.0.0.0",
  },
});

child.on("exit", (code) => process.exit(code || 0));
process.on("SIGINT", () => { child.kill(); process.exit(); });
process.on("SIGTERM", () => { child.kill(); process.exit(); });

console.log(`MarkShelf running at http://localhost:${port}`);
console.log(`Serving: ${process.env.MARKSHELF_ROOT}`);
