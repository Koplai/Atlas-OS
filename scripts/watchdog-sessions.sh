#!/usr/bin/env bash
# Watchdog para detectar sesiones bloqueadas de OpenClaw
# Verifica heartbeats y reinicia si no hay actividad

set -euo pipefail

GATEWAY_PID_FILE="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/gateway.pid"
HEARTBEAT_STATE="/root/.openclaw/workspace/memory/heartbeat-state.json"
MAX_IDLE_MINUTES="${WATCHDOG_MAX_IDLE_MINUTES:-15}"
ALERT_TELEGRAM="${WATCHDOG_ALERT_TELEGRAM:-true}"
TELEGRAM_CHAT_ID="${WATCHDOG_TELEGRAM_CHAT_ID:-8037198353}"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

alert() {
  local msg="$1"
  log "⚠️ ALERT: $msg"
  
  if [[ "$ALERT_TELEGRAM" == "true" ]]; then
    # Enviar alerta vía mensaje al sistema (se ruteará a Telegram)
    curl -sf "http://localhost:18789/api/wake" \
      -H "Authorization: Bearer b6666657283a65392e052353b327445ad8578773673bbe20" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"🚨 WATCHDOG ALERT: $msg\",\"mode\":\"now\"}" >/dev/null 2>&1 || true
  fi
}

# Verificar si gateway está corriendo
if ! systemctl --user is-active openclaw-gateway >/dev/null 2>&1; then
  alert "Gateway no está activo - reiniciando"
  systemctl --user restart openclaw-gateway
  exit 0
fi

# Verificar último heartbeat
if [[ -f "$HEARTBEAT_STATE" ]]; then
  last_check=$(jq -r '.lastChecks.email // 0' "$HEARTBEAT_STATE" 2>/dev/null || echo 0)
  current_time=$(date +%s)
  idle_seconds=$((current_time - last_check))
  idle_minutes=$((idle_seconds / 60))
  
  if [[ $idle_minutes -gt $MAX_IDLE_MINUTES ]]; then
    alert "Sin heartbeats desde hace ${idle_minutes} minutos (límite: ${MAX_IDLE_MINUTES})"
    
    # Log incidente
    cat >> /root/.openclaw/workspace/memory/incidents.md <<EOF

## $(date +'%Y-%m-%d %H:%M GMT%z')
**Tipo:** Watchdog - Sesión bloqueada
**Idle time:** ${idle_minutes} minutos
**Acción:** Restart automático de gateway
EOF
    
    systemctl --user restart openclaw-gateway
    log "Gateway reiniciado por watchdog"
    exit 0
  else
    log "✅ Heartbeat OK (último: ${idle_minutes}m ago)"
  fi
else
  log "⚠️ Heartbeat state file no encontrado"
fi

# Verificar memoria del proceso gateway
if [[ -f "$GATEWAY_PID_FILE" ]]; then
  gateway_pid=$(cat "$GATEWAY_PID_FILE" 2>/dev/null || echo "")
  if [[ -n "$gateway_pid" ]] && [[ -d "/proc/$gateway_pid" ]]; then
    mem_mb=$(ps -p "$gateway_pid" -o rss= | awk '{print int($1/1024)}')
    
    # Alertar si memoria >2GB
    if [[ $mem_mb -gt 2048 ]]; then
      alert "Gateway usando ${mem_mb}MB de memoria (posible leak)"
    fi
    
    log "Gateway PID $gateway_pid usando ${mem_mb}MB RAM"
  fi
fi

log "Watchdog check completado OK"
exit 0
