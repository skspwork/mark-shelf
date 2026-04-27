#!/usr/bin/env node
// Cross-platform wrapper for `docker run` so $PWD / %cd% differences don't bite us.
//
// 規約: コマンドは git リポジトリのルートで叩く。
//   - .git が docs の親にある構成 (例: repo/.git + repo/docs/) → そのまま起動、デフォルトで docs/ を読む
//   - docs 自身がリポジトリの構成 (docsRepo/.git + docsRepo/*.md) → MARKSHELF_DOCS=. を渡す
//   - docs フォルダ名が異なる/ネストしている場合は MARKSHELF_DOCS にリポジトリルートからの相対パスを渡す
// 履歴・タイムライン両方が機能するために、コンテナへは .git を含むリポジトリ全体を読み取り専用でマウントする。
import { spawn } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());
const docsRel = (process.env.MARKSHELF_DOCS || "docs").replace(/\\/g, "/");
const containerDocsRoot = path.posix.join("/workspace", docsRel);

const args = [
  "run",
  "--rm",
  "-p",
  "3000:3000",
  "-v",
  `${repoRoot}:/workspace:ro`,
  "-e",
  `MARKSHELF_ROOT=${containerDocsRoot}`,
  ...process.argv.slice(2),
  "markshelf-base",
];

const child = spawn("docker", args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (err) => {
  console.error("[docker-run] failed to spawn docker:", err.message);
  process.exit(1);
});
