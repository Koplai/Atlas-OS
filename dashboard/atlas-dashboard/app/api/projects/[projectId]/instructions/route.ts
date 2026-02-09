import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { asObject, getString } from "@/lib/request";

function docTitle(projectId: string) {
  return `project:${projectId}:instructions`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "PROJECT_ID_REQUIRED" }, { status: 400 });
  }

  const doc = await prisma.doc.findFirst({
    where: { title: docTitle(projectId), typeTag: "PROJECT_INSTRUCTIONS" },
  });

  return NextResponse.json(
    { ok: true, projectId, instructions: doc?.bodyMd ?? "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "PROJECT_ID_REQUIRED" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const b = asObject(body);
  const instructions = getString(b, "instructions", "").slice(0, 20_000);

  const existing = await prisma.doc.findFirst({
    where: { title: docTitle(projectId), typeTag: "PROJECT_INSTRUCTIONS" },
  });

  const doc = existing
    ? await prisma.doc.update({
        where: { id: existing.id },
        data: { bodyMd: instructions },
      })
    : await prisma.doc.create({
        data: {
          title: docTitle(projectId),
          typeTag: "PROJECT_INSTRUCTIONS",
          bodyMd: instructions,
          links: [],
        },
      });

  return NextResponse.json({ ok: true, projectId, docId: doc.id }, { headers: { "Cache-Control": "no-store" } });
}
