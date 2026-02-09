# ATLAS-SEC Runtime Enforcement (fase actual)

## Qué implementa
- Gate de policy ejecutable:
  - `/root/openclaw-monitor/policy-engine.py`
  - `/root/openclaw-monitor/atlas-sec-gate.sh`
- Veredictos: `ALLOW | ASK | BLOCK`
- Registro obligatorio en `soc-events.jsonl`

## Limitación
OpenClaw no expone (por defecto) un hook universal pre-tool para interceptar todas las tool calls del runtime. Esta fase aplica enforcement en flujos críticos propios (scripts de monitor/recovery) y como contrato operativo para Atlas.

## Uso
```bash
/root/openclaw-monitor/atlas-sec-gate.sh exec restart "systemctl --user restart openclaw-gateway.service" false false
```

Exit codes:
- `0`: ALLOW/ASK
- `40`: BLOCK

## Siguiente fase (recomendada)
1. Wrapper obligatorio para acciones críticas
2. Hook nativo en runtime OpenClaw (si se modifica core)
3. RBAC por agente + attestations
