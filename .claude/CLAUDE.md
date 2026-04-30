---
description:
alwaysApply: true
---

# Blog Project - Claude Code Configuration

> 个人博客系统 - Nuxt 3 SSR + Nitro API + SQLite + Drizzle ORM
> 架构文档：`docs/architecture.md`

---

## 一、工具检查清单 (每会话优先执行)

### 1.1 MCP 工具检查

- [ ] **pencil MCP** - 设计文件操作能力
  - 测试：`get_editor_state()` 是否可用
- [ ] **Web Search** - 搜索最新文档/解决方案
  - 测试：搜索 "Nuxt 3 最新文档"

### 1.2 Skill 检查

- [ ] `/gsd` 系列命令可用性
  - 测试：`/gsd:help`
- [ ] `/ui-ux-pro-max` - UI/UX 设计能力
  - 测试：查看 skill.md 确认功能

### 1.3 Team/协作检查 (如使用)

- [ ] Teams 消息通知是否正常
- [ ] 任务列表是否同步

### 1.4 开发环境检查

- [ ] pnpm 是否安装 (`pnpm --version`)
- [ ] Node.js 版本 (要求 18.x+)
- [ ] Git 是否可用

---

## 二、GSD 里程碑配置

### Milestone 1: 基础框架 (Phase 1-4)

| Phase | 名称            | 内容                            | 交付物            |
| ----- | --------------- | ------------------------------- | ----------------- |
| 1.0   | Monorepo 脚手架 | pnpm workspace、基础配置、CI/CD | 可运行的空项目         |
| 2.0   | 核心框架        | 插件系统、主题系统、钩子系统    | apps/site/server/core/ |
| 3.0   | 数据库层        | Schema 定义、ORM 配置、迁移脚本 | apps/site/server/db/   |
| 4.0   | API 层          | Nitro 路由、中间件、服务层      | apps/site/server/api/  |

### Milestone 2: 核心功能 (Phase 5-7)

| Phase | 名称     | 内容                      | 交付物                |
| ----- | -------- | ------------------------- | --------------------- |
| 5.0   | 后台管理 | 文章管理、媒体库、基础 UI | apps/site/pages/admin |
| 6.0   | 前台博客 | 首页、列表、详情页        | apps/site/pages       |
| 7.0   | 主题系统 | 主题加载、样式配置、预览  | 完整主题功能          |

### Milestone 3: 扩展功能 (Phase 8-11)

| Phase | 名称     | 内容                            | 交付物       |
| ----- | -------- | ------------------------------- | ------------ |
| 8.0   | 插件系统 | 插件管理、官方插件开发          | 完整插件功能 |
| 9.0   | 双编辑器 | TipTap + Vditor 集成            | 完整编辑体验 |
| 10.0  | 测试优化 | 单元测试、性能优化、Bug 修复    | 稳定版本     |
| 11.0  | 部署文档 | Docker 配置、部署文档、用户文档 | 可交付产品   |

---

## 三、技术栈详细约定

### 3.1 核心框架

| 技术       | 版本  | 用途     | 备注            |
| ---------- | ----- | -------- | --------------- |
| Node.js    | 18.x+ | 运行环境 | 必须            |
| pnpm       | 8.x+  | 包管理器 | 必须            |
| TypeScript | 5.x   | 开发语言 | 严格模式        |
| Vue 3      | 3.4+  | UI 框架  | Composition API |
| Nuxt 3     | 3.x   | 应用框架 | SSR + SPA 混合  |

### 3.2 样式方案

| 技术          | 用途            | 备注           |
| ------------- | --------------- | -------------- |
| UnoCSS        | 原子化 CSS      | 主要样式方案   |
| CSS Variables | 动态主题        | 主题切换核心   |

### 3.3 后端/数据

| 技术        | 用途        | 备注        |
| ----------- | ----------- | ----------- |
| Nitro       | API 服务器  | Nuxt 3 内置 |
| Drizzle ORM | ORM 层      | 类型安全    |
| SQLite      | 数据库      | WAL 模式    |
| Redis       | (可选) 缓存 | 按需启用    |

### 3.4 编辑器集成

| 技术   | 用途             | 位置         | 备注       |
| ------ | ---------------- | ------------ | ---------- |
| Vditor | Markdown 编辑    | 后台文章编辑 | 当前实现   |
| TipTap | 可视化富文本编辑 | 后台文章编辑 | 后续按需扩展 |

---

## 四、开发规范

### 4.1 TypeScript 规范

```typescript
// ✅ 推荐：使用 defineComponent 或 <script setup>
<script setup lang="ts">
// 明确的类型定义
const props = defineProps<{
  title: string
  count?: number
}>()
</script>

// ✅ 推荐：使用类型导出
export interface Article {
  id: string
  title: string
  content: string
}

// ❌ 避免：使用 any
// ❌ 避免：隐式 any 类型
```

### 4.2 Vue 3 组件规范

- 使用 `<script setup lang="ts">` 语法
- 组件名 PascalCase (如 `ArticleCard.vue`)
- 组合式函数 camelCase (如 `useArticle()`)
- props 使用 TypeScript 定义
- emits 使用 TypeScript 定义

