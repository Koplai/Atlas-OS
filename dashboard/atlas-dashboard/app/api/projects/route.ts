import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asObject, getClientIp, getString, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ projects }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`projects:post:${ip}`, { windowMs: 60_000, max: 30 });
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
  const name = getString(b, "name", "Nuevo proyecto").slice(0, 120);

  const project = await prisma.project.create({ data: { name } });

  return NextResponse.json({ project }, { headers: { "Cache-Control": "no-store" } });
}
