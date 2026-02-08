# Atlas-OS

**Resilient AI Agent Operating System** — Production-grade infrastructure for autonomous AI operations.

## Overview

Atlas-OS is the core operating system for **Atlas Ops**, a multi-agent AI team built on OpenClaw. It provides resilience, failover, monitoring, and orchestration for AI agents running critical infrastructure.

## Key Features

### ✅ **Local-First Architecture**
- **Embeddings:** Ollama (nomic-embed-text) — no external API dependencies
- **Vector Store:** SQLite + sqlite-vec for persistent memory
- **Models:** Local Llama 3.2 + DeepSeek with OpenRouter fallbacks

### ✅ **Production Resilience**
- **Circuit Breakers:** Per-provider failure detection with auto-recovery
- **Health Checks:** Comprehensive system monitoring (gateway, models, memory)
- **Watchdog:** Independent systemd timer for session monitoring
- **Auto-Restart:** Systemd-managed gateway with crash recovery
- **Fallback Chain:** Ollama → OpenRouter → graceful degradation

### ✅ **Multi-Agent Team**
- **Atlas** (llama3.2:3b) — Core operator & orchestrator
- **Backend** (deepseek-r1:32b) — Full-stack development
- **DevOps** (llama3.2:3b) — Infrastructure & deployment
- **Security** (llama3.2:3b) — Security & compliance
- **Data/AI** (deepseek-r1:32b) — ML/AI & analytics
- **Designer** (GPT-5.2) — Visual & UX design

## Architecture

### Stack
```
┌─────────────────────────────────────────┐
│         Atlas-OS (OpenClaw)             │
├─────────────────────────────────────────┤
│  Gateway (systemd)                      │
│  ├── Watchdog Timer (5min)              │
│  ├── Circuit Breaker                    │
│  └── Health Monitor                     │
├─────────────────────────────────────────┤
│  Memory Layer                           │
│  ├── SQLite + sqlite-vec                │
│  ├── Ollama Embeddings (768d)           │
│  └── Hybrid Search (Vector + BM25)      │
├─────────────────────────────────────────┤
│  Model Layer                            │
│  ├── Ollama (Local)                     │
│  │   ├── llama3.2:3b                    │
│  │   └── deepseek-r1:32b                │
│  └── OpenRouter (Fallback)              │
│      └── claude-sonnet-4.5              │
└─────────────────────────────────────────┘
```

### Resilience Stack
- **Health Check:** `scripts/health-check-ollama.sh`
- **Circuit Breaker:** `scripts/circuit-breaker-check.sh`
- **Watchdog:** `scripts/watchdog-sessions.sh` (systemd timer)
- **Health Endpoint:** `scripts/health-endpoint.sh`

## Quick Start

### Prerequisites
- OpenClaw v2026.2.3+
- Ollama with models: `llama3.2:3b`, `deepseek-r1:32b`, `nomic-embed-text`
- Qdrant (optional, for external vector store)

### Installation

```bash
# Clone repository
git clone https://github.com/jpmarquez/Atlas-OS.git
cd Atlas-OS

# Install OpenClaw workspace
cp -r . ~/.openclaw/workspace/

# Enable systemd services
systemctl --user enable openclaw-gateway
systemctl --user enable openclaw-watchdog.timer
systemctl --user start openclaw-gateway
systemctl --user start openclaw-watchdog.timer

# Verify health
cd scripts && ./health-endpoint.sh
```

## Configuration

### Agent Config (`openclaw.json`)
```json
{
  "agents": {
    "list": [
      {
        "id": "atlas",
        "model": {
          "primary": "ollama/llama3.2:3b",
          "fallbacks": ["openrouter/anthropic/claude-sonnet-4.5"]
        }
      }
    ]
  }
}
```

### Memory Config
```json
{
  "memorySearch": {
    "provider": "openai",
    "remote": {
      "baseUrl": "http://localhost:11434/v1"
    },
    "model": "nomic-embed-text",
    "store": {
      "driver": "sqlite",
      "path": "~/.openclaw/memory/atlas.sqlite"
    }
  }
}
```

## Operations

### Health Checks
```bash
# Check Ollama
./scripts/health-check-ollama.sh

# Auto-restart Ollama if down
./scripts/health-check-ollama.sh --fix

# Full system health
./scripts/health-endpoint.sh
```

### Circuit Breaker
```bash
# Check circuit state
./scripts/circuit-breaker-check.sh ollama check-state

# Record success/failure
./scripts/circuit-breaker-check.sh ollama record-success
./scripts/circuit-breaker-check.sh ollama record-failure
```

### Monitoring
```bash
# Gateway status
systemctl --user status openclaw-gateway

# Watchdog status
systemctl --user status openclaw-watchdog.timer

# View logs
journalctl --user -u openclaw-gateway -f
```

## Team

**Atlas Ops** — AI-powered infrastructure team
- Built with ❤️ by JP Marquez
- Powered by OpenClaw
- Designed for production reliability

## Documentation

- [RESILIENCE.md](RESILIENCE.md) — Full resilience stack documentation
- [SOUL.md](SOUL.md) — Core principles & operating philosophy
- [memory/incidents.md](memory/incidents.md) — Incident log

## License

MIT License — See LICENSE file for details

## Contributing

Issues and PRs welcome. This is production infrastructure — quality over speed.

---

**Status:** ✅ Production-ready  
**Version:** 1.0.0  
**Last Updated:** 2026-02-08
