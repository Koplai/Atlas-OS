# ATLAS-OS QA Test Plan — DR + Governance Dashboards

**Sprint:** Current  
**Owner:** QA  
**Scope:** Disaster Recovery (DR) dashboard + Governance dashboard  
**Objective:** Validate release readiness through smoke tests, controlled failure simulations, and evidence-based acceptance criteria.

---

## 1) Test Scope

### In Scope
- Dashboard availability and core rendering
- Data freshness and metric correctness (against source/API)
- Filters, time range selectors, drill-down behavior
- Alert/status panels tied to DR and governance controls
- RBAC visibility (at least Admin vs Read-only)
- Failure handling and observability for:
  - Gateway down
  - Port blocked
  - Config corruption

### Out of Scope
- Full performance/load certification
- Penetration testing
- Non-dashboard backend features unrelated to DR/governance metrics

---

## 2) Preconditions / Environment

- **Environment:** Staging (prod-like)
- **Build:** Candidate release artifact tagged for sprint
- **Test users:**
  - `qa_admin` (full dashboard access)
  - `qa_viewer` (read-only)
- **Logging/observability available:**
  - Application logs
  - Gateway/service logs
  - Reverse proxy/network logs (where applicable)
  - Browser console/network panel exports
- **Seed data:** Includes known-good DR and governance records to validate expected values

---

## 3) Smoke Test Suite (Run on every build)

| ID | Test | Steps | Expected Result | Evidence |
|---|---|---|---|---|
| SMK-01 | Dashboard load | Login as `qa_admin`; open DR dashboard and Governance dashboard | Both pages load without errors in <10s | Screenshot + browser HAR/console |
| SMK-02 | Core widgets render | Verify all primary KPI cards/charts/tables appear | No blank/error widgets; placeholders replaced with data | Screenshot |
| SMK-03 | Data freshness indicator | Check "last updated" timestamp vs backend/source | Timestamp within accepted lag (e.g., <=5 min) | Screenshot + API response snippet |
| SMK-04 | Time range filter | Switch 24h -> 7d -> 30d | Widgets refresh correctly, no crashes/spinners stuck | Screen capture / screenshots |
| SMK-05 | Drill-down/navigation | Click top incident/control and open details | Details page opens with matching entity and values | Screenshot + URL/ID match |
| SMK-06 | RBAC view restrictions | Login as `qa_viewer`; access both dashboards | Read-only data visible; restricted actions hidden/disabled | Screenshots (admin vs viewer) |
| SMK-07 | Error banner behavior | Trigger harmless API failure (single widget endpoint) | Clear, non-blocking error message; rest of dashboard works | Screenshot + network trace |
| SMK-08 | Export/report function (if present) | Export dashboard data/report | Export succeeds; file opens and matches visible filter state | Export file + screenshot |

---

## 4) Failure Simulation Tests

## FS-01: Gateway Down

**Goal:** Verify dashboard degradation behavior and logging when gateway is unavailable.

**Setup / Injection**
1. Confirm baseline healthy state.
2. Stop gateway service (or disable route to gateway).
3. Refresh dashboards and test API-backed widgets.

**Expected Behavior**
- UI shows service-unavailable state (banner/toast/widget fallback).
- No infinite loading loops.
- Graceful partial rendering where possible.
- Retry behavior follows policy (bounded retries/backoff).

**Expected Evidence / Logs**
- App logs: connection failures/timeouts with correlation/request IDs.
- Gateway logs: shutdown/unavailable period timestamps.
- Browser network: 5xx/timeout entries for impacted endpoints.
- Screenshot of user-facing error state.

**Pass Criteria**
- User receives actionable error message.
- System recovers without restart after gateway returns.
- No data corruption or stale data shown as fresh.

---

## FS-02: Port Blocked

**Goal:** Validate behavior when network path exists but required port is blocked.

**Setup / Injection**
1. Apply firewall/security group rule to block dashboard->gateway/service port.
2. Load/reload dashboards and execute filter/drill-down actions.

**Expected Behavior**
- Deterministic timeout/failure handling.
- UI communicates connectivity issue.
- Unaffected components remain operational.

**Expected Evidence / Logs**
- Network/firewall rule change evidence (command output or infra screenshot).
- App logs: connection refused/timeout errors.
- Proxy/network logs: blocked/denied events.
- Browser HAR showing failed requests.

**Pass Criteria**
- Failures are visible and diagnosable from logs.
- No frontend crash; no misleading success state.
- Recovery confirmed after unblocking port.

---

## FS-03: Config Corruption

**Goal:** Ensure safe failure when dashboard/service config is malformed or invalid.

**Setup / Injection**
1. Backup current config.
2. Introduce controlled corruption (invalid JSON/YAML key/type, wrong endpoint key).
3. Restart/reload affected service if required.

**Expected Behavior**
- Startup/runtime validation catches bad config.
- Clear error messaging in logs (line/key/reason).
- UI does not present false healthy status.
- Rollback to valid config restores service.

**Expected Evidence / Logs**
- Diff of config change (before/after).
- Service logs with parser/validation error details.
- Dashboard screenshot showing degraded/unavailable component.
- Recovery logs after rollback.

**Pass Criteria**
- Corruption is detected quickly and explicitly.
- Recovery path is documented and verified.
- No silent fallback to unsafe defaults.

---

## 5) Evidence Collection Standard

For each test case, attach:
1. **Timestamped screenshots** (UI state)
2. **Relevant logs** (app/gateway/proxy) with correlation IDs
3. **Network evidence** (HAR or request/response export)
4. **Test metadata** (build version, environment, tester, test case ID)
5. **Outcome** (Pass/Fail/Blocked + defect ticket link)

**Defect severity guidance:**
- **Critical:** Dashboard inaccessible, wrong governance/DR status, silent data integrity risk
- **High:** Major widget failures, broken drill-down, RBAC leakage
- **Medium:** Partial degradation with workaround
- **Low:** Cosmetic/non-blocking issues

---

## 6) Release Readiness Acceptance Checklist

Mark each item ✅ before release sign-off:

- [ ] All smoke tests (SMK-01..08) pass on release candidate
- [ ] FS-01 gateway down simulation executed and passed
- [ ] FS-02 port blocked simulation executed and passed
- [ ] FS-03 config corruption simulation executed and passed
- [ ] Recovery validated for all failure simulations
- [ ] Evidence package complete and archived
- [ ] No open Critical defects
- [ ] No open High defects without approved waiver
- [ ] RBAC verified (admin vs viewer)
- [ ] Data freshness/accuracy validated against source sample
- [ ] Monitoring/alerts verified for simulated outages
- [ ] QA sign-off recorded
- [ ] Product/Engineering sign-off recorded

---

## 7) Exit Criteria

Release is **QA-ready** only if:
- 100% smoke pass rate
- 100% required failure simulations pass (including recovery)
- No unresolved Critical defects
- High defects either closed or explicitly waived with risk acceptance
- Evidence bundle is complete and reproducible

---

## 8) Suggested Execution Order

1. Baseline smoke tests
2. Failure simulation FS-01 -> recovery check
3. Failure simulation FS-02 -> recovery check
4. Failure simulation FS-03 -> rollback + recovery
5. Final smoke regression
6. Acceptance checklist + sign-off
