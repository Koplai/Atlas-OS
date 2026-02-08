import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOpenClawGatewayStatus } from "@/lib/exec";
import { checkMcpServerStatus, getMcpServers } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = Date.now();

  const checks = {
    gateway: { ok: false, detail: "" },
    database: { ok: false, detail: "" },
    recentErrors: { ok: true, detail: "0" },
    mcp: { ok: false, detail: "0/0" },
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

  try {
    const statuses = await Promise.all(getMcpServers().map((s) => checkMcpServerStatus(s)));
    const enabled = statuses.filter((s) => s.enabled).length;
    const online = statuses.filter((s) => s.ok).length;
    checks.mcp.detail = `${online}/${enabled}`;
    checks.mcp.ok = enabled === 0 || online > 0;
  } catch {
    checks.mcp.ok = false;
    checks.mcp.detail = "N/A";
  }

  const ok = checks.gateway.ok && checks.database.ok && checks.mcp.ok;

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
