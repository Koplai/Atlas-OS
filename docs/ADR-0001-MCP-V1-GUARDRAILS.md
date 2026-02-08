# ADR-0001 — MCP v1 con guardrails estrictos

Fecha: 2026-02-08
Estado: Aprobado

## Contexto
Atlas OS necesita integrar MCP de forma operativa sin abrir superficie de riesgo innecesaria.

## Decisión
Implementar MCP v1 con:
- Config declarativa por `MCP_SERVERS_JSON`.
- Cliente MCP interno con allowlist por `serverId`.
- Control de permisos por `allowedTools`.
- Timeout obligatorio por servidor.
- Endpoints explícitos (`/api/mcp/status`, `/api/mcp/invoke`).

## Consecuencias
### Positivas
- Reducción fuerte de riesgo por invocaciones arbitrarias.
- Visibilidad operativa en Ops y Agents.
- Base simple para evolucionar a aprobación de acciones sensibles (P1).

### Negativas
- Integración inicial restringida (solo tools permitidos explícitamente).
- Requiere mantenimiento de `allowedTools` por servidor.

## Alternativas consideradas
1. Proxy MCP genérico sin allowlist → rechazado por riesgo.
2. Solo healthcheck sin invoke → insuficiente para operación real.
