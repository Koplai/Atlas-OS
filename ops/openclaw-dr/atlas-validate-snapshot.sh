#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT="${1:-}"
MANIFEST="${2:-}"
VAULT="/mnt/d/AtlasVault"

[[ -f "$SNAPSHOT" ]] || { echo "FAIL: snapshot missing"; exit 1; }
[[ -f "$MANIFEST" ]] || { echo "FAIL: manifest missing"; exit 1; }

# 1) manifest válido JSON
python3 - <<PY
import json
m=json.load(open('$MANIFEST','r',encoding='utf-8'))
required=['timestamp','snapshot_file','snapshot_sha256','validations','git']
for k in required:
    assert k in m, f'missing:{k}'
assert m.get('config_import_policy')=='template_only', 'config policy invalid'
print('manifest_json=ok')
PY

# 2) hash coincide
EXPECTED=$(python3 - <<PY
import json
print(json.load(open('$MANIFEST'))['snapshot_sha256'])
PY
)
REAL=$(sha256sum "$SNAPSHOT" | awk '{print $1}')
[[ "$EXPECTED" == "$REAL" ]] || { echo "FAIL: sha mismatch"; exit 1; }

# 3) sanity checks workspace repos/files
python3 - <<PY
import json,os
m=json.load(open('$MANIFEST'))
v=m['validations']
assert v.get('workspace_exists') is True
assert v.get('repo_jpmarquezcom_present') is True
assert v.get('repo_atlas_dashboard_present') is True
assert v.get('package_json_valid') is True
assert v.get('lockfiles_present') is True
print('sanity=ok')
PY

# 4) no import directo de openclaw.json
grep -q '"config_import_policy": "template_only"' "$MANIFEST" || { echo "FAIL: config import policy"; exit 1; }

# 5) registrar LKG + pointer atómico
LKG="$VAULT/manifests/last-known-good.json"
LKG_TMP="$VAULT/manifests/.last-known-good.tmp"
PTR="$VAULT/manifests/LATEST_GOOD"
PTR_TMP="$VAULT/manifests/.LATEST_GOOD.tmp"
cp "$MANIFEST" "$LKG_TMP"
mv "$LKG_TMP" "$LKG"
printf '%s\n' "$(basename "$MANIFEST")" > "$PTR_TMP"
mv "$PTR_TMP" "$PTR"
printf '%s | PHASE2 | snapshot validated | file=%s | sha=%s | pointer=%s\n' "$(date -Iseconds)" "$(basename "$SNAPSHOT")" "$REAL" "$(cat "$PTR")" >> "$VAULT/logs/audit.log"

echo "VALIDATION=PASS"
