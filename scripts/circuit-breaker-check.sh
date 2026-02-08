#!/usr/bin/env bash
# Circuit breaker para providers (Ollama, OpenRouter)
# Usage: ./circuit-breaker-check.sh <provider> <action>
# Actions: check-state, record-success, record-failure

set -euo pipefail

STATE_FILE="/root/.openclaw/workspace/scripts/circuit-breaker-state.json"
PROVIDER="${1:-}"
ACTION="${2:-check-state}"

if [[ -z "$PROVIDER" ]]; then
  echo "Usage: $0 <provider> [check-state|record-success|record-failure]"
  exit 1
fi

# Leer estado actual
STATE=$(cat "$STATE_FILE")
CURRENT_STATE=$(echo "$STATE" | jq -r ".providers.\"$PROVIDER\".state // \"closed\"")
FAILURES=$(echo "$STATE" | jq -r ".providers.\"$PROVIDER\".failures // 0")
THRESHOLD=$(echo "$STATE" | jq -r ".config.failureThreshold")
TIMEOUT_MS=$(echo "$STATE" | jq -r ".config.timeoutMs")
OPENED_AT=$(echo "$STATE" | jq -r ".providers.\"$PROVIDER\".openedAtMs // 0")
NOW_MS=$(date +%s)000

case "$ACTION" in
  check-state)
    # Si está abierto, verificar si pasó el timeout
    if [[ "$CURRENT_STATE" == "open" ]]; then
      if [[ $((NOW_MS - OPENED_AT)) -gt $TIMEOUT_MS ]]; then
        # Cambiar a half-open (permitir 1 intento)
        echo "$STATE" | jq ".providers.\"$PROVIDER\".state = \"half-open\"" > "$STATE_FILE"
        echo "half-open"
        exit 0
      fi
      echo "open"
      exit 1
    fi
    echo "$CURRENT_STATE"
    ;;
    
  record-success)
    # Resetear contador + cerrar circuit
    echo "$STATE" | jq ".providers.\"$PROVIDER\" |= {state: \"closed\", failures: 0, lastSuccessMs: $NOW_MS, lastFailureMs: .lastFailureMs, openedAtMs: 0}" > "$STATE_FILE"
    echo "✅ Circuit closed para $PROVIDER"
    ;;
    
  record-failure)
    NEW_FAILURES=$((FAILURES + 1))
    
    if [[ $NEW_FAILURES -ge $THRESHOLD ]]; then
      # Abrir circuit
      echo "$STATE" | jq ".providers.\"$PROVIDER\" |= {state: \"open\", failures: $NEW_FAILURES, lastFailureMs: $NOW_MS, lastSuccessMs: .lastSuccessMs, openedAtMs: $NOW_MS}" > "$STATE_FILE"
      echo "🔴 Circuit ABIERTO para $PROVIDER (${NEW_FAILURES} fallos)"
      exit 1
    else
      # Incrementar contador
      echo "$STATE" | jq ".providers.\"$PROVIDER\" |= {state: \"closed\", failures: $NEW_FAILURES, lastFailureMs: $NOW_MS, lastSuccessMs: .lastSuccessMs, openedAtMs: 0}" > "$STATE_FILE"
      echo "⚠️ Fallo registrado para $PROVIDER (${NEW_FAILURES}/${THRESHOLD})"
    fi
    ;;
    
  *)
    echo "Acción inválida: $ACTION"
    exit 1
    ;;
esac
