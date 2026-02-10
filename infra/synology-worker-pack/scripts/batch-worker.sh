#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[$TS] SYNO BATCH worker heartbeat | role=batch-exec" >> /workspace/logs/syno-worker-batch.log
