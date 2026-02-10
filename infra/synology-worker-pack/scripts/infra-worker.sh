#!/usr/bin/env bash
set -euo pipefail
mkdir -p /workspace/logs
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[$TS] SYNO INFRA worker heartbeat | role=infra-exec" >> /workspace/logs/syno-worker-infra.log
