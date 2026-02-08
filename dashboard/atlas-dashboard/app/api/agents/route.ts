import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const logsPerAgent = Math.min(Number(url.searchParams.get("logsPerAgent") ?? 30) || 30, 100);

  const [agents, logs, runs] = await Promise.all([
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
    prisma.logEntry.findMany({
      where: { agentId: { not: null } },
      orderBy: { timestamp: "desc" },
      take: Math.max(logsPerAgent * 20, 200),
    }),
    prisma.run.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  const runMap = new Map(runs.map((run) => [run.id, run]));

  const byAgent = new Map<string, typeof logs>();
  for (const log of logs) {
    if (!log.agentId) continue;
    const current = byAgent.get(log.agentId) ?? [];
    if (current.length < logsPerAgent) current.push(log);
    byAgent.set(log.agentId, current);
  }

  const payload = agents.map((agent) => {
    const agentLogs = byAgent.get(agent.id) ?? [];
    const lastLog = agentLogs[0] ?? null;
    const lastRun = agent.lastRunId ? runMap.get(agent.lastRunId) ?? null : null;

    return {
      ...agent,
      lastLog,
      lastRun,
      timeline: agentLogs,
    };
  });

  return NextResponse.json({ agents: payload }, { headers: { "Cache-Control": "no-store" } });
}
