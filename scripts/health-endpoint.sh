#!/usr/bin/env bash
# Health endpoint HTTP proxy para gateway
# Responde con JSON: {status, checks, timestamp}

set -euo pipefail

# Checks
checks=()
overall_status="healthy"

# 1. Gateway está corriendo
if systemctl --user is-active openclaw-gateway >/dev/null 2>&1; then
  checks+=("\"gateway\": {\"status\": \"ok\", \"message\": \"systemd active\"}")
else
  checks+=("\"gateway\": {\"status\": \"critical\", \"message\": \"systemd not active\"}")
  overall_status="unhealthy"
fi

# 2. Ollama respondiendo
if curl -sf --max-time 2 http://localhost:11434/api/tags >/dev/null 2>&1; then
  checks+=("\"ollama\": {\"status\": \"ok\", \"message\": \"api responsive\"}")
else
  checks+=("\"ollama\": {\"status\": \"degraded\", \"message\": \"api not responding\"}")
  overall_status="degraded"
fi

# 3. Memoria SQLite accesible
if [[ -f "/root/.openclaw/memory/atlas.sqlite" ]]; then
  checks+=("\"memory\": {\"status\": \"ok\", \"message\": \"db file exists\"}")
else
  checks+=("\"memory\": {\"status\": \"warning\", \"message\": \"db not found\"}")
fi

# 4. Circuit breakers
ollama_circuit=$(./circuit-breaker-check.sh ollama check-state 2>/dev/null || echo "unknown")
if [[ "$ollama_circuit" == "open" ]]; then
  overall_status="degraded"
fi
checks+=("\"circuit_breaker_ollama\": {\"status\": \"$ollama_circuit\"}")

# Output JSON
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{"
echo "  \"status\": \"$overall_status\","
echo "  \"timestamp\": \"$timestamp\","
echo "  \"checks\": {"
echo "    $(IFS=,; echo "${checks[*]}")"
echo "  }"
echo "}"
