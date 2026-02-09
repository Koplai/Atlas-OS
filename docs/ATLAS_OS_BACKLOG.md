# Atlas OS Backlog (prioridad activa)

Fecha: 2026-02-08
Owner: Atlas

## Objetivo para mañana
Tener integrado en Atlas OS un bloque funcional inicial de MCP + operación desde UI, manteniendo estabilidad y documentación.

## P0 (mañana)
1. Integración MCP v1 en Atlas OS (cliente MCP) ✅ *Milestone 1*
   - Config base de servidores MCP permitidos ✅
   - UI de estado/conectividad MCP en Ops/Agents ✅
   - Guardrails: allowlist, permisos por tool, timeout ✅

2. Operación accionable desde Atlas OS ✅ *Milestone 2*
   - Ejecutar acciones clave desde UI (checks/restart/logs) ✅
   - Validar fallback y error handling robusto ✅

3. Observabilidad operativa
   - Mostrar jobs activos/en cola/finalizados
   - Visibilidad por agente + runtime local/cloud + degradación

4. Documentación obligatoria
   - Runbook de MCP
   - Decisiones arquitectónicas
   - Checklist de seguridad y rollback

## P1 (siguiente bloque)
- Aprobaciones para acciones sensibles
- Mission Inbox (failed/blocked/security)
- Mobile quick actions
- Cost tracker en Atlas OS (tokens/coste por sesión, por agente y agregado diario/semanal)
- Panel de gobernanza visible en Atlas OS: agentes/subagentes activos, modelo por agente (local/cloud), coste actual, estado ATLAS-SEC/ATLAS-GRC, configuración efectiva (USER.md/SOUL.md/policies activas) con auditoría de cambios
- DR Control Center en Atlas OS: estado primary/standby, botón de failover manual auditado (dry-run + execute), health checks y evidencia de pruebas
- Architecture Docs Hub en Atlas OS: documentación de arquitectura del sistema, runbooks, ADRs, mapas de dependencias y estado de versión

## P1.5 Estabilidad de operación continua
- Protocolo "Safe Model Switch" para evitar bloqueos al alternar local/cloud (prechecks, cambio controlado, rollback automático).
- Mecanismo de continuidad de contexto: checkpoint + resumen automático + traspaso limpio de sesión cuando contexto >75%.

## P2 / Ideas de crecimiento (no prioritario ahora)
- Módulo de generación de contenido visual para marketing (imágenes y vídeo) orientado a monetización.
  - **Propósito:** crear activos para crecer audiencia y generar ingresos (ej. TikTok/shorts de influencers IA, creatividades de campañas, assets de marca).
  - **Razón de negocio:** evitar perder ideas habladas en chat y convertirlas en backlog accionable con trazabilidad.
  - **Líneas futuras:** pipeline ComfyUI + plantillas + automatización de publicación + medición de rendimiento por pieza.

## Criterios de aceptación (DoD)
- Build verde
- Rutas funcionales
- Flujo mínimo MCP visible y verificable
- Cambios documentados en docs/
- Commit + push por milestone
