# Guardrail Enforcement — Role Uniqueness

## Effective immediately
- PMO role is **control-plane only** (WSL).
- Worker packs (Docker Desktop/Synology) run **execution roles only**.
- No duplicated role across packs unless overload is measured and Atlas approves temporary replica.

## Active topology
- WSL (control-plane): Atlas + PMO + SEC master + GRC
- Docker Desktop worker-pack: SEC worker, SEO worker
- Synology worker-pack: INFRA worker, BATCH worker

## Replica policy (strict)
Replica requires:
1. overload evidence,
2. Atlas explicit approval,
3. timebox,
4. disable criteria.
