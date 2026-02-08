import { NextResponse } from "next/server";
import { Prisma, Severity, Source } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { asObject, getString, getClientIp, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

const SEVERITY = new Set(Object.values(Severity));
const SOURCE = new Set(Object.values(Source));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200) || 200, 1000);

  const logs = await prisma.logEntry.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`logs:post:${ip}`, { windowMs: 60_000, max: 120 });
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
  const severityStr = (b.severity as string | undefined) ?? "INFO";
  const sourceStr = (b.source as string | undefined) ?? "UI";
  const message = getString(b, "message", "");

  if (!SEVERITY.has(severityStr as Severity)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEVERITY" }, { status: 400 });
  }
  if (!SOURCE.has(sourceStr as Source)) {
    return NextResponse.json({ ok: false, error: "INVALID_SOURCE" }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ ok: false, error: "MESSAGE_REQUIRED" }, { status: 400 });
  }
  if (message.length > 20_000) {
    return NextResponse.json({ ok: false, error: "MESSAGE_TOO_LONG" }, { status: 413 });
  }

  const severity = severityStr as Severity;
  const source = sourceStr as Source;

  const log = await prisma.logEntry.create({
    data: {
      severity,
      source,
      message,
      runId: typeof b.runId === "string" ? b.runId : null,
      taskId: typeof b.taskId === "string" ? b.taskId : null,
      agentId: typeof b.agentId === "string" ? b.agentId : null,
      docId: typeof b.docId === "string" ? b.docId : null,
      workflowId: typeof b.workflowId === "string" ? b.workflowId : null,
      evidenceRef:
        (b as Record<string, unknown>).evidenceRef === undefined
          ? undefined
          : ((b as Record<string, unknown>).evidenceRef as Prisma.InputJsonValue),
    },
  });

  return NextResponse.json({ log }, { headers: { "Cache-Control": "no-store" } });
}
