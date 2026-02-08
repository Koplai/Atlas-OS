# Local LLM Stability Runbook (anti `doctor fix` manual)

## Síntoma
El modo local falla y obliga a ejecutar `doctor fix` manualmente.

## Objetivo
Auto-recuperación: detectar fallo, reparar, reintentar, fallback automático.

## Checklist técnico
1. Healthcheck periódico de:
   - gateway
   - ollama API
   - modelo principal disponible
2. Warmup al arrancar:
   - ping al modelo local (`llama3.2:3b`)
3. Retries con backoff en llamadas locales (3 intentos)
4. Circuit breaker:
   - abre tras 3 fallos consecutivos
   - cooldown 5 min
5. Fallback automático cloud cuando breaker abierto
6. Autoheal:
   - reinicio controlado de servicio dependiente
7. Alertas:
   - notificar cuando entra/sale de modo degradado

## Operación recomendada
- Default: local-first
- Si health rojo > 2 ciclos: cloud-first temporal
- Recuperar local cuando health verde estable por 10+ minutos

## KPIs
- % turns servidos por local
- MTTR de fallo local
- # intervenciones manuales por día (objetivo: 0)
