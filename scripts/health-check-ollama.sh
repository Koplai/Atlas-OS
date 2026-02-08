#!/usr/bin/env bash
# Health check para Ollama + auto-restart si está caído
# Usage: ./health-check-ollama.sh [--fix]

set -euo pipefail

OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
TIMEOUT=3
FIX_MODE=false

if [[ "${1:-}" == "--fix" ]]; then
  FIX_MODE=true
fi

# Test API availability
if ! curl -sf --max-time "$TIMEOUT" "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  echo "❌ Ollama API no responde en $OLLAMA_URL"
  
  if [[ "$FIX_MODE" == true ]]; then
    echo "🔧 Intentando reiniciar Ollama..."
    if sudo systemctl restart ollama; then
      echo "✅ Ollama reiniciado"
      sleep 2
      if curl -sf --max-time "$TIMEOUT" "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
        echo "✅ Ollama responde tras reinicio"
        exit 0
      else
        echo "❌ Ollama sigue sin responder tras reinicio"
        exit 1
      fi
    else
      echo "❌ Fallo al reiniciar Ollama"
      exit 1
    fi
  fi
  
  exit 1
fi

# Test embeddings endpoint
if ! curl -sf --max-time "$TIMEOUT" "$OLLAMA_URL/v1/embeddings" \
  -H "Content-Type: application/json" \
  -d '{"model":"nomic-embed-text","input":"test"}' >/dev/null 2>&1; then
  echo "❌ Ollama embeddings endpoint no responde"
  exit 1
fi

echo "✅ Ollama funcionando correctamente"
exit 0
