import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);

  const threads = await prisma.chatThread.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ threads }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`threads:post:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMIT" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const b = asObject(body);
  const title = getString(b, "title", "Nuevo chat").slice(0, 200);

  const thread = await prisma.chatThread.create({ data: { title } });

  return NextResponse.json({ thread }, { headers: { "Cache-Control": "no-store" } });
}
