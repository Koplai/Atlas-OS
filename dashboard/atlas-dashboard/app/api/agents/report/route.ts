import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { runOpenClawSessionsJson } from "@/lib/exec";
import { checkLocalLlmHealth } from "@/lib/local-llm";

export const dynamic = "force-dynamic";

type SessionItem = {
  key: string;
  kind?: string;
  updatedAt?: number;
  ageMs?: number;
  sessionId?: string;
  model?: string;
  contextTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type PriceRule = { inputPer1M: number; outputPer1M: number };

const PRICE_MAP: Record<string, PriceRule> = {
  "openai/gpt-4.1": { inputPer1M: 2, outputPer1M: 8 },
  "openai/gpt-4.1-mini": { inputPer1M: 0.4, outputPer1M: 1.6 },
  "openai/gpt-4o": { inputPer1M: 5, outputPer1M: 15 },
  "openai/gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
};

function normalizeModel(model?: string) {
  if (!model) return "unknown";
  if (model.includes("/")) return model;
  return `openai-codex/${model}`;
}

function resolvePriceRule(model?: string) {
  if (!model) return null;
  const normalized = normalizeModel(model).toLowerCase();
  const exact = PRICE_MAP[normalized];
  if (exact) return exact;

  const fallback = Object.entries(PRICE_MAP).find(([key]) => normalized.startsWith(key));
  return fallback?.[1] ?? null;
}

function isCloudModel(model?: string) {
  if (!model) return false;
  const m = normalizeModel(model).toLowerCase();
  return !m.startsWith("ollama/") && !m.includes("local");
}

function isLocalModel(model?: string) {
  if (!model) return false;
  return !isCloudModel(model);
}

function parseAgentLabel(key: string) {
  const parts = key.split(":");
  const root = parts[1] ?? "main";
  const scope = parts[2] ?? "session";
  const tail = parts[3];

  if (scope === "main") return `${root} · main`;
  if (scope === "subagent") return `${root} · subagent ${tail?.slice(0, 8) ?? "n/a"}`;
  return `${root} · ${scope}`;
}

function statusFromAge(ageMs?: number) {
  if (ageMs == null) return "UNKNOWN";
  if (ageMs <= 5 * 60_000) return "ACTIVE";
  if (ageMs <= 30 * 60_000) return "IDLE";
  return "STALE";
}

export async function GET() {
  const [agents, sessionsRaw, localLlmHealth] = await Promise.all([
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
    runOpenClawSessionsJson(),
    checkLocalLlmHealth(),
  ]);

  let sessions: SessionItem[] = [];
  try {
    const parsed = JSON.parse(sessionsRaw.stdout || "{}");
    sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
  } catch {
    sessions = [];
  }

  const rows = sessions.map((s) => {
    const model = normalizeModel(s.model);
    const inputTokens = s.inputTokens ?? 0;
    const outputTokens = s.outputTokens ?? 0;
    const totalTokens = s.totalTokens ?? inputTokens + outputTokens;
    const contextTokens = s.contextTokens ?? 0;

    const priceRule = resolvePriceRule(s.model);
    const estimatedCostUsd = priceRule
      ? (inputTokens / 1_000_000) * priceRule.inputPer1M + (outputTokens / 1_000_000) * priceRule.outputPer1M
      : null;

    return {
      key: s.key,
      sessionId: s.sessionId ?? null,
      agentLabel: parseAgentLabel(s.key),
      kind: s.kind ?? "direct",
      status: statusFromAge(s.ageMs),
      model,
      isCloud: isCloudModel(s.model),
      contextTokens,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd,
      lastActivityAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
      ageMs: s.ageMs ?? null,
    };
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.sessions += 1;
      acc.contextTokens += row.contextTokens;
      acc.inputTokens += row.inputTokens;
      acc.outputTokens += row.outputTokens;
      acc.totalTokens += row.totalTokens;
      if (row.status === "ACTIVE") acc.active += 1;
      if (row.estimatedCostUsd != null) {
        acc.estimatedCostUsd += row.estimatedCostUsd;
        acc.sessionsWithCost += 1;
      }
      if (row.isCloud) acc.cloudSessions += 1;
      return acc;
    },
    {
      sessions: 0,
      active: 0,
      contextTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      sessionsWithCost: 0,
      cloudSessions: 0,
    },
  );

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      configuredAgents: agents.map((a) => ({ id: a.id, name: a.name, status: a.status })),
      rows,
      totals,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
