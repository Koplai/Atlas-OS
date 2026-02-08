# ATLAS — SYSTEM PROMPT (Dashboard + Orchestration Spec v2.0)
# Goal: Build a complete “Mission Control” webapp for ATLAS that matches the UI/UX in the screenshots (Klaus) but rebranded and fully functional for ATLAS.
# Non-negotiable: NO PROOF = NOT DONE. The UI must only show states that are backed by real data (runs/logs/artifacts).

────────────────────────────────────────────────────────
0) PRODUCT INTENT
────────────────────────────────────────────────────────
Atlas Dashboard is a “single pane of glass” for:
- Runs (execution), Tasks (kanban), Docs, Activity Log (audit), Agents, Integrations, Memory, Models/Tokens.
- It must support the same operational capabilities you expect from an OpenClaw dashboard: visibility, control, evidence, and governance.
- The UI must eliminate “trust gaps” by showing proof-of-work, last heartbeat, last sync, and evidence for every claimed action.

Primary Success Criteria:
1) When ATLAS is executing any run, the avatar icon ANIMATES and status changes in real time.
2) Every action appears in Activity Log with timestamp and evidence link/snippet.
3) All artifacts (files, logs, docs, run outputs) are browseable from Docs/Proof-of-Work.
4) Kanban reflects real tasks/runs, not imaginary progress.

────────────────────────────────────────────────────────
1) GLOBAL UI LAYOUT (match screenshots)
────────────────────────────────────────────────────────
Theme:
- Dark “mission control” (blue/gray), minimal, high contrast, rounded cards, subtle borders.
- Top nav tabs: Dashboard | Docs | Log
- Top-right: “Last sync: <time>” + notification dot + logout.

Left Sidebar (fixed):
- Animated circular Avatar (emoji/icon).
- Name: ATLAS
- Status line: dot + label (Idle / Thinking… / Running / Blocked / Offline)
- A small pill/button: “Ready for tasks” (or “Finished: Ready for tasks” when idle)
- Sidebar must show:
  - Current Run (if any): runName + runId
  - Last Heartbeat timestamp
  - Channel status: Terminal / Telegram / WhatsApp (Connected / Disconnected / Draft-only)

Critical animation rule:
- Avatar MUST animate whenever state = Running OR Thinking OR Executing steps.
- Animation must stop when state returns to Idle.

Sync rule:
- “Last sync” updates via websocket (preferred) or short polling.
- If stale > threshold, show “Sync stale” warning and degraded mode (read-only).

────────────────────────────────────────────────────────
2) TAB: DASHBOARD (Kanban Mission Control)
────────────────────────────────────────────────────────
The Dashboard tab MUST look like the Kanban board screenshot.

2.1 Kanban Columns (4):
- TO DO
- IN PROGRESS
- DONE
- ARCHIVE

Each column is a card container with:
- Column header + small dot indicator
- Scrollable task list
- Optional per-column controls

Top-right of board:
- “Expand” button (toggles wide/fullscreen board)

2.2 Task Card design (match screenshot):
- Compact dark cards with subtle border
- Left vertical accent line (color depends on status/severity)
- Title supports prefix: e.g. “Atlas Dashboard: <TaskName>” OR “ProjectName: <TaskName>”
- Optional tags: agent, integration, severity, runId link
- Clicking card opens a right-side drawer (or modal) with details.

2.3 What Kanban represents (ATLAS semantics):
- Tasks can be:
  A) Human-defined work items (spec, UX, integration)
  B) System-generated “Runs” turned into tasks (e.g., “Deploy dashboard container”)
  C) Blocking items (missing token/permission)

Mapping:
- TO DO: planned/queued items not started
- IN PROGRESS: active runs OR tasks being executed
- DONE: completed with VERIFIED evidence
- ARCHIVE: old done/closed tasks (read-only)

2.4 Kanban interactions (mandatory):
- Drag & drop cards between columns.
- Moving a card to DONE requires Proof-of-Work:
  - Must attach evidence reference: log entry, file output, URL, docker ps, commit id, etc.
  - If no evidence, system blocks the move or marks it “Unverified” with warning.
- ARCHIVE column:
  - Shows latest archived cards with a “Show all <n> archived” button (match screenshot).
  - Archive list is scrollable and expandable.

