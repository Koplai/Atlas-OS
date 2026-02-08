import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOpenClawGatewayStatus } from "@/lib/exec";

export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = Date.now();

  const checks = {
    gateway: { ok: false, detail: "" },
    database: { ok: false, detail: "" },
    recentErrors: { ok: true, detail: "0" },
  };

  try {
    const { stdout, stderr } = await runOpenClawGatewayStatus();
    const out = `${stdout ?? ""}\n${stderr ?? ""}`.toLowerCase();
    checks.gateway.ok = out.includes("running") || out.includes("active") || out.includes("started");
    checks.gateway.detail = (stdout || stderr || "Sin salida").slice(0, 1000);
  } catch (err: unknown) {
    checks.gateway.ok = false;
    checks.gateway.detail = err instanceof Error ? err.message : String(err);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.ok = true;
    checks.database.detail = "OK";
  } catch (err: unknown) {
    checks.database.ok = false;
    checks.database.detail = err instanceof Error ? err.message : String(err);
  }

  try {
    const errorCount = await prisma.logEntry.count({
      where: { severity: { in: ["ERROR", "SECURITY"] } },
    });
    checks.recentErrors.detail = String(errorCount);
    checks.recentErrors.ok = errorCount < 50;
  } catch {
    checks.recentErrors.ok = false;
    checks.recentErrors.detail = "N/A";
  }

  const ok = checks.gateway.ok && checks.database.ok;

  return NextResponse.json(
    {
      ok,
      checks,
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
