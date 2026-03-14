# Quick Task 1: 修复 JWT 密钥和默认密码安全问题

**Created**: 2026-03-14
**Priority**: P0 - 安全关键
**Status**: In Progress

---

## Tasks

### Task 1: 修复 JWT 密钥硬编码

**Files**:
- `apps/site/server/middleware/auth.ts`
- `apps/site/nuxt.config.ts`

**Action**:
- 将 JWT 密钥从硬编码改为从 `JWT_SECRET` 环境变量读取
- 开发环境未设置时显示警告而非抛出异常
- 移除 nuxt.config.ts 中的默认值

**Verify**:
- [ ] `auth.ts` 使用 `process.env.JWT_SECRET` 读取密钥
- [ ] 未设置环境变量时显示警告信息
- [ ] `nuxt.config.ts` 的 `jwtSecret` 不包含默认值
- [ ] Token 生成和验证正常工作

**Done**: 代码已修复并通过 Code Reviewer 评审

---

### Task 2: 修复默认密码硬编码

**Files**:
- `apps/site/scripts/migrate.ts`

**Action**:
- 将默认管理员密码从固定值 `admin123` 改为从 `ADMIN_PASSWORD` 环境变量读取
- 未设置环境变量时使用 `crypto.randomBytes` 生成密码学安全的随机密码
- 修正登录提示信息

**Verify**:
- [ ] 优先读取 `ADMIN_PASSWORD` 环境变量
- [ ] 未设置时生成随机密码并提示保存
- [ ] 使用 `crypto.randomBytes` 而非 `Math.random()`
- [ ] 登录提示不再包含硬编码密码

**Done**: 代码已修复并通过评审

---

### Task 3: TypeScript 类型安全改进

**Files**:
- `apps/site/server/middleware/auth.ts`

**Action**:
- 为 `getCurrentUser` 函数添加 `H3Event` 类型定义
- 导入正确的类型

**Verify**:
- [ ] 导入 `import type { H3Event } from 'h3'`
- [ ] `getCurrentUser(event: H3Event)` 类型正确

**Done**: 已修复

---

### Task 4: 团队评审

**Participants**:
- Code Reviewer - 主评审
- Backend-Dev - 后端角度评审
- Architect - 架构一致性评审

**Verify**:
- [x] Code Reviewer 评审通过
- [x] Backend-Dev 评审通过
- [ ] Architect 评审（可选）

---

### Task 5: 更新开发日志

**Files**:
- `.planning/STATE.md`

**Action**:
- 更新 "Recent Progress" 添加本次修复记录
- 更新 "待完成工作" 标记已完成项
- 更新 "Key Decisions Log" 添加安全修复决策
- 更新日期和 Session 信息

**Verify**:
- [ ] Session 6 记录完整
- [ ] 待完成工作已更新
- [ ] Key Decisions Log 已更新

**Done**: 已更新

---

## Success Criteria

- [x] JWT 密钥不再硬编码
- [x] 默认密码不再硬编码
- [x] 通过 Code Reviewer 评审
- [x] 通过 Backend-Dev 评审
- [x] STATE.md 已更新
- [x] 代码已暂存本地（未 push）

---

## Notes

- 本次修复遵循 GSD 工作流，团队协作完成
- 所有修复代码暂存本地，待用户确认后 push
- 后续待办：创建 `.env.example` 添加 `JWT_SECRET` 和 `ADMIN_PASSWORD` 配置项
