import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`chat:post:${ip}`, { windowMs: 60_000, max: 60 });
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
  const content = getString(b, "content", "");
  if (!content.trim()) {
    return NextResponse.json({ ok: false, error: "CONTENT_REQUIRED" }, { status: 400 });
  }
  if (content.length > 20_000) {
    return NextResponse.json({ ok: false, error: "CONTENT_TOO_LONG" }, { status: 413 });
  }

  const userMsg = await prisma.chatMessage.create({
    data: { role: "user", content },
  });
  const assistantMsg = await prisma.chatMessage.create({
    data: { role: "assistant", content: "Recibido. Procesando…" },
  });

  return NextResponse.json(
    { userMsg, assistantMsg },
    { headers: { "Cache-Control": "no-store" } },
  );
}
