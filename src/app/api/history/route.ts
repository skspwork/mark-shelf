import { NextRequest, NextResponse } from "next/server";
import { getFileHistory } from "@/lib/git";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  if (!filePath) return NextResponse.json({ error: "path required" }, { status: 400 });

  const history = await getFileHistory(filePath);
  return NextResponse.json(history);
}
