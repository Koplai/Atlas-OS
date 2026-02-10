#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LAST_COMMIT="$(cd /workspace && git log -1 --pretty='%h %s' 2>/dev/null || echo 'n/a')"
echo "[$TS] PMO worker heartbeat | last_commit=$LAST_COMMIT" >> /workspace/logs/worker-pmo.log
