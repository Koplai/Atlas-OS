#!/usr/bin/env bash
set -euo pipefail

VAULT="/vault"
DIR="$VAULT/snapshots/qdrant"
QDRANT="http://openclaw-dr-qdrant:6333"
COL="atlas_memory"
LOG="$VAULT/logs/audit.log"

LATEST=$(ls -t "$DIR"/*.snapshot 2>/dev/null | head -n 1 || true)
if [[ -z "$LATEST" ]]; then
  echo "no_qdrant_snapshot"
  exit 0
fi

curl -sS -X POST "$QDRANT/collections/$COL/snapshots/upload" -F "snapshot=@$LATEST" > /tmp/qdrant_restore_resp.json || true
printf '%s | PHASE-DR | qdrant restore attempted | file=%s\n' "$(date -Iseconds)" "$(basename "$LATEST")" >> "$LOG"

echo "QDRANT_RESTORE_ATTEMPTED $(basename "$LATEST")"
