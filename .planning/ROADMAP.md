# Roadmap: My Blog System

**Created:** 2026-03-16
**Total Phases:** 11
**Requirements Mapped:** 58

## Milestones

### Milestone 1: 基础框架 (Phase 1-4)
**Goal:** 搭建可运行的基础架构

### Milestone 2: 核心功能 (Phase 5-7)
**Goal:** 实现博客核心功能（后台管理 + 前台展示 + 主题）

### Milestone 3: 扩展功能 (Phase 8-11)
**Goal:** 插件系统、编辑器、测试优化和部署

---

## Phases

### Phase 1: Monorepo 脚手架
**Goal:** 创建可运行的空项目和 CI/CD 配置

**Requirements:**
- CORE-01: Monorepo 脚手架搭建（pnpm workspace）
- CORE-02: TypeScript 配置和类型定义
- CORE-03: ESLint + Prettier 代码规范
- CORE-04: Git Hooks 配置（Husky）
- CORE-05: CI/CD 基础配置

**Success Criteria:**
1. pnpm workspace 正常运行
2. TypeScript 类型检查通过
3. 代码规范检查通过
4. Git Hooks 正常拦截提交
5. CI/CD 流水线执行成功

**Wave:** 1

---

### Phase 2: 核心框架
**Goal:** 实现插件系统、主题系统、钩子系统核心架构

**Requirements:**
- PLUGIN-01: 插件系统核心架构
- PLUGIN-02: 16 个插件挂载点实现
- PLUGIN-03: 插件生命周期管理
- THEME-01: 主题系统核心架构
- THEME-02: CSS Variables 主题变量
- THEME-03: JSON 主题配置文件

**Success Criteria:**
1. 插件可以被加载和卸载
2. 16 个挂载点可以正常 hook
3. 主题配置可以动态切换
4. CSS Variables 主题生效

**Wave:** 1

---

### Phase 3: 数据库层
**Goal:** 完成数据库 Schema 设计和迁移脚本

**Requirements:**
- DB-01 ~ DB-10: 完整数据库层实现

**Success Criteria:**
1. SQLite 数据库正常连接（WAL 模式）
2. Drizzle ORM 正常运作
3. 所有 Schema 定义完成
4. 迁移脚本可以执行
5. 种子数据可以插入

**Wave:** 1

---

### Phase 4: API 层
**Goal:** 实现 Nitro API 路由、中间件、服务层

**Requirements:**
- API-01 ~ API-09: 完整 API 层实现

**Success Criteria:**
1. Nitro Server 正常启动
2. 文章 CRUD API 可用
3. 认证 API 可用（JWT）
4. 中间件正常运作
5. API 验证通过

**Wave:** 1

---

### Phase 5: 后台管理
**Goal:** 实现后台管理 UI 和核心功能

**Requirements:**
- ADMIN-01 ~ ADMIN-08: 后台管理页面

**Success Criteria:**
1. 后台布局正常渲染
2. 文章列表可以展示和分页
3. 文章编辑页面可用
4. 媒体库可以上传和管理
5. 设置页面可用

**Wave:** 1

---

### Phase 6: 前台博客
**Goal:** 实现前台博客页面

**Requirements:**
- BLOG-01 ~ BLOG-08: 前台博客页面

**Success Criteria:**
1. 首页正常渲染
2. 文章列表分页正常
3. 文章详情页 SSR 正常
4. 分类/标签筛选可用
5. SEO 元词正常生成
6. RSS Feed 可用

**Wave:** 1

---

### Phase 7: 主题系统
**Goal:** 完整主题功能和默认主题

**Requirements:**
- THEME-04 ~ THEME-07: 主题预览、切换、默认主题

**Success Criteria:**
1. 主题预览功能可用
2. 主题切换 API 正常
3. Minimal 默认主题可用
4. Classic 示例主题可用

**Wave:** 1

---

### Phase 8: 插件系统
**Goal:** 完整插件功能和官方插件

**Requirements:**
- PLUGIN-04: 插件配置 UI
- PLUGIN-05: 官方插件：SEO 优化

**Success Criteria:**
1. 插件配置 UI 可用
2. SEO 插件正常运作

**Wave:** 1

---

### Phase 9: 双编辑器
**Goal:** TipTap + Vditor 编辑器集成

**Requirements:**
- EDITOR-01 ~ EDITOR-06: 完整编辑器功能

**Success Criteria:**
1. TipTap 可视化编辑器可用
2. Vditor Markdown 编辑器可用
3. 编辑器切换正常
4. 图片上传可用
5. 代码高亮可用
6. 自动保存可用

**Wave:** 1

---

### Phase 10: 测试优化
**Goal:** 单元测试、性能优化、Bug 修复

**Requirements:**
- 单元测试覆盖核心功能
- 性能优化达到目标
- 已知 Bug 修复

**Success Criteria:**
1. 单元测试覆盖率 > 80%
2. 首屏加载 < 2s
3. 无严重 Bug

**Wave:** 1

---

### Phase 11: 部署文档
**Goal:** Docker 配置、部署文档、用户文档

**Requirements:**
- Docker Compose 配置
- 部署文档完成
- 用户文档完成

**Success Criteria:**
1. Docker 一键部署可用
2. 部署文档清晰完整
3. 用户文档清晰完整

**Wave:** 1

---

## Requirement Coverage

| Category | Total | Mapped |
|----------|-------|--------|
| CORE | 5 | 5 |
| DB | 10 | 10 |
| API | 9 | 9 |
| ADMIN | 8 | 8 |
| BLOG | 8 | 8 |
| PLUGIN | 5 | 5 |
| THEME | 7 | 7 |
| EDITOR | 6 | 6 |
| **Total** | **58** | **58** |

**Coverage:** 100% ✓

---
*Roadmap created: 2026-03-16*
*Last updated: 2026-03-16 after initial creation*
