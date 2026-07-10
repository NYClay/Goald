# Template Design — Goald

> DORA 2025 research basis for AGENTS.md structure and agent governance.

---

## Research Summary

DORA 2025 State of DevOps Report (and prior years) consistently shows:

| Finding | Implication for Goald |
|---|---|
| **Loose coupling + fast feedback** → AI gains | Enforce layer boundaries (ESLint), CI < 4 min |
| **Tight coupling** → AI provides no benefit | Architecture.md rules are mandatory, not advisory |
| **Rework rate > 10%** → Stop features, fix process | Track via `npm run metrics`, gate on rework |
| **Change failure rate < 5%** → Elite performers | Preflight (lint+typecheck+test) on every PR |
| **PR review < 24h** → Higher throughput | Small PRs (< 400 lines), conventional commits |

---

## AGENTS.md Design Decisions

### 1. Human-in-the-Loop Gate
- **No auto-merge.** Every PR requires human review.
- **Draft PRs only.** Agents open drafts; humans promote to ready.
- **Rationale:** DORA shows AI generates code fast but introduces subtle bugs. Human review catches architectural drift.

### 2. Layer Enforcement via ESLint
- `no-restricted-imports` rules in `eslint.config.js` are the **single source of truth** for architecture.
- CI fails on violations. No exceptions.
- **Rationale:** Static analysis > human memory. Prevents "just this once" imports that accumulate into spaghetti.

### 3. Type-First Development
- All types in `src/types/index.ts`. No inline types.
- `utils/` = pure functions only. No React, no Firebase.
- **Rationale:** Pure functions are testable, AI-verifiable, and composable. Side effects isolated to `services/`.

### 4. Test-First for Logic
- Unit tests required for `utils/` and `services/` (80% target).
- E2E covers user flows; unit covers math/rules.
- **Rationale:** Fast feedback loop. AI can write tests first, then implementation.

### 5. Context Files as Contract
- The 6 context files in AGENTS.md §3 are **read-only** for agents.
- Humans update them; agents consume them.
- **Rationale:** Prevents drift between docs and code. Single source of truth.

### 6. PM-Agent Contract
- PM writes issue → Agent implements + tests → Draft PR → Human reviews → Human merges
- **Agent MAY NOT:** add deps, change Firebase rules, modify workflows, change auth flows, touch >5 files without ask
- **Rationale:** Clear boundaries prevent scope creep and security risks.

### 7. Instability Safeguards
- PR size limit: 400 lines (CI enforced)
- Feature flags for all user-facing features (`featureFlags.ts`)
- Rollback runbook documented (`RUNBOOKS.md`)
- Rework rate > 10% → freeze features, fix process

### 8. Metrics-Driven
- `npm run metrics` shows rework rate, change failure rate, CI time, review time
- Targets in AGENTS.md §9
- **Rationale:** You improve what you measure. DORA metrics are the industry standard.

---

## Agent Instructions Design

### Copilot / VS Code Agent / Claude / Others
All agents read the same `AGENTS.md` + `.github/copilot-instructions.md`.

**Instruction hierarchy:**
1. `AGENTS.md` — Universal rules (this file's source)
2. `.github/copilot-instructions.md` — Copilot-specific subset
3. Skills (`.opencode/skill/`) — Task-specific workflows

### Skill System
Skills are loaded on-demand via `skill` tool when task matches description.
Example: `customize-opencode` skill only for opencode config changes.

---

## Change Impact Map (CHANGE_IMPACT_MAP.md)

Generated from:
- ESLint import graph
- TypeScript dependency graph
- Manual audit of cross-layer references

**Update trigger:** Any change to `src/types/index.ts`, `eslint.config.js`, or layer structure.

---

## Known Limitations (from DORA)

1. **AI cannot design architecture.** Layer boundaries are human decisions.
2. **AI cannot review Firebase security rules.** Requires human audit.
3. **AI cannot approve dependency additions.** Supply chain risk.
4. **Rework tracking is manual.** No automated rework detection yet.

---

*This document explains the **why** behind AGENTS.md. For the **what**, see AGENTS.md.*