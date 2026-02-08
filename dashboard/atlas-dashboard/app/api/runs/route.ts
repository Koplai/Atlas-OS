import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const runs = await prisma.run.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ runs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const run = await prisma.run.create({
    data: {
      name: body.name ?? "Untitled Run",
      status: body.status ?? "PLANNED",
      steps: body.steps ?? null,
      inputs: body.inputs ?? null,
      outputs: body.outputs ?? null,
      evidenceRefs: body.evidenceRefs ?? [],
      approvals: body.approvals ?? null,
    },
  });
  return NextResponse.json({ run });
}
