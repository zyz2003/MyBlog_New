---
phase: 2
slug: core-framework
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                            |
| ---------------------- | -------------------------------- |
| **Framework**          | vitest (Nuxt 3 生态)             |
| **Config file**        | `vitest.config.ts` (Wave 0 创建) |
| **Quick run command**  | `pnpm test:watch --run`          |
| **Full suite command** | `pnpm test`                      |
| **Estimated runtime**  | ~30 秒                           |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run <specific-test-file>`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 秒

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                  | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | ---------------------------------- | ----------- | ---------- |
| 02-01-01 | 01   | 1    | PLUGIN-01   | unit      | `pnpm test --run plugin-manager`   | ❌ W0       | ⬜ pending |
| 02-01-02 | 01   | 1    | PLUGIN-01   | unit      | `pnpm test --run plugin-loader`    | ❌ W0       | ⬜ pending |
| 02-01-03 | 01   | 1    | PLUGIN-02   | unit      | `pnpm test --run hook-registry`    | ❌ W0       | ⬜ pending |
| 02-01-04 | 01   | 1    | PLUGIN-03   | unit      | `pnpm test --run lifecycle`        | ❌ W0       | ⬜ pending |
| 02-02-01 | 02   | 2    | THEME-01    | unit      | `pnpm test --run theme-manager`    | ❌ W0       | ⬜ pending |
| 02-02-02 | 02   | 2    | THEME-02    | unit      | `pnpm test --run css-variables`    | ❌ W0       | ⬜ pending |
| 02-02-03 | 02   | 2    | THEME-03    | unit      | `pnpm test --run theme-config`     | ❌ W0       | ⬜ pending |
| 02-02-04 | 02   | 2    | THEME-02    | e2e       | `pnpm test:e2e --run theme-switch` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `packages/plugin/src/__tests__/plugin-manager.test.ts` — PluginManager 核心测试
- [ ] `packages/plugin/src/__tests__/hook-registry.test.ts` — 挂载点注册表测试
- [ ] `packages/plugin/src/__tests__/lifecycle.test.ts` — 生命周期事件测试
- [ ] `packages/core/src/__tests__/theme-manager.test.ts` — ThemeManager 测试
- [ ] `vitest.config.ts` — Vitest 配置（如不存在）
- [ ] `packages/plugin/package.json` — 添加 `test` 脚本
- [ ] `packages/core/package.json` — 添加 `test` 脚本

---

## Manual-Only Verifications

| Behavior             | Requirement | Why Manual           | Test Instructions                                   |
| -------------------- | ----------- | -------------------- | --------------------------------------------------- |
| 插件配置文件加载     | PLUGIN-01   | 需要验证文件扫描机制 | 1. 创建 plugins.config.json 2. 启动应用 3. 检查日志 |
| 主题切换视觉效果     | THEME-02    | 视觉验证无法自动化   | 1. 切换主题 2. 检查页面样式变化                     |
| CSS Variables 作用域 | THEME-02    | 需要目视检查         | 1. 打开 DevTools 2. 检查计算样式                    |
| 主题配置文件结构     | THEME-03    | 配置验证             | 1. 读取 theme.json 2. 验证字段完整性                |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

## Dimension 8 Checklist (Nyquist)

| Dimension | Requirement            | Verification                   |
| --------- | ---------------------- | ------------------------------ |
| D1        | 插件系统核心架构       | plugin-manager.test.ts         |
| D2        | 16 个插件挂载点        | hook-registry.test.ts          |
| D3        | 插件生命周期管理       | lifecycle.test.ts              |
| D4        | 主题系统核心架构       | theme-manager.test.ts          |
| D5        | CSS Variables 主题变量 | css-variables.test.ts + manual |
| D6        | JSON 主题配置文件      | theme-config.test.ts           |

---

_Validation strategy created: 2026-03-17_
_Next: Planning phase - create PLAN.md files_
