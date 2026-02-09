#!/usr/bin/env bash
set -euo pipefail

VAULT="/mnt/d/AtlasVault"
WS="/root/.openclaw/workspace"
TS="$(date +"%Y%m%d-%H%M%S")"
SNAP="$VAULT/snapshots/workspace-$TS.tar.gz"
MAN="$VAULT/manifests/manifest-$TS.json"
TMP_MAN="$VAULT/manifests/.manifest-$TS.tmp"

mkdir -p "$VAULT/snapshots" "$VAULT/manifests" "$VAULT/logs"

# Excludes anti-ruido/corrupción
EXCLUDES=(
  --exclude='.git'
  --exclude='**/node_modules'
  --exclude='**/.next'
  --exclude='**/dist'
  --exclude='**/build'
  --exclude='**/.cache'
  --exclude='**/coverage'
)

# Snapshot workspace
cd "$WS"
tar -czf "$SNAP" "${EXCLUDES[@]}" .
SHA=$(sha256sum "$SNAP" | awk '{print $1}')
SIZE=$(stat -c '%s' "$SNAP")

# Git hashes (source of truth)
ROOT_HASH=$(git -C "$WS" rev-parse HEAD 2>/dev/null || echo "na")
JPM_HASH=$(git -C "$WS/jpmarquezcom" rev-parse HEAD 2>/dev/null || echo "na")
ATLAS_HASH=$(git -C "$WS/dashboard/atlas-dashboard" rev-parse HEAD 2>/dev/null || echo "$ROOT_HASH")

# sanity checks
WS_OK=false; [[ -d "$WS" ]] && WS_OK=true
JPM_OK=false; [[ -d "$WS/jpmarquezcom" ]] && JPM_OK=true
ATLAS_OK=false; [[ -d "$WS/dashboard/atlas-dashboard" ]] && ATLAS_OK=true
LOCK_OK=false; [[ -f "$WS/jpmarquezcom/package-lock.json" || -f "$WS/jpmarquezcom/pnpm-lock.yaml" || -f "$WS/jpmarquezcom/yarn.lock" ]] && LOCK_OK=true

PKG_OK=true
python3 - <<PY || PKG_OK=false
import json
json.load(open('/root/.openclaw/workspace/jpmarquezcom/package.json','r',encoding='utf-8'))
PY

cat > "$TMP_MAN" <<JSON
{
  "timestamp": "$(date -Iseconds)",
  "snapshot_file": "$(basename "$SNAP")",
  "snapshot_path": "$SNAP",
  "snapshot_sha256": "$SHA",
  "snapshot_size_bytes": $SIZE,
  "git": {
    "workspace_root": "$ROOT_HASH",
    "jpmarquezcom": "$JPM_HASH",
    "atlas_dashboard": "$ATLAS_HASH"
  },
  "config_import_policy": "template_only",
  "secrets_policy": "vault_references_only",
  "validations": {
    "workspace_exists": $WS_OK,
    "repo_jpmarquezcom_present": $JPM_OK,
    "repo_atlas_dashboard_present": $ATLAS_OK,
    "package_json_valid": $PKG_OK,
    "lockfiles_present": $LOCK_OK
  }
}
JSON
mv "$TMP_MAN" "$MAN"

# gate anti-corrupción
if /root/openclaw-monitor/atlas-validate-snapshot.sh "$SNAP" "$MAN"; then
  printf '%s | PHASE2 | snapshot promoted LKG | manifest=%s\n' "$(date -Iseconds)" "$(basename "$MAN")" >> "$VAULT/logs/audit.log"
  echo "SNAPSHOT=OK $SNAP"
else
  printf '%s | PHASE2 | snapshot rejected | manifest=%s\n' "$(date -Iseconds)" "$(basename "$MAN")" >> "$VAULT/logs/audit.log"
  rm -f "$SNAP" "$MAN"
  echo "SNAPSHOT=REJECTED"
  exit 1
fi
