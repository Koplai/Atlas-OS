#!/usr/bin/env bash
set -euo pipefail

VAULT="/mnt/d/AtlasVault"
OUTDIR="$VAULT/snapshots/qdrant"
LOG="$VAULT/logs/audit.log"
TS="$(date +"%Y%m%d-%H%M%S")"
SNAP_NAME="atlas_memory-$TS"
COL="atlas_memory"
QDRANT="http://127.0.0.1:6333"

mkdir -p "$OUTDIR"

# Create snapshot in Qdrant
curl -sS -X POST "$QDRANT/collections/$COL/snapshots" -H 'Content-Type: application/json' > /tmp/qdrant_snap_resp.json
SNAP_FILE=$(python3 - <<'PY'
import json
j=json.load(open('/tmp/qdrant_snap_resp.json'))
# compatible with different response wrappers
if isinstance(j, dict):
    r=j.get('result',{})
    if isinstance(r,dict) and 'name' in r:
        print(r['name'])
    elif 'name' in j:
        print(j['name'])
PY
)

[[ -n "${SNAP_FILE:-}" ]] || { echo "snapshot_name_missing"; exit 1; }

# Download snapshot
curl -sS "$QDRANT/collections/$COL/snapshots/$SNAP_FILE" -o "$OUTDIR/$SNAP_FILE"
SHA=$(sha256sum "$OUTDIR/$SNAP_FILE" | awk '{print $1}')

printf '%s | QDRANT_BACKUP | file=%s | sha=%s\n' "$(date -Iseconds)" "$SNAP_FILE" "$SHA" >> "$LOG"

echo "QDRANT_BACKUP_OK $OUTDIR/$SNAP_FILE"
