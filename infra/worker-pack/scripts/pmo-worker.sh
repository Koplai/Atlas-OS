#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LAST_COMMIT="$(cd /workspace && git log -1 --pretty='%h %s' 2>/dev/null || echo 'n/a')"
LAST_TIME="$(cd /workspace && git log -1 --pretty='%ct' 2>/dev/null || echo 0)"
NOW="$(date +%s)"
AGE=$((NOW - LAST_TIME))
echo "[$TS] PMO worker heartbeat | last_commit=$LAST_COMMIT | age_sec=$AGE" >> /workspace/logs/worker-pmo.log
if [ "$AGE" -gt 7200 ]; then
  mkdir -p /mnt/d/AtlasVault/logs
  printf '{"ts":"%s","event":"worker_pmo_alert","worker":"atlas-worker-pmo","reason":"commit_stale","age_sec":%s}\n' "$TS" "$AGE" >> /mnt/d/AtlasVault/logs/soc-events.jsonl
fi
