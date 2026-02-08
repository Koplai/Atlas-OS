# Atlas OS MCP Runbook (v1)

Fecha: 2026-02-08

## Objetivo
Operar MCP en Atlas OS con guardrails fuertes y visibilidad operativa en UI.

## Configuración
La configuración se define por `MCP_SERVERS_JSON` (array JSON). Si no existe, se usa un servidor local por defecto.

Ejemplo:

```json
[
  {
    "id": "atlas-local",
    "label": "Atlas Local MCP",
    "baseUrl": "http://127.0.0.1:3920",
    "healthPath": "/health",
    "invokePath": "/mcp/invoke",
    "enabled": true,
    "timeoutMs": 3000,
    "allowedTools": ["status.ping", "logs.query", "ops.checks"]
  }
]
```

## Guardrails activos
1. **Allowlist de servers**: solo `serverId` configurados.
2. **Permisos por tool**: `toolName` debe existir en `allowedTools` del server.
3. **Timeout por server**: cada request usa `AbortSignal.timeout(timeoutMs)`.
4. **Rate limit invoke**: `/api/mcp/invoke` limitado por IP.
5. **Payloads acotados**: salida de invocación truncada.

## Endpoints
- `GET /api/mcp/status`
  - Estado de conectividad por server, latencia y resumen online.
- `POST /api/mcp/invoke`
  - Invocación de tool con validaciones de seguridad.

### Request invoke
```json
{
  "serverId": "atlas-local",
  "toolName": "status.ping",
  "args": {"echo": "ok"}
}
```

## UI
- **Ops**: panel MCP v1 con estado por server.
- **Agents Report**: tarjeta de salud MCP (online/enabled).

## Troubleshooting rápido
1. Si MCP aparece OFFLINE en Ops:
   - Validar `baseUrl` y reachability desde host del dashboard.
   - Revisar timeout (`timeoutMs`) y latencia real.
2. Si `MCP_TOOL_NOT_ALLOWED`:
   - Añadir tool al `allowedTools` del server en `MCP_SERVERS_JSON`.
3. Si `MCP_SERVER_NOT_ALLOWED`:
   - Verificar `id` exacto en configuración.
