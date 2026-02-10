#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OPEN_HIGH=$(ss -ltn 2>/dev/null | awk 'NR>1{print $4}' | egrep '(:18789|:3000|:5678|:6333|:8188)$' || true)
COUNT=$(printf '%s\n' "$OPEN_HIGH" | sed '/^$/d' | wc -l | tr -d ' ')
echo "[$TS] SEC worker heartbeat | high_risk_listeners=$COUNT" >> /workspace/logs/worker-sec.log
if [ "$COUNT" != "0" ]; then
  mkdir -p /mnt/d/AtlasVault/logs
  printf '{"ts":"%s","event":"worker_sec_alert","worker":"atlas-worker-sec","reason":"high_risk_listener_detected","count":%s}\n' "$TS" "$COUNT" >> /mnt/d/AtlasVault/logs/soc-events.jsonl
fi
