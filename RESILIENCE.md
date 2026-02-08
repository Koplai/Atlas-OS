# RESILIENCE.md - Atlas Ops Resilience Stack

## ✅ Implementado

### 1. **Memoria Local (Sin dependencias externas)**
- **Embeddings:** Ollama API local (nomic-embed-text, 768 dims)
- **Vector DB:** SQLite + sqlite-vec
- **Búsqueda:** Híbrida (vector 70% + BM25 30%)
- **Sincronización:** automática + watch + lazy
- **Cache:** embeddings persistentes (10k max)
- **Fallback:** ninguno (100% local)
- **Status:** ✅ Operativo desde 2026-02-08 15:00

### 2. **Model Fallbacks (Ollama → OpenRouter)**
- **Atlas (llama3.2:3b)** → openrouter/claude-sonnet-4.5
- **Backend (deepseek-r1:32b)** → openrouter/claude-sonnet-4.5
- **DevOps (llama3.2:3b)** → openrouter/claude-sonnet-4.5
- **Security (llama3.2:3b)** → openrouter/claude-sonnet-4.5
- **Data-AI (deepseek-r1:32b)** → openrouter/claude-sonnet-4.5
- **Trigger:** automático al fallo de Ollama
- **Status:** ✅ Configurado desde 2026-02-08 15:07

### 3. **Health Check Ollama**
- **Script:** `scripts/health-check-ollama.sh`
- **Checks:** API `/api/tags` + embeddings `/v1/embeddings`
- **Auto-restart:** `--fix` flag reinicia Ollama via systemd
- **Timeout:** 3 segundos
- **Status:** ✅ Implementado + testeado

### 4. **Restart Protocol**
- **Pre-restart:** Checkpoint en `memory/state-checkpoint.json`
- **Notificación:** Aviso explícito antes de restart
- **Post-restart:** Recuperación de contexto automática
- **Log:** Incidentes en `memory/incidents.md`
- **Status:** ✅ Documentado en `SOUL.md`

---

### 5. **Watchdog para Sesiones Bloqueadas**
- **Script:** `scripts/watchdog-sessions.sh`
- **Checks:** Último heartbeat, memoria del proceso gateway
- **Trigger:** Si >15min sin heartbeat → restart gateway
- **Alertas:** Telegram vía wake API
- **Systemd Timer:** `openclaw-watchdog.timer` (cada 5min, independiente de gateway)
- **Log:** Incidentes en `memory/incidents.md`
- **Status:** ✅ Implementado desde 2026-02-08 15:09, mejorado 15:13 (systemd timer)

### 6. **Gateway Auto-Restart (Systemd)**
- **Unit:** `openclaw-gateway.service` (user mode)
- **Config:** `Restart=always`, `RestartSec=5`
- **Status:** ✅ Ya configurado (restart counter: 63+)
- **Verificación:** `systemctl --user status openclaw-gateway`

### 7. **Circuit Breaker por Provider**
- **Script:** `scripts/circuit-breaker-check.sh`
- **Estado:** `scripts/circuit-breaker-state.json`
- **Umbral:** 3 fallos consecutivos → abrir circuit
- **Timeout:** 5 min en estado abierto → half-open (1 retry)
- **Providers:** ollama, openrouter
- **Actions:** check-state, record-success, record-failure
- **Status:** ✅ Implementado 2026-02-08 15:13

### 8. **Health Endpoint HTTP**
- **Script:** `scripts/health-endpoint.sh`
- **Checks:** Gateway systemd, Ollama API, memoria DB, circuit breakers
- **Output:** JSON con status (healthy/degraded/unhealthy)
- **Usage:** `cd scripts && ./health-endpoint.sh`
- **Status:** ✅ Implementado 2026-02-08 15:13

---

## ⚠️ Pendientes

### 9. **Métricas Centralizadas (Prometheus)**
- **Objetivo:** Pausar provider tras N fallos consecutivos
- **Implementación:** Contador de fallos + cooldown
- **Fallback:** Switch automático a siguiente provider
- **Prioridad:** Media

### 8. **Monitoreo de Recursos**
- **Checks:** Disco, RAM, CPU
- **Alertas:** Notificación vía Telegram si >80%
- **Auto-remediation:** Cleanup de logs/cache
- **Prioridad:** Media

### 9. **Network Resilience**
- **Detección:** Ping a OpenRouter/servicios externos
- **Fallback:** Switch proactivo a local si red cae
- **Prioridad:** Baja

---

## 🔧 Scripts de Mantenimiento

### Health Check Manual
```bash
/root/.openclaw/workspace/scripts/health-check-ollama.sh
```

### Auto-restart Ollama
```bash
/root/.openclaw/workspace/scripts/health-check-ollama.sh --fix
```

### Verificar Gateway Status
```bash
systemctl status openclaw-gateway  # Si existe
```

---

## 📊 Métricas de Resiliencia

**Target SLA:**
- **Uptime:** >99% (max 7h downtime/mes)
- **Response time:** <5s (local), <15s (fallback)
- **Auto-recovery:** <60s tras fallo

**Tracking:** Ver `memory/incidents.md` para historial.
