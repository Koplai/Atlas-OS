import { NextResponse } from "next/server";
import { Prisma, RunStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, getStringArray, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

const STATUS = new Set(Object.values(RunStatus));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 500);

  const runs = await prisma.run.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ runs }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`runs:post:${ip}`, { windowMs: 60_000, max: 60 });
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

  const statusStr = (b.status as string | undefined) ?? "PLANNED";
  if (!STATUS.has(statusStr as RunStatus)) {
    return NextResponse.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
  }

  const name = getString(b, "name", "Untitled Run");
  if (name.length > 2000) {
    return NextResponse.json({ ok: false, error: "NAME_TOO_LONG" }, { status: 413 });
  }

  const status = statusStr as RunStatus;

  const run = await prisma.run.create({
    data: {
      name,
      status,
      steps: b.steps === undefined ? undefined : (b.steps as Prisma.InputJsonValue),
      inputs: b.inputs === undefined ? undefined : (b.inputs as Prisma.InputJsonValue),
      outputs: b.outputs === undefined ? undefined : (b.outputs as Prisma.InputJsonValue),
      evidenceRefs: getStringArray(b, "evidenceRefs"),
      approvals: b.approvals === undefined ? undefined : (b.approvals as Prisma.InputJsonValue),
    },
  });

  return NextResponse.json({ run }, { headers: { "Cache-Control": "no-store" } });
}
