import { NextRequest, NextResponse } from "next/server";
import { getFileDiff } from "@/lib/git";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  const hash = req.nextUrl.searchParams.get("hash");
  if (!filePath || !hash) return NextResponse.json({ error: "path and hash required" }, { status: 400 });

  const diff = await getFileDiff(filePath, hash);
  return NextResponse.json({ diff });
}