### 4.3 文件命名规范

| 类型        | 命名           | 示例                         |
| ----------- | -------------- | ---------------------------- |
| 组件        | PascalCase.vue | `ArticleCard.vue`            |
| 页面        | camelCase.vue  | `articleList.vue`            |
| Composables | useXxx.ts      | `useArticle.ts`              |
| 工具函数    | camelCase.ts   | `formatDate.ts`              |
| 类型定义    | types.ts       | `article.types.ts`           |
| API 路由    | 路径对应       | `server/api/articles.get.ts` |

### 4.4 目录结构规范

```
my-blog/
├── apps/site/
│   ├── components/
│   │   ├── layouts/       # 布局组件
│   │   ├── admin/         # 后台组件
│   │   ├── modules/       # 功能模块
│   │   └── ui/            # 基础 UI 组件
│   ├── composables/       # 组合式函数
│   ├── pages/             # 页面路由
│   ├── stores/            # Pinia 状态
│   ├── server/
│   │   ├── api/           # Nitro API 路由
│   │   ├── core/          # 插件/主题/钩子系统
│   │   ├── db/            # Schema/迁移/连接
│   │   ├── services/      # 业务服务层
│   │   └── storage/       # 存储适配层
│   └── utils/             # 工具函数
├── packages/plugins/      # 独立插件包 (可选)
├── themes/                # 主题目录
└── docs/                  # 文档
```

---

## 五、常用命令速查

### 5.1 开发命令

```bash
# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
pnpm type-check

# 测试
pnpm test
pnpm test:coverage
```

### 5.2 数据库命令

```bash
# 生成迁移文件
pnpm db:generate

# 推送 Schema 到数据库
pnpm db:push

# 运行迁移
pnpm db:migrate

# 重置数据库
pnpm db:reset
```

### 5.3 部署命令

```bash
# Docker 构建
docker-compose build

# Docker 启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 六、文件创建位置指南

| 要创建什么    | 位置                            | 示例                         |
| ------------- | ------------------------------- | ---------------------------- |
| 新页面        | `apps/site/pages/`              | `pages/about.vue`            |
| 新组件        | `apps/site/components/`         | `components/ArticleCard.vue` |
| 新布局        | `apps/site/components/layouts/` | `layouts/BlogLayout.vue`     |
| Composable    | `apps/site/composables/`        | `composables/useArticle.ts`  |
| Store         | `apps/site/stores/`             | `stores/article.ts`          |
| API 路由      | `apps/site/server/api/`         | `server/api/articles.get.ts` |
| 中间件        | `apps/site/middleware/`         | `middleware/auth.ts`         |
| 工具函数      | `apps/site/utils/`              | `utils/formatDate.ts`        |
| 数据库 Schema | `apps/site/server/db/schema/`   | `schema/posts.ts`            |
| 新主题        | `themes/`                       | `themes/minimal/`            |
| 新插件        | `packages/plugins/`             | `packages/plugins/twikoo/`   |
| 文档          | `docs/`                         | `docs/plugin-dev-guide.md`   |

---

## 七、会话工作流程

### 7.1 开始新会话

1. **工具检查** - 确认 MCP/Skill/Teams 可用
2. **读取上下文** - 查看当前任务状态
3. **确认目标** - 与用户确认本次会话要完成的任务

### 7.2 开发流程

1. **理解需求** - 明确要实现的功能
2. **查找现有代码** - 先 read 相关代码，再修改
3. **小步迭代** - 每次修改后验证
4. **提交代码** - 使用约定式提交信息

### 7.3 结束会话

1. **总结进度** - 本次会话完成了什么
2. **记录待办** - 下次需要继续的工作
3. **提交代码** - 确保代码已提交

---

## 八、注意事项

### 8.1 避免的操作

- ❌ 不要删除或覆盖用户明确创建的文件
- ❌ 不要在未确认的情况下修改配置文件
- ❌ 不要使用 `any` 类型
- ❌ 不要提交敏感信息 (.env 文件等)

### 8.2 推荐的做法

- ✅ 先读取相关文件再修改
- ✅ 修改后运行测试验证
- ✅ 使用 TypeScript 严格模式
- ✅ 编写清晰的提交信息

---

## 九、GSD 工作流集成

### 9.1 可用命令

- `/gsd:new-project` - 初始化新项目
- `/gsd:add-phase` - 添加新 phase
- `/gsd:plan-phase` - 创建 phase 计划
- `/gsd:execute-phase` - 执行 phase
- `/gsd:progress` - 检查进度
- `/gsd:add-todo` - 添加待办事项
- `/gsd:verify-work` - 验证已完成工作

### 9.2 当前项目状态

- 项目已初始化：是
- 当前里程碑：Milestone 1
- 当前 Phase：待开始 (重新搭建)
- 下一阶段：Phase 1 - Monorepo 脚手架
- 本地测试模式：是 (不推送远端)

---

**最后更新**: 2026-04-30
**配置版本**: v2.0 (架构重构后)
