## 2026-02-09 23:01 CET — ATLAS-SEC Threat Intel (lightweight)

Findings (AGI/agent security):
- Reviewed OWASP GenAI project materials and repo updates; risk focus remains consistent: prompt injection, sensitive data disclosure, insecure tool/plugin usage, and excessive agency in agent flows.
- Reviewed MITRE ATLAS data/references; ATT&CK-relevant AI techniques continue to map strongly to prompt manipulation, poisoning, model/service abuse, and exfiltration paths through integrated tools.
- No materially new critical class of threat identified in this pass versus existing baseline controls.

Status: **no critical updates**

3 concrete mitigations for this OpenClaw environment:
1. **Harden tool invocation policy**: require explicit allowlists per task/session for network/file/message actions; deny-by-default for destructive or outbound actions unless user-confirmed.
2. **Prompt-injection containment**: treat all fetched/web/email content as untrusted context; enforce structured extraction + policy checks before any tool call (especially `exec`, `message`, `gateway`, file writes outside workspace).
3. **Exfiltration guardrails + auditability**: add/redouble outbound data minimization checks (no secrets/tokens in outputs), log high-risk tool calls, and run periodic review of cron/background tasks for overbroad permissions.

Sources checked: OWASP GenAI project repository index and MITRE ATLAS data repository (public pages/raw docs).

## 2026-02-10 05:01 CET — ATLAS-SEC Threat Intel (lightweight)

Findings (AGI/agent security):
- **New operational exposure signal (Jan 29, 2026):** reporting indicates ~175k publicly exposed Ollama hosts globally, many with tool-calling enabled. This materially increases risk of unauthorized model access, tool abuse, and data exfiltration when local AI runtimes are internet-exposed.
- **Agent abuse trend persists (Aug 27, 2025):** first observed AI-assisted ransomware workflows ("PromptLock") used local LLM APIs (via Ollama) to generate attack scripts and support exfil/encryption logic.
- **Baseline risk taxonomy unchanged but actively relevant:** OWASP GenAI project still emphasizes prompt injection, insecure tool usage, and sensitive data disclosure as top LLM/agent risks; current incident patterns continue to align with that model.

Status: **material updates observed**

3 concrete mitigations for this OpenClaw environment:
1. **Zero public exposure for local model/control planes**: keep OpenClaw, Ollama, n8n, and related agent/tool endpoints behind Cloudflare Access + private network only; block 0.0.0.0 bindings and internet ingress by default.
2. **Tool-call least privilege + egress control**: restrict high-risk tools (`exec`, `message`, `gateway`, file writes) with deny-by-default policy, scoped allowlists, and outbound domain/IP allowlisting to reduce exfil and command abuse paths.
3. **Injection-resistant execution pipeline**: preserve strict untrusted-content handling for web/email inputs, require policy checks before tool execution, and add alerts for suspicious sequences (fetch→exec, fetch→message, mass file read/write) tied to cron/session audits.

Sources checked: The Hacker News AI security feed/search pages (items dated 2025-08-27, 2026-01-29) and OWASP GenAI Top-10 project repository index.
