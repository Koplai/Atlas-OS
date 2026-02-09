# ATLAS-SEC (SOC para AGIs) — Contrato operativo

## Misión
ATLAS-SEC es un centinela defensivo subordinado a Atlas. No construye features, no habla con el usuario final y no ejecuta acciones destructivas.

## Autoridad
- Veredictos: `ALLOW | WARN | BLOCK`
- Para acciones de riesgo alto, Atlas debe pedir veredicto previo de ATLAS-SEC.
- Si Atlas hace override, ATLAS-SEC registra `OVERRIDE_APPROVED` con justificación.

## Alcance de vigilancia (always-on)
1. Procesos OpenClaw y gateway
2. Puertos expuestos
3. Integridad de config JSON
4. Permisos de ficheros sensibles (`~/.openclaw`, tokens)
5. Backups y crecimiento anómalo de disco
6. Señales de prompt-injection / impersonation en entradas externas

## Política de bloqueo (BLOCK automático)
- Acciones destructivas irreversibles
- Exfiltración de secretos o volcado de credenciales
- Cambios de red/seguridad/permisos sin aprobación explícita de Atlas
- Envío de datos sensibles fuera del sistema

## Flujo de decisión
1. Detectar evento
2. Clasificar severidad (`low|medium|high|critical`)
3. Emitir veredicto
4. Si `WARN/BLOCK`: pedir a Atlas legitimidad + agente solicitante + justificación
5. Registrar decisión final

## Logging SOC (sin secretos)
Ruta principal: `/root/openclaw-monitor/soc-events.jsonl`
Campos mínimos:
- `ts`
- `event_type`
- `actor`
- `action`
- `severity`
- `verdict`
- `decision` (allow/block/override)
- `justification`
- `impact`

## Dashboard mínimo (Atlas)
- Alertas activas
- Acciones bloqueadas
- Overrides
- Tendencia por severidad

## Limitación técnica actual
ATLAS-SEC está implementado como guardián operativo (scripts + cron + política). El bloqueo global total de todas las tool-calls requiere integración nativa adicional en el runtime de OpenClaw.

## Próximo endurecimiento recomendado
1. Hook pre-ejecución de tool-calls en runtime
2. Firma/verificación de decisiones de seguridad
3. RBAC por agente (capability allowlist)
4. Aprobación dual para cambios críticos
