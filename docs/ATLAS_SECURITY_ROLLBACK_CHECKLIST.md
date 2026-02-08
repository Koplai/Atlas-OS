# Atlas OS — Checklist de seguridad y rollback (MCP + Ops)

Fecha: 2026-02-08

## Antes de desplegar
- [ ] `npm run build` verde
- [ ] Verificar que `/api/mcp/status` responde
- [ ] Verificar que `/api/ops/checks` incluye check MCP
- [ ] Confirmar `MCP_SERVERS_JSON` válido

## Seguridad (runtime)
- [ ] Servers MCP en allowlist
- [ ] `allowedTools` mínimos por principio de menor privilegio
- [ ] `timeoutMs` <= 30s por server
- [ ] rate limit activo en `/api/mcp/invoke`
- [ ] tokens/API protegidos por middleware

## Rollback rápido
1. Desactivar server MCP en configuración (`enabled=false`) o vaciar `MCP_SERVERS_JSON`.
2. Revert del último commit de milestone:
   - `git revert <sha>`
3. Validar:
   - `/ops` operativo
   - `/agents/report` operativo
4. Registrar incidente y causa raíz en docs/memory.
