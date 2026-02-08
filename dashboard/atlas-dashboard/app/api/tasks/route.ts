import { NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, getStringArray, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

const STATUS = new Set(Object.values(TaskStatus));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200) || 200, 500);

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ tasks }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`tasks:post:${ip}`, { windowMs: 60_000, max: 60 });
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

  const statusStr = (b.status as string | undefined) ?? "TODO";
  if (!STATUS.has(statusStr as TaskStatus)) {
    return NextResponse.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
  }

  const title = getString(b, "title", "Untitled");
  if (title.length > 2000) {
    return NextResponse.json({ ok: false, error: "TITLE_TOO_LONG" }, { status: 413 });
  }

  const status = statusStr as TaskStatus;

  const task = await prisma.task.create({
    data: {
      title,
      status,
      tags: getStringArray(b, "tags"),
      linkedRunIds: getStringArray(b, "linkedRunIds"),
      evidenceRefs: getStringArray(b, "evidenceRefs"),
    },
  });

  return NextResponse.json({ task }, { headers: { "Cache-Control": "no-store" } });
}
