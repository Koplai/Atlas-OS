# WSL-RUNBOOK (Atlas-OS)

Objetivo: que, si WSL/OpenClaw se cae, podamos recuperar contexto y retomar el dashboard sin pérdida.

## 0) Señales típicas de fallo
- Cortes de canal (WhatsApp/Telegram reconecta)
- Respuestas tardías o silencios
- Gateway UI deja de responder en http://127.0.0.1:18789

## 1) Checklist de recuperación (rápido)
1. Verificar gateway:
   - `openclaw status --deep`
   - Confirmar canales: WhatsApp/Telegram = OK
2. Verificar puertos:
   - `ss -ltnup | egrep '18789|11434|3000|5432'`
3. Verificar Ollama:
   - `curl -sS http://127.0.0.1:11434/api/tags | head`
4. Verificar dashboard:
   - `cd /root/.openclaw/workspace/dashboard/atlas-dashboard`
   - `npm run lint` y `npm run build`
5. Verificar Git:
   - `cd /root/.openclaw/workspace && git status -sb`

## 2) Evitar pérdida de trabajo
- Antes de cambios grandes: `git status -sb` y commit pequeño.
- Secrets: guardar en `.secrets/` (ignorado por git).
- No subir `memory/*` al repo.

## 3) Checkpoint manual (cuando notes inestabilidad)
- Crear/actualizar `memory/state-checkpoint.json` con:
  - qué estabas haciendo
  - qué archivo tocabas
  - siguiente paso

## 4) Notas de CI
- Si CI falla: primero correr `npm run lint` en `dashboard/atlas-dashboard`.

## 5) Integración n8n
- URL: https://flow.jpmarquez.com
- Se preparó workflow "LTM-Qdrant-Bridge" para importar/activar desde UI.
- Siguiente paso: auditar flujos existentes y proponer nuevos (ver backlog en PM).
