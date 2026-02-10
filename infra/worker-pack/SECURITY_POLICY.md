# Worker Pack Security Policy (mandatory)

## Scope
Applies to workers in `infra/worker-pack`.

## Rules
1. Zero Trust by default.
2. No external browsing/fetch unless task explicitly approved by Atlas.
3. No secrets in logs, prompts, or artifacts.
4. Least privilege execution only.
5. Any anomaly escalates to SEC master (WSL control-plane) via incident log.

## Escalation path
- Write incident events to:
  - `/mnt/d/AtlasVault/logs/soc-events.jsonl`
- Include:
  - timestamp
  - worker id
  - anomaly type
  - evidence path
  - requested action

## Monitoring minimum
- Worker heartbeat every cycle.
- Security worker checks port exposure baseline drift.
- PMO worker checks last commit freshness + SLA drift.
- SEO worker checks pipeline artifact freshness only (no external fetch by default).
