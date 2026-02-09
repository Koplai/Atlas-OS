# ATLAS-OS Sprint: DR + Governance API Skeleton (Draft)

## Delivered endpoints (backend skeleton)

### 1) DR failover status/actions
**Path:** `app/api/dr/failover/route.ts`

- `GET /api/dr/failover`
  - Returns DR posture snapshot (`mode`, `rpoSeconds`, `rtoSeconds`, regions, blockers).
- `POST /api/dr/failover`
  - Accepts failover action request draft.
  - Required body fields: `action`, `reason`, `requestedBy`.
  - Optional: `ticketId`, `dryRun`, `targetRegion`.
  - Returns `202 Accepted` with queued workflow stub (`approvalRequired: true`).

### 2) ATLAS-SEC / GRC status + overrides
**Path:** `app/api/governance/status/route.ts`

- `GET /api/governance/status`
  - Returns combined security + GRC posture and active overrides.
- `POST /api/governance/status`
  - Creates override request draft.
  - Required body fields: `scope`, `controlId`, `reason`, `requestedBy`.
  - Optional: `expiresAt`.
  - Returns `202 Accepted` with `PENDING_APPROVAL` stub.

### 3) Cost/model telemetry schema
**Path:** `app/api/telemetry/models/route.ts`

- `GET /api/telemetry/models`
  - Returns telemetry window, totals, per-model metrics, and budget projection.
  - Schema includes: `requests`, token counts, `estimatedCostUsd`, latency (avg/p95), error/refusal/cache rates.

---

## Next implementation steps (actionable)

1. **Persist contract data**
   - Replace stubs with Prisma-backed reads/writes (`dr_events`, `policy_overrides`, `llm_usage_metrics`).
2. **Add authN/authZ**
   - Enforce role-based access (`ops-admin`, `security-approver`, `viewer`) + audit identity on POST.
3. **Approval workflows**
   - Integrate POST actions with queue/orchestrator (n8n or internal worker), including dual-approval for risky DR actions.
4. **Validation + idempotency**
   - Add strict request validation and idempotency keys for POST endpoints.
5. **Observability and alerting**
   - Emit structured logs + traces; set alerts for `mode !== PRIMARY`, high error rate, and budget overruns.
6. **OpenAPI generation**
   - Publish these drafts in an OpenAPI spec for frontend contract locking and test generation.
