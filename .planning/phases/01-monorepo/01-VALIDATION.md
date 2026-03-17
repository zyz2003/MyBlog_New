---
phase: 1
slug: monorepo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (for utils) + shell scripts (for infra) |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test && pnpm lint && pnpm type-check` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test` (for code changes) or `pnpm lint && pnpm type-check` (for config changes)
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds (for quick runs)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | CORE-01 | shell | `pnpm exec pnpm ls -r` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | CORE-02 | vitest | `pnpm test` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | CORE-03 | shell | `pnpm lint` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | CORE-04 | shell | `git commit -m "test"` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | CORE-05 | shell | `pnpm build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/utils/src/index.ts` — stub export for vitest testing
- [ ] `packages/utils/tests/basic.test.ts` — basic test stub
- [ ] `vitest.config.ts` — vitest workspace config
- [ ] `pnpm install` — install vitest as dev dependency at root

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Git Hooks intercept commits | CORE-04 | Requires interactive git action | Create a test commit and verify Husky runs lint-staged |
| CI/CD pipeline triggers | CORE-05 | Requires GitHub push | Push to a test branch and verify GitHub Actions runs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
