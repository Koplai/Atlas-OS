# Memory Architecture (Atlas)

## Current layers
- Short memory: active session context + transcripts in `~/.openclaw/agents/main/sessions/*.jsonl`
- Long memory (human-curated): `MEMORY.md`
- Daily operational memory: `memory/YYYY-MM-DD.md`
- Vector memory: Qdrant collection `atlas_memory` (embeddings via Ollama `nomic-embed-text`)

## Current limitation (memory tool)
OpenClaw `memory_search/memory_get` can fail if memory providers are not configured for that plugin path.
Observed status: `Memory enabled (plugin memory-core) · unavailable`.

## Workaround implemented
- Script: `/root/openclaw-monitor/vectorize-memory.py`
- Source files vectorized: `MEMORY.md` + `memory/*.md`
- Target store: Qdrant (`127.0.0.1:6333`) collection `atlas_memory`
- Scheduler: cron every 30 minutes

## Security
- No secrets should be written to memory files.
- Retention/redaction policies managed by ATLAS-GRC/ATLAS-SEC.
