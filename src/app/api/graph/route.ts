import { NextResponse } from "next/server";
import { buildTree, flattenTree, readFile, statFile } from "@/lib/docs";
import { getCachedLinkGraph } from "@/lib/links";

export async function GET() {
  const tree = buildTree();
  const files = flattenTree(tree);
  const graph = getCachedLinkGraph(files, readFile, statFile);
  return NextResponse.json(graph);
}
