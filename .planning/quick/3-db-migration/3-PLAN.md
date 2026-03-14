# Quick Task 3: 数据库迁移和 API 联调

**Created**: 2026-03-14
**Priority**: P0 - Phase 1 完成关键任务
**Status**: In Progress

---

## Background

安全修复 (Quick Task 1&2) 已完成。现在需要执行数据库迁移并验证 API 功能，这是 Phase 1 完成的关键步骤。

---

## Tasks

### Task 1: 准备数据库迁移

**Owner**: backend-dev

**Files**:
- `apps/site/scripts/migrate.ts`
- `.env` (创建或配置)

**Action**:
1. 检查 MySQL 数据库连接配置
2. 创建或更新 `.env` 文件
3. 验证数据库可连接
4. 运行迁移脚本 `pnpm db:migrate`

**Verify**:
- [ ] `.env` 文件配置正确
- [ ] MySQL 服务可连接
- [ ] 迁移脚本执行成功
- [ ] 数据库表创建完成
- [ ] 管理员用户创建成功

---

### Task 2: API 功能测试

**Owner**: frontend-dev + backend-dev

**Files**:
- `apps/site/server/api/` - 所有 API 端点

**Action**:
1. 测试认证 API (登录/登出/获取当前用户)
2. 测试文章 CRUD API
3. 测试分类 API
4. 测试标签 API
5. 记录测试结果

**Verify**:
- [ ] `/api/auth/login` - 登录成功返回 token
- [ ] `/api/auth/me` - 携带 token 可获取用户信息
- [ ] `/api/articles` GET - 获取文章列表
- [ ] `/api/articles` POST - 创建文章
- [ ] `/api/categories` GET/POST - 分类管理
- [ ] `/api/tags` GET/POST - 标签管理

---

### Task 3: 前后端联调

**Owner**: frontend-dev + backend-dev

**Files**:
- `apps/site/pages/` - 前端页面
- `apps/site/server/api/` - 后端 API

**Action**:
1. 测试前端登录页面与后端认证 API 联调
2. 测试文章管理页面与后端文章 API 联调
3. 修复联调中发现的问题

**Verify**:
- [ ] 前端可以正常登录
- [ ] 前端可以查看文章列表
- [ ] 前端可以创建/编辑/删除文章
- [ ] 前端可以管理分类和标签

---

## Success Criteria

- [ ] 数据库迁移成功
- [ ] 所有 API 端点测试通过
- [ ] 前后端联调成功
- [ ] 通过团队评审
- [ ] STATE.md 已更新

---

## Notes

- 需要 MySQL 数据库服务运行
- 所有修改需经过团队评审
- 代码暂存本地，确认后再 push
