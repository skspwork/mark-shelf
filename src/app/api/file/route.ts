import { NextRequest, NextResponse } from "next/server";
import { readFile } from "@/lib/docs";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  if (!filePath) return NextResponse.json({ error: "path required" }, { status: 400 });

  const content = readFile(filePath);
  if (content === null) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ path: filePath, content });
}
