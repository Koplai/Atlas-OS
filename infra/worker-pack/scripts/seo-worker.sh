#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
PLAN="/workspace/docs/shopify-seo-squad-ruta-a.md"
if [ -f "$PLAN" ]; then
  HASH="$(sha256sum "$PLAN" | awk '{print $1}')"
  AGE=$(( $(date +%s) - $(stat -c %Y "$PLAN") ))
else
  HASH="missing"
  AGE=-1
fi
echo "[$TS] SEO worker heartbeat | seo_plan_hash=$HASH | age_sec=$AGE" >> /workspace/logs/worker-seo.log
if [ "$AGE" -gt 86400 ]; then
  mkdir -p /mnt/d/AtlasVault/logs
  printf '{"ts":"%s","event":"worker_seo_alert","worker":"atlas-worker-seo","reason":"seo_plan_stale","age_sec":%s}\n' "$TS" "$AGE" >> /mnt/d/AtlasVault/logs/soc-events.jsonl
fi
