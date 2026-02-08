import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 200);
  const threadId = url.searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ ok: false, error: "THREAD_ID_REQUIRED" }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`chat:post:${ip}`, { windowMs: 60_000, max: 120 });
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
  const threadId = getString(b, "threadId", "");
  const content = getString(b, "content", "");

  if (!threadId) {
    return NextResponse.json({ ok: false, error: "THREAD_ID_REQUIRED" }, { status: 400 });
  }
  if (!content.trim()) {
    return NextResponse.json({ ok: false, error: "CONTENT_REQUIRED" }, { status: 400 });
  }
  if (content.length > 20_000) {
    return NextResponse.json({ ok: false, error: "CONTENT_TOO_LONG" }, { status: 413 });
  }

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  const userMsg = await prisma.chatMessage.create({
    data: { threadId, role: "user", content },
  });
  const assistantMsg = await prisma.chatMessage.create({
    data: { threadId, role: "assistant", content: "Recibido. Procesando…" },
  });

  return NextResponse.json(
    { userMsg, assistantMsg },
    { headers: { "Cache-Control": "no-store" } },
  );
}