2.5 Board must integrate with Runs:
- Any active run automatically appears in IN PROGRESS as a card.
- When run finishes:
  - If success + evidence => DONE (verified)
  - If missing evidence => DONE (unverified) flagged + requires review
  - If failure => stays IN PROGRESS with error badge OR moves to TO DO with “Retry” button
- Each card links to:
  - Run detail
  - Log filtered by runId
  - Docs/artifacts produced

2.6 “Proof-of-Work” widget (mandatory on Dashboard):
- A card/panel showing latest tangible outputs:
  - artifacts created, logs, screenshots, docker containers, URLs, commits
- Each entry shows timestamp + evidence snippet + deep link.

────────────────────────────────────────────────────────
3) TAB: DOCS (Document Center)
────────────────────────────────────────────────────────
Docs tab layout matches the earlier screenshot:
Left panel:
- Header “DOCUMENTS”
- Search bar
- Scrollable list with icon, title, date, tag pills (Guide/Security/Project/AI Pulse/Reference)
Right panel:
- Document viewer for Markdown with header (title + date + tag) and “Edit” button.
- Edit mode supports Markdown editor + preview + versioning.

Docs must support:
- Linking to runs/agents/logs: atlas://runs/<id>, atlas://agents/<id>, atlas://logs?filter=...
- Upload docs (PDF/MD/TXT), store as artifacts, and create embeddings (if enabled).
- Export MD/PDF.

Docs must include auto-generated docs:
- Run summaries
- Incident reports
- Weekly “AI Pulse”
- Security audits
- System guides (e.g., “Atlas Master Guide”)

────────────────────────────────────────────────────────
4) TAB: LOG (Activity Log / Audit Trail)
────────────────────────────────────────────────────────
Log tab must match the “Activity Log” screenshot:
- Title card: “Activity Log”
- Subtitle: chronological record of ATLAS actions and completed tasks
- Right badge: “<n> entries”
- Timeline list grouped by date
- Each timeline item shows:
  - time label (e.g., 12:59 PM)
  - colored dot/marker
  - log text summary
  - must be linked to evidence and entities (taskId/runId)

Mandatory log schema fields:
- timestamp (ISO + user TZ)
- severity (INFO/WARN/ERROR/SECURITY)
- source (UI/Agent/n8n/Bridge/Docker/Cloudflare/GitHub/Model)
- entity refs: runId, taskId, docId, agentId, workflowId
- message (human readable)
- evidence (optional but required for “done” claims): {type, pointer, snippet}

Mandatory features:
- Filters by severity, source, runId, taskId, agentId, date range
- Search full-text
- Export JSON/CSV
- “Show unverified claims” view (should be near 0)

────────────────────────────────────────────────────────
5) CORE RUNTIME PANELS (parity with OpenClaw dashboard)
────────────────────────────────────────────────────────
The dashboard MUST expose these operational controls, either as sections inside Dashboard or as drawers/pages:

5.1 Runs
- Create run: Plan -> Approve -> Execute (approval gating)
- Run detail: steps timeline, inputs, outputs, evidence, logs, retry/abort
- Statuses: Planned / Running / Blocked / Verified / Failed / Aborted

5.2 Agents Hub
- List agents (Parent + children) with state
- Open agent:
  - System prompt view/edit (versioned + audit)
  - tools allowed
  - recent runs
  - pause/resume
- Subagents must be visible and attributed (no “phantom agents”)

5.3 Integrations
- Cards per integration: n8n, GitHub, Cloudflare, OneDrive, Obsidian, PayPal, etc.
- Each shows:
  - connected/valid/expired
  - last test timestamp
  - minimal scopes info (no secrets shown)
- “Test connection” triggers a VERIFIED run with evidence.

5.4 Models/Tokens
- Active model (local vs fallback)
- token usage meter (if applicable)
- cost meter (if applicable)
- alerts at 75/90%
- model switch events logged

5.5 Memory
- Short-term session snapshot
- Long-term memory store status (e.g., Qdrant): size, last sync, health
- Buttons:
  - “Generate Clean Exit Snapshot”
  - “Rehydrate Snapshot” per project

5.6 Uploads / Processing
- Drag-drop files/images/audio
- Each upload triggers a pipeline run with logs + artifact output
- Audio uploads must be transcribed via workflow (see section 6)

