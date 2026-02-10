#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
if [ -f /workspace/docs/shopify-seo-squad-ruta-a.md ]; then
  HASH="$(sha256sum /workspace/docs/shopify-seo-squad-ruta-a.md | awk '{print $1}')"
else
  HASH="missing"
fi
echo "[$TS] SEO worker heartbeat | seo_plan_hash=$HASH" >> /workspace/logs/worker-seo.log
