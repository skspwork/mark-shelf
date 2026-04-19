import { NextResponse } from "next/server";
import { getTimeline } from "@/lib/git";

export async function GET() {
  const entries = await getTimeline();
  return NextResponse.json({ entries });
}
