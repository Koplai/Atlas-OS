# Atlas OS — Agents Runtime UI Spec (MVP)

## Objetivo
Visualizar en tiempo real qué agentes están activos, qué modelo usan (local/cloud), cuándo corren, coste aproximado y bloqueos de aprobación.

## Paneles

### 1) Agents Runtime
- columnas: `agent`, `state`, `model`, `model_type(local|cloud)`, `last_run`, `next_run`, `duration_ms`, `status`.
- filtros: estado, owner, prioridad.
- acciones (solo Atlas): pause/resume/force-run.

### 2) Cost & Tokens
- KPIs: coste día, coste mes, % local vs cloud, tokens por agente.
- serie temporal 24h/7d.
- alertas: umbral 75% budget.

### 3) Queue / Backlog
- tareas por estado: queued/running/blocked/done.
- bloqueo muestra: `dependency`, `risk`, `needs_human_approval`.

### 4) Policy Gate
- solicitudes pendientes de aprobación.
- historial de decisiones (approve/reject) con motivo.

## Endpoints MVP
- `GET /api/agents/runtime`
- `GET /api/agents/schedule`
- `GET /api/agents/cost`
- `GET /api/agents/queue`
- `GET /api/agents/policy/pending`
- `POST /api/agents/policy/decision`

## Configuración base acordada (guardar como baseline)
- Persistentes: `ATLAS-SEC`, `ATLAS-GRC`, `BOARD-COORD`.
- Board por ciclos: `CSO`, `CRO`, `CFO-RISK`, `CPVO`, `COO`, `EU-REG`.
- Model routing:
  - ATLAS-SEC -> `gpt-5.3-codex` (cloud)
  - ATLAS-GRC -> `llama3.1:8b` (local)
  - BOARD-COORD -> `qwen2.5:7b-instruct` (local)
  - CSO -> `deepseek-r1:14b` (local)
  - CRO -> `qwen2.5:7b-instruct` (local)
  - CFO-RISK -> `gpt-5.3-codex` (cloud)
  - CPVO -> `qwen2.5-coder:7b` (local)
  - COO -> `llama3.1:8b` (local)
  - EU-REG -> `gpt-5.3-codex` (cloud)

## Cadencia recomendada
- 00:10 SEC | 00:25 GRC | 00:40 BOARD-COORD
- 01:10 CRO | 01:25 CPVO | 01:40 COO (si backlog)
- 02:10 CSO | 02:40 CFO | 03:10 EU-REG
- max 2 concurrentes.

## Criterio de éxito MVP (48h)
- tablero muestra estado y modelo de cada agente.
- alertas de presupuesto activas.
- cola y aprobaciones visibles para Atlas.
