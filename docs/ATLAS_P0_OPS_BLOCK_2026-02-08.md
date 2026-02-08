# Atlas OS — Bloque P0 Operativo (2026-02-08)

## Objetivo del bloque
Implementar capacidades **operativas accionables desde UI** (no solo observabilidad):
- Run checks
- Restart-safe
- Navegación consistente entre Ops/Logs
- QA básico + notas de operación

## Cambios implementados

### 1) Acciones operativas desde UI
- Nueva pantalla funcional en `/ops` con `OpsControlCenter`:
  - **Run checks** (POST `/api/ops/checks`)
  - **Restart safe** (POST `/api/ops/restart-safe`)
- Resultado visible en UI (estado, detalle y duración).

### 2) Nuevos endpoints API
- `POST /api/ops/checks`
  - Verifica gateway OpenClaw (`openclaw gateway status`)
  - Verifica DB (`SELECT 1`)
  - Calcula conteo de errores de severidad alta en logs (`ERROR`, `SECURITY`)
- `POST /api/ops/restart-safe`
  - Evalúa estado del gateway
  - Si parece detenido/inactivo: `openclaw gateway start`
  - Si está activo: `openclaw gateway restart`
  - Retorna salida truncada + estado final

### 3) Navegación consistente
- `/logs` añade acceso claro de regreso a `/ops`.
- Sidebar actualiza label `/agents/report` a **Agents**.
- Header principal diferencia **Agents Report** cuando aplica.

### 4) Base técnica
- `lib/exec.ts` ampliado con wrappers explícitos:
  - `runOpenClawGatewayStatus`
  - `runOpenClawGatewayRestart`
  - `runOpenClawGatewayStart`

## QA ejecutado (manual + build)
1. `npm run build`
2. Navegación:
   - `/ops` carga y permite ejecutar acciones.
   - `/logs` accesible desde `/ops` y retorno funcionando.
3. API:
   - `/api/ops/checks` responde JSON con checks y duración.
   - `/api/ops/restart-safe` responde resultado/errores de operación.

## Notas de seguridad operativa
- Sin shell interpolado; comandos allowlisted vía `execFile`.
- Salida truncada para evitar payloads excesivos y fugas accidentales.
- `restart-safe` evita asumir restart siempre; intenta start cuando detecta estado caído.

## Qué queda para siguiente bloque P0
1. Botón de **tail de logs en vivo** (stream/long-poll) desde Ops.
2. Run checks con matriz más completa (latencia, dependencia STT, sesiones activas, drift de errores por ventana temporal).
3. Guardrail adicional de restart:
   - cooldown por operador
   - lock para evitar doble ejecución simultánea.
4. Tests de integración API (`ops/checks`, `ops/restart-safe`) en CI.
5. Registrar auditoría operativa de acciones (quién/qué/cuándo) en `LogEntry`.
