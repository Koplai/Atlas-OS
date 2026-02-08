import { NextResponse } from "next/server";

import { checkMcpServerStatus, getMcpServers } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const servers = getMcpServers();

  const statuses = await Promise.all(servers.map((s) => checkMcpServerStatus(s)));
  const online = statuses.filter((s) => s.ok).length;
  const enabled = statuses.filter((s) => s.enabled).length;

  return NextResponse.json(
    {
      ok: online > 0 || enabled === 0,
      summary: {
        configured: statuses.length,
        enabled,
        online,
      },
      servers: statuses,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
