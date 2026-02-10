# ATLAS Agent Status Board

## Estado global
- Modelo operativo AGOM: activo
- Zero Trust: activo
- Reporting por chunks: activo

## Agentes
- Atlas (orquestador): ACTIVE_TASK
- DevAgent: BACKLOG_ADVANCE
- UI/UX Agent: BACKLOG_ADVANCE
- QA Agent: BACKLOG_ADVANCE
- ATLAS-SEC: SYSTEM_HARDENING
- ATLAS-GRC: SYSTEM_HARDENING
- Content/Docs Agent: CONTINUOUS_LEARNING

## Cola de dependencias (hacia Atlas)
- Sin bloqueos críticos reportados en este corte.

## Workers / ubicación
- Ver topología vigente en: `docs/ATLAS_WORKER_TOPOLOGY.md`
- Worker pack actual en Docker Desktop:
  - `atlas-worker-pmo`
  - `atlas-worker-sec`
  - `atlas-worker-seo`
