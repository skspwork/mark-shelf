import { NextResponse } from "next/server";
import { buildTree, getDocsRoot } from "@/lib/docs";

export async function GET() {
  const tree = buildTree();
  return NextResponse.json({ root: getDocsRoot(), tree });
}
