# Atlas Worker Topology (actual)

## Objetivo
Definir dónde corre cada worker/agente y evitar duplicidad de roles innecesaria.

## Nodos

### Nodo principal (WSL / OpenClaw Core)
- Rol: control-plane (Atlas, decisiones, gobernanza, policy).
- Servicios críticos: gateway, coordinación PMO, seguridad/gobernanza, DR control.

### Nodo auxiliar (Docker Desktop Worker Pack)
Ubicación de compose:
- `infra/worker-pack/docker-compose.yml`

Workers activos:
- `atlas-worker-pmo`
  - Script: `infra/worker-pack/scripts/pmo-worker.sh`
  - Log: `logs/worker-pmo.log`
- `atlas-worker-sec`
  - Script: `infra/worker-pack/scripts/sec-worker.sh`
  - Log: `logs/worker-sec.log`
- `atlas-worker-seo`
  - Script: `infra/worker-pack/scripts/seo-worker.sh`
  - Log: `logs/worker-seo.log`

## Regla de unicidad de rol
- Por defecto: **1 agente por rol**.
- No se permite duplicar rol si no existe sobrecarga real.
- Se permite `role-replica` solo cuando:
  1. backlog crítico supera SLA,
  2. Atlas aprueba explícitamente,
  3. hay ETA y criterio de retiro de réplica.

## Política de escalado de role replicas
Para crear réplica de rol se requiere:
- motivo (bloqueo o throughput insuficiente),
- ventana temporal,
- owner responsable,
- métrica de éxito,
- rollback (desactivar réplica).

## Estado recomendado de roles
- PMO: 1
- Security: 1
- GRC: 1
- SEO: 1
- Atlas OS Dev: 1
- Infra: 1
- Réplicas: 0 por defecto
