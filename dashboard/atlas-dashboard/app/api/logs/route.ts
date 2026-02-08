import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.logEntry.findMany({ orderBy: { timestamp: "desc" } });
  return NextResponse.json({ logs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const log = await prisma.logEntry.create({
    data: {
      severity: body.severity ?? "INFO",
      source: body.source ?? "UI",
      message: body.message ?? "",
      runId: body.runId ?? null,
      taskId: body.taskId ?? null,
      agentId: body.agentId ?? null,
      docId: body.docId ?? null,
      workflowId: body.workflowId ?? null,
      evidenceRef: body.evidenceRef ?? null,
    },
  });
  return NextResponse.json({ log });
}
