#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OPEN="$(ss -ltn 2>/dev/null | awk 'NR>1{print $4}' | wc -l | tr -d ' ')"
echo "[$TS] SEC worker heartbeat | listening_tcp=$OPEN" >> /workspace/logs/worker-sec.log
