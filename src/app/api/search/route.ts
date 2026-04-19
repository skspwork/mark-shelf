import { NextRequest, NextResponse } from "next/server";
import { buildTree, flattenTree, readFile } from "@/lib/docs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const tree = buildTree();
  const files = flattenTree(tree);
  const query = q.toLowerCase();

  const results: {
    path: string;
    displayName: string;
    matches: { line: number; text: string }[];
  }[] = [];

  for (const file of files) {
    const content = readFile(file.path);
    if (!content) continue;

    const lines = content.split("\n");
    const matches: { line: number; text: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query)) {
        matches.push({ line: i + 1, text: lines[i].trimStart() });
        if (matches.length >= 5) break;
      }
    }

    if (matches.length > 0) {
      results.push({ path: file.path, displayName: file.displayName, matches });
    }
  }

  return NextResponse.json({ results });
}
