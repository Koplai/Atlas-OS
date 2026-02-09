#!/usr/bin/env bash
set -euo pipefail

VAULT="/vault"
PTR="$VAULT/manifests/LATEST_GOOD"
LKG_DEFAULT="$VAULT/manifests/last-known-good.json"
TARGET="/standby-workspace"
LOG="$VAULT/logs/audit.log"

mkdir -p "$TARGET"

if [[ -f "$PTR" ]]; then
  LKG="$VAULT/manifests/$(cat "$PTR")"
else
  LKG="$LKG_DEFAULT"
fi

if [[ ! -f "$LKG" ]]; then
  echo "LKG missing: $LKG" >&2
  exit 1
fi

SNAP_PATH_RAW=$(python3 - <<PY
import json
m=json.load(open('$LKG','r',encoding='utf-8'))
print(m['snapshot_path'])
PY
)
SHA_EXPECTED=$(python3 - <<PY
import json
m=json.load(open('$LKG','r',encoding='utf-8'))
print(m['snapshot_sha256'])
PY
)

# Translate WSL host path to container-mounted vault path
SNAP_PATH="${SNAP_PATH_RAW/#\/mnt\/d\/AtlasVault/\/vault}"
[[ -f "$SNAP_PATH" ]] || { echo "snapshot missing: $SNAP_PATH" >&2; exit 1; }
SHA_REAL=$(sha256sum "$SNAP_PATH" | awk '{print $1}')
[[ "$SHA_EXPECTED" == "$SHA_REAL" ]] || { echo "sha mismatch" >&2; exit 1; }

rm -rf "$TARGET"/*
python3 - <<PY
import tarfile
snap='$SNAP_PATH'
target='$TARGET'
with tarfile.open(snap, 'r:gz') as tf:
    tf.extractall(path=target)
print('extract_ok')
PY

printf '%s | PHASE3 | standby restore LKG | snapshot=%s | sha=%s\n' "$(date -Iseconds)" "$(basename "$SNAP_PATH")" "$SHA_REAL" >> "$LOG"

echo "RESTORE_OK"
