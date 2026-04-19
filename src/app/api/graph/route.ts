import { NextResponse } from "next/server";
import { buildTree, flattenTree, readFile } from "@/lib/docs";
import { buildLinkGraph } from "@/lib/links";

export async function GET() {
  const tree = buildTree();
  const files = flattenTree(tree);
  const graph = buildLinkGraph(files, readFile);
  return NextResponse.json(graph);
}
