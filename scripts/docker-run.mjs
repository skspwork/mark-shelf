#!/usr/bin/env node
// Cross-platform wrapper for `docker run` so $PWD / %cd% differences don't bite us.
import { spawn } from "node:child_process";
import path from "node:path";

const docsPath = path.resolve(process.cwd(), "docs");

const args = [
  "run",
  "--rm",
  "-p",
  "3000:3000",
  "-v",
  `${docsPath}:/docs`,
  ...process.argv.slice(2),
  "markshelf-base",
];

const child = spawn("docker", args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (err) => {
  console.error("[docker-run] failed to spawn docker:", err.message);
  process.exit(1);
});
