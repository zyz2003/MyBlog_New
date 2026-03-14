# Quick Task 2: P1 安全增强

**Created**: 2026-03-14
**Priority**: P1 - 重要安全改进
**Status**: In Progress

---

## Background

Quick Task 1 完成了 P0 安全修复（JWT 密钥和默认密码硬编码问题）。
根据团队评审，有以下 P1 待办事项需要完成：

1. **Backend-Dev 评审建议**: 添加 JWT_SECRET 最小长度校验
2. **Backend-Dev 评审建议**: 创建 `.env.example` 添加配置项

---

## Tasks

### Task 1: 添加 JWT_SECRET 最小长度校验

**Files**:
- `apps/site/server/middleware/auth.ts`

**Action**:
- 在 auth.ts 中添加 JWT_SECRET 长度校验
- 若长度小于 32 字符，输出警告信息
- 生产环境下建议抛出错误

**Verify**:
- [ ] 校验逻辑在密钥编码之前
- [ ] 警告信息明确指出最小长度要求
- [ ] 不影响开发环境运行

**Owner**: backend-dev

---

### Task 2: 创建 .env.example 配置文件

**Files**:
- `.env.example` (新建)

**Action**:
- 创建环境变量配置模板
- 包含所有必需的配置项
- 提供合理的示例值和注释

**配置项清单**:
- JWT_SECRET (必需，建议最少 32 字符)
- ADMIN_PASSWORD (可选，不设置则生成随机密码)
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- 其他配置项

**Verify**:
- [ ] 包含所有必需环境变量
- [ ] 每个变量有清晰的注释
- [ ] 提供安全配置建议
- [ ] 不包含真实密钥

**Owner**: backend-dev

---

## Success Criteria

- [ ] JWT_SECRET 长度校验完成
- [ ] .env.example 创建完成
- [ ] 通过 Code Reviewer 评审
- [ ] 通过 Architect 架构评审
- [ ] STATE.md 已更新

---

## Notes

- 本次任务为 P1 优先级，不影响核心功能但增强安全性
- 所有修改需经过团队评审
- 代码暂存本地，确认后再 push
