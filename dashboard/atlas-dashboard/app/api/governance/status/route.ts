import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SecurityPosture = "GREEN" | "YELLOW" | "RED";
type OverrideScope = "ATLAS_SEC" | "ATLAS_GRC";

/**
 * Contract draft: ATLAS-SEC / GRC policy status + override flow.
 *
 * GET  /api/governance/status
 * POST /api/governance/status
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      contractVersion: "v0-draft",
      data: {
        tenantId: "atlas-core",
        security: {
          posture: "YELLOW" satisfies SecurityPosture,
          openIncidents: 2,
          controlsPassing: 124,
          controlsFailing: 3,
          lastEvaluationAt: new Date().toISOString(),
        },
        grc: {
          policyVersion: "2026.02",
          exceptionsOpen: 4,
          approvalsPending: 1,
          auditWindow: "Q1-2026",
        },
        overridesActive: [
          {
            overrideId: "ovr-8842",
            scope: "ATLAS_SEC" satisfies OverrideScope,
            controlId: "SEC-NET-12",
            reason: "Temporary maintenance on WAF rules",
            expiresAt: "2026-02-10T02:00:00.000Z",
            approvedBy: "ciso@atlas.local",
          },
        ],
      },
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    scope?: OverrideScope;
    controlId?: string;
    reason?: string;
    requestedBy?: string;
    expiresAt?: string;
  };

  if (!body.scope || !body.controlId || !body.reason || !body.requestedBy) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required fields: scope, controlId, reason, requestedBy",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      contractVersion: "v0-draft",
      accepted: true,
      overrideRequest: {
        overrideId: `ovr-${Date.now()}`,
        status: "PENDING_APPROVAL",
        ...body,
      },
      generatedAt: new Date().toISOString(),
    },
    { status: 202 },
  );
}
