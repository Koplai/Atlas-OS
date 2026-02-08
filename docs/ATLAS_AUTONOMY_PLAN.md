# ATLAS Autonomy Plan (v1)

## Objetivo
Operar Atlas-OS con mínima intervención manual: planificación, ejecución por agentes, validación, commit/push seguro, despliegue y reporte.

## Qué necesito de JPMarquez (una sola vez)
1. **Política de autonomía** (ON/OFF por área):
   - Código frontend/backend
   - Infra local (docker/systemd)
   - Config OpenClaw
   - Mensajería externa
2. **Ventana nocturna**: ejemplo 23:00–07:00 Europe/Madrid.
3. **Límites**:
   - Máx. N commits por noche
   - Máx. N pushes por noche
   - Sin cambios destructivos sin aprobación
4. **Regla de release**:
   - `main/master` directo o rama `nightly/*` + PR
5. **Presupuesto**: tope diario para ejecuciones nocturnas.

## Modo operativo recomendado
- **Durante el día**: cambios rápidos + validación visual.
- **Durante la noche**: ciclos autónomos de 45–90 min:
  1) seleccionar una tarea P0/P1,
  2) implementar,
  3) lint/build/tests,
  4) commit semántico,
  5) push,
  6) reporte de avance + bloqueos.

## Guardrails obligatorios
- Nunca tocar secretos.
- Nunca borrar datos/DB sin confirmación.
- Si falla build 2 veces seguidas: detener lote y reportar.
- Si falla modelo local: fallback automático a cloud, sin bloquear pipeline.

## Backlog prioritario actual
### P0
- UX premium chat-first (desktop+mobile real).
- Unificar rutas/naming de navegación (chat/projects/ops/logs).
- Estabilizar LLM local + autoheal sin depender de `doctor fix` manual.

### P1
- STT UX end-to-end en composer.
- Panel derecho opcional (drawer en tablet/mobile).
- PWA base (manifest/icons/SW).

### P2
- Integraciones avanzadas (n8n/comfy/qdrant observability).
- Métricas de uso/calidad y costes por agente.

## Definición de Done (DoD)
- Build verde
- UX usable en desktop + mobile
- Navegación funcional sin enlaces rotos
- Commit/push hecho
- Nota en changelog operativo
