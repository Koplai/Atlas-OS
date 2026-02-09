#!/usr/bin/env python3
import json, sys
from pathlib import Path

POLICY_DIR = Path('/root/.openclaw/policies')
REQUIRED = ['baseline.yaml', 'actions.yaml', 'retention.yaml', 'exceptions.yaml']

try:
    import yaml
except Exception:
    print('ERROR: PyYAML not installed. Activation blocked.')
    sys.exit(2)

errors = []
loaded = {}

for name in REQUIRED:
    p = POLICY_DIR / name
    if not p.exists():
        errors.append(f'missing file: {p}')
        continue
    try:
        with p.open('r', encoding='utf-8') as f:
            loaded[name] = yaml.safe_load(f)
    except Exception as e:
        errors.append(f'invalid yaml: {name}: {e}')

# minimal schema checks
b = loaded.get('baseline.yaml', {}) or {}
if b.get('owner') != 'ATLAS-GRC':
    errors.append('baseline.yaml owner must be ATLAS-GRC')
if 'classification' not in b:
    errors.append('baseline.yaml missing classification')

a = loaded.get('actions.yaml', {}) or {}
if a.get('default') not in ('DENY', 'ASK'):
    errors.append('actions.yaml default must be DENY or ASK')
if not isinstance(a.get('rules'), list) or not a.get('rules'):
    errors.append('actions.yaml requires non-empty rules list')

r = loaded.get('retention.yaml', {}) or {}
if 'retention' not in r:
    errors.append('retention.yaml missing retention block')

x = loaded.get('exceptions.yaml', {}) or {}
if 'exceptions' not in x or not isinstance(x.get('exceptions'), list):
    errors.append('exceptions.yaml exceptions must be a list')

if errors:
    print('POLICY_VALIDATION=FAIL')
    for e in errors:
        print(f'- {e}')
    sys.exit(1)

print('POLICY_VALIDATION=OK')
print(json.dumps({'files': REQUIRED, 'status': 'ok'}))
