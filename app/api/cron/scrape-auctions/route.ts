import { NextResponse } from "next/server";
import { collectAll } from "@/lib/auctions/collect";
import { notifyMatches } from "@/lib/auctions/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== ["Bearer", secret].join(" ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await collectAll();
  const notifications = await notifyMatches();
  return NextResponse.json({ report, notifications });
}
