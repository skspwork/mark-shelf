#!/usr/bin/env node
// vibe-shift のプロジェクトをマークダウンフォルダにエクスポートする

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "..", "test-docs");
const API_URL = process.env.VIBESHIFT_API_URL || "http://localhost:3001";
const PROJECT_NAME = process.argv[2] || "VibeShift";

// ファイル名に使えない文字をサニタイズ
function sanitize(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function padNum(n) {
  return String(n).padStart(2, "0");
}

async function main() {
  // プロジェクト一覧取得
  const projectsRes = await fetch(`${API_URL}/projects`);
  const projects = await projectsRes.json();
  const project = projects.find((p) => p.name === PROJECT_NAME);
  if (!project) {
    console.error(`プロジェクト "${PROJECT_NAME}" が見つかりません`);
    process.exit(1);
  }

  // グラフ取得
  const graphRes = await fetch(`${API_URL}/projects/${project.id}/graph`);
  const { nodes, edges } = await graphRes.json();

  // 親子マップ
  const childMap = new Map();
  for (const e of edges) {
    if (e.link_type !== "derives") continue;
    const children = childMap.get(e.from_node_id) || [];
    children.push(e.to_node_id);
    childMap.set(e.from_node_id, children);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const overview = nodes.find((n) => n.type === "overview");

  // クリーンアップ
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // overview をルートの README.md に
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "README.md"),
    `# ${overview.title}\n\n${overview.content}\n`,
    "utf-8"
  );

  // 再帰的に書き出し
  function writeNode(nodeId, parentDir, orderIndex) {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const children = (childMap.get(nodeId) || [])
      .map((cid) => nodeMap.get(cid))
      .filter(Boolean);

    const baseName = `${padNum(orderIndex)}_${sanitize(node.title)}`;

    if (children.length > 0) {
      // フォルダ + README.md
      const dir = path.join(parentDir, baseName);
      fs.mkdirSync(dir, { recursive: true });
      const typeLabel = { need: "要求", feature: "機能", spec: "仕様" }[node.type] || node.type;
      fs.writeFileSync(
        path.join(dir, "README.md"),
        `# [${typeLabel}] ${node.title}\n\n${node.content}\n`,
        "utf-8"
      );
      children.forEach((child, i) => writeNode(child.id, dir, i + 1));
    } else {
      // 末端 = .md ファイル
      const typeLabel = { need: "要求", feature: "機能", spec: "仕様" }[node.type] || node.type;
      fs.writeFileSync(
        path.join(parentDir, `${baseName}.md`),
        `# [${typeLabel}] ${node.title}\n\n${node.content}\n`,
        "utf-8"
      );
    }
  }

  // overview の直接の子(need)から開始
  const needs = (childMap.get(overview.id) || [])
    .map((cid) => nodeMap.get(cid))
    .filter((n) => n && !n.disabled_at);
  needs.forEach((need, i) => writeNode(need.id, OUTPUT_DIR, i + 1));

  console.log(`✓ エクスポート完了: ${OUTPUT_DIR}`);
  console.log(`  - プロジェクト: ${project.name}`);
  console.log(`  - ノード数: ${nodes.filter((n) => !n.disabled_at).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
