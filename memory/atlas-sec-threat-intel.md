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

## 2026-02-10 11:01 CET — ATLAS-SEC Threat Intel (lightweight)

Findings (AGI/agent security):
- **OWASP GenAI 2025 risk refresh remains active:** current OWASP LLM risk pages continue to prioritize prompt injection and sensitive data disclosure as primary exploit paths in agentic workflows (including indirect injections from external content).
- **MCP ecosystem maturity increased in 2025:** Model Context Protocol revisions (2025-03-26, 2025-06-18, 2025-11-25-RC) and security guidance emphasize confused-deputy/OAuth consent abuse risks in tool/proxy chains—relevant to agent tool abuse and delegated authorization.
- **ATT&CK-relevant mapping unchanged:** observed threat patterns still align with ATT&CK-style behaviors (initial access via crafted content, privilege misuse via over-permissioned tools, and exfiltration over allowed channels) rather than a newly emerging threat class.

Status: **no critical updates**

3 concrete mitigations for this OpenClaw environment:
1. **Strict untrusted-content boundary**: keep all `web_fetch`/external text as untrusted; require explicit policy checks before any downstream tool call (especially `exec`, `message`, `gateway`, and write operations).
2. **Delegated-auth hardening for tool connectors**: enforce per-client consent, exact redirect-URI matching, CSRF/state validation, and short-lived scoped tokens on any MCP/OAuth-style integrations to prevent confused-deputy abuse.
3. **Least-privilege + exfil controls**: maintain deny-by-default on high-impact tools, restrict outbound destinations, and alert on suspicious chains (fetch→exec, fetch→message, bulk read→send) in cron/session audits.

Sources checked: OWASP GenAI LLM risk pages (LLM01:2025, LLM02:2025), MCP security best practices + 2025 spec releases, OWASP Agentic AI threats overview.