────────────────────────────────────────────────────────
6) REQUIRED ORCHESTRATION FLOW (n8n) — “ATLAS PARENT AGENT”
────────────────────────────────────────────────────────
You MUST implement an n8n workflow equivalent to the diagram (Telegram → Parent Agent → Children), adapted for ATLAS.

Workflow name: “ATLAS Parent Agent Orchestrator”

Nodes (minimum):
1) Telegram Trigger (updates: message)
2) Switch (mode: Rules)
   - If voice message -> voice path
   - Else -> text path
3) Voice path:
   - Download Voice File
   - Transcribe Audio (Whisper or chosen transcriber)
   - Set “Text” (normalize transcription to a single text field)
4) Text path:
   - Set “Text” (normalize incoming message)
5) Parent Agent node (Ultimate Assistant = ATLAS)
   - Receives normalized text + context
   - Must decide: respond directly OR call child sub-workflows
   - Must write structured output including:
     - Decision state (Exploring/Proposed/Decided/Deferred/Closed)
     - Execution state (PLANNING/EXECUTING/BLOCKED/VERIFIED/DEFERRED)
     - Any run created (runId)
     - Any tasks updated (taskId)
     - Evidence pointers if claiming completion
   Tools available to parent:
   - Chat model (OpenRouter or equivalent)
   - Simple Memory (short-term)
   - Web search tool (Tavily or equivalent) if enabled
   - Calculator
6) Children sub-workflows (callable from Parent):
   - Email Agent
   - Calendar Agent
   - Contact Agent
   - Content Creator Agent
   (Each child returns: result, assumptions, risks, next actions, data needed)
7) Think node (optional internal reasoning marker; not user-visible)
8) Response node:
   - sendMessage back via Telegram with final answer + run/task links

Critical integration rule:
- Every execution must emit:
  A) Run event(s) (start/step/end)
  B) Log event(s) with timestamp
  C) Any created artifact/doc pointer
- These must appear in the dashboard in near real time.

────────────────────────────────────────────────────────
7) EXECUTION INTEGRITY (ANTI-HALLUCINATION OPS)
────────────────────────────────────────────────────────
Hard rules:
- NEVER claim you sent WhatsApp/Telegram unless you have delivery proof/receipt log.
- NEVER claim Docker/container is running unless you can show docker ps or logs.
- NEVER claim files exist unless you can show tree/ls output and file content snippet.
- Dashboard must visibly mark any task/run as “Unverified” if evidence missing.

Progress reporting rules:
- Do NOT say “80% / almost done / in 1 minute” without proving what exists now and what remains.
- No “background work” claims. Either execute now with proof or defer with snapshot.

────────────────────────────────────────────────────────
8) DATA MODEL (minimum entities)
────────────────────────────────────────────────────────
Entities:
- Task {id, title, status, tags, createdAt, updatedAt, linkedRunIds[], evidenceRefs[], archivedAt?}
- Run {id, name, status, createdAt, updatedAt, steps[], inputs, outputs[], evidenceRefs[], approvals[]}
- LogEntry {id, timestamp, severity, source, message, refs{runId,taskId,agentId,docId,workflowId}, evidenceRef?}
- Doc {id, title, typeTag, createdAt, updatedAt, bodyMd, versions[] , links[]}
- Agent {id, name, status, systemPromptVersion, toolsAllowed[], lastRunId}
- Integration {id, name, status, lastTestAt, scopesSummary}
- Artifact {id, type, pointer, hash, size, createdAt, linkedRunId}

API-first:
- Provide REST endpoints and websocket events for all above.
- UI must be driven ONLY by these APIs/events.

────────────────────────────────────────────────────────
9) ACCEPTANCE TESTS (must pass)
────────────────────────────────────────────────────────
A) When a run starts:
- Avatar animates, status becomes Running, Kanban card appears in IN PROGRESS, Activity Log logs RUN_STARTED.

B) When a run completes:
- Kanban moves to DONE only with evidence; otherwise “DONE (Unverified)” flagged.
- Activity Log shows RUN_FINISHED + evidence pointer.

C) Log tab:
- Displays timeline with correct timestamps and linked entities.
- Filters work.

D) Docs tab:
- Can search, open, edit, version, link to run/log.

E) n8n workflow:
- Voice note → download → transcribe → normalized → parent agent → optional children → response.
- Each message triggers log + (optional) task/run updates visible in dashboard.

END.
