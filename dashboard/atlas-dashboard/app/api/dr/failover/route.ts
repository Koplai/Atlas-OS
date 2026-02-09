import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DRFailoverMode = "PRIMARY" | "SECONDARY" | "DEGRADED" | "MAINTENANCE";
type DRFailoverAction = "SIMULATE" | "PLAN" | "EXECUTE" | "ABORT" | "FAILBACK";

/**
 * Contract draft: DR Control Center failover state + actions.
 *
 * GET  /api/dr/failover
 * POST /api/dr/failover
 */
export async function GET() {
  const now = new Date().toISOString();

  return NextResponse.json(
    {
      ok: true,
      contractVersion: "v0-draft",
      data: {
        tenantId: "atlas-core",
        environment: "prod",
        mode: "PRIMARY" satisfies DRFailoverMode,
        lastDrillAt: "2026-01-31T10:15:00.000Z",
        activeRegion: "eu-west-1",
        standbyRegion: "eu-central-1",
        rpoSeconds: 45,
        rtoSeconds: 300,
        readinessScore: 0.92,
        blockers: [],
      },
      links: {
        actions: "/api/dr/failover",
      },
      generatedAt: now,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    action?: DRFailoverAction;
    reason?: string;
    requestedBy?: string;
    ticketId?: string;
    dryRun?: boolean;
    targetRegion?: string;
  };

  if (!body.action || !body.reason || !body.requestedBy) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required fields: action, reason, requestedBy",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      contractVersion: "v0-draft",
      accepted: true,
      request: {
        action: body.action,
        reason: body.reason,
        requestedBy: body.requestedBy,
        ticketId: body.ticketId ?? null,
        dryRun: body.dryRun ?? false,
        targetRegion: body.targetRegion ?? null,
      },
      workflow: {
        id: `drf-${Date.now()}`,
        state: "QUEUED",
        approvalRequired: true,
      },
      generatedAt: new Date().toISOString(),
    },
    { status: 202 },
  );
}
