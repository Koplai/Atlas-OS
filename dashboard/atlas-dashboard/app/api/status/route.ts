import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const running = await prisma.run.findFirst({
    where: { status: "RUNNING" },
    orderBy: { createdAt: "desc" },
  });
  const lastLog = await prisma.logEntry.findFirst({
    orderBy: { timestamp: "desc" },
  });
  return NextResponse.json(
    {
      developing: !!running,
      run: running,
      lastLog,
      time: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
