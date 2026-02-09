#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-}"
COL="${2:-atlas_memory}"
QDRANT="http://127.0.0.1:6333"

[[ -n "$FILE" ]] || { echo "usage: $0 <snapshot_file> [collection]"; exit 2; }
[[ -f "$FILE" ]] || { echo "file_not_found: $FILE"; exit 1; }

# upload snapshot for recovery
curl -sS -X POST "$QDRANT/collections/$COL/snapshots/upload" -F "snapshot=@$FILE" > /tmp/qdrant_restore_resp.json

echo "QDRANT_RESTORE_SUBMITTED"
cat /tmp/qdrant_restore_resp.json
