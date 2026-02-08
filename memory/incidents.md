# Incidents Log

## 2026-02-08 14:55 GMT+1
**Tipo:** Reinicio inesperado / Falta de handoff  
**Causa:** `config.patch` aplicado sin checkpoint previo ni notificación  
**Síntoma:** Terminal cerrada, usuario tuvo que reiniciar manualmente  
**Solución aplicada:**
- Renombrado agente `pm` → `atlas` para coincidir con `IDENTITY.md`
- Añadido protocolo anti-bloqueo en `SOUL.md`
- Creado `memory/incidents.md` para tracking permanente

**Acción preventiva:**
- Checkpoint obligatorio antes de restart
- Notificación explícita al usuario antes de cambios críticos
- Recuperación automática de contexto tras restart
