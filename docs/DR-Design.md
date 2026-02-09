# DR Design — OpenClaw/Atlas Warm-Standby (WSL + Docker Desktop)

## Objetivo
- RPO: 15 minutos
- Warm-standby en Docker Desktop en puerto alterno (28789)
- Snapshot promotion con gates anti-corrupción

## Diagrama (Mermaid)
```mermaid
flowchart LR
  A[WSL Primario :18789] -->|snapshot 15m| B[/AtlasVault snapshots/]
  A --> C[/AtlasVault manifests/]
  C --> D{Validation Gates}
  D -- pass --> E[last-known-good]
  D -- fail --> F[reject snapshot]
  G[Windows Witness 60s] -->|health check| A
  G -->|3 fails| H[Docker Standby :28789]
  H -->|restore LKG| B
  H --> I[/health ok + audit log]
```

## Fases
- Fase 0 ✅ inventario base
- Fase 1 ✅ AtlasVault scaffold + logs + RBAC scaffold
- Fase 2 ✅ Snapshot + validación + promoción LKG
- Fase 3 ⏳ Standby Docker
- Fase 4 ⏳ Witness PowerShell
- Fase 5 ⏳ Failback controlado

## Fase 0 — Evidencia
- Gateway systemd running en WSL (`openclaw-gateway.service`)
- `/health` actual devuelve HTTP 200
- Workspace crítico en `~/.openclaw/workspace`

## Fase 1 — Evidencia
- Base: `/mnt/d/AtlasVault`
- Estructura: identity, manifests, snapshots, logs, secrets, standby, policies
- Logs: `audit.log`, `witness.log`
- RBAC scaffold: `policies/roles.json`

## Fase 2 — Scripts
- `/root/openclaw-monitor/atlas-snapshot.sh`
- `/root/openclaw-monitor/atlas-validate-snapshot.sh`

### Gates anti-corrupción implementados
1. `manifest.json` presente y JSON válido
2. checksum SHA256 del snapshot coincide
3. `config_import_policy=template_only` (no importar `openclaw.json` crudo)
4. sanity checks de repos + package/lockfiles
5. promoción a `last-known-good.json` solo si todo pasa

### Auditoría
- Append en: `/mnt/d/AtlasVault/logs/audit.log`

## Riesgos y mitigaciones (actual)
- Riesgo: permisos POSIX limitados en `/mnt/d` (NTFS)
  - Mitigación: reforzar ACL Windows en Fase 4
- Riesgo: snapshot sin DB volumes en fase inicial
  - Mitigación: añadir backup de volúmenes en fase posterior

## Runbook (preview)
- Failover: witness detecta 3 fallos → levanta standby → restaura LKG → valida `/health`
- Failback: manual, con ventana controlada y reconciliación git
