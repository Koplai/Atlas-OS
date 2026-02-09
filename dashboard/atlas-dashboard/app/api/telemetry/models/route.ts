import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint schema draft: Cost + model telemetry stream aggregation.
 *
 * GET /api/telemetry/models
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      contractVersion: "v0-draft",
      window: {
        from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        granularity: "5m",
      },
      totals: {
        requests: 1932,
        promptTokens: 487221,
        completionTokens: 213009,
        totalTokens: 700230,
        estimatedCostUsd: 42.38,
        p95LatencyMs: 1640,
        errorRate: 0.013,
      },
      byModel: [
        {
          model: "gpt-5.3-codex",
          provider: "openai",
          requests: 1204,
          totalTokens: 439998,
          estimatedCostUsd: 31.16,
          avgLatencyMs: 1040,
          p95LatencyMs: 1510,
          cacheHitRate: 0.22,
          refusalRate: 0.004,
        },
        {
          model: "claude-sonnet-4.5",
          provider: "anthropic",
          requests: 728,
          totalTokens: 260232,
          estimatedCostUsd: 11.22,
          avgLatencyMs: 1220,
          p95LatencyMs: 1800,
          cacheHitRate: 0.19,
          refusalRate: 0.007,
        },
      ],
      budgets: {
        dailyLimitUsd: 500,
        consumedUsd: 301.91,
        projectedEndOfDayUsd: 438.67,
        burnRateUsdPerHour: 17.4,
      },
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
