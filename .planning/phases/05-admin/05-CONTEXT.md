# Phase 5: 后台管理 - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

实现后台管理 UI 和核心功能 — 为博客管理员提供可视化界面来管理文章、媒体、分类、标签、主题和插件。

**包含：**

- 登录页面和认证流程
- 后台布局（侧边栏导航 + 主内容区）
- 文章管理（列表、创建、编辑、删除、批量操作）
- 媒体库（上传、预览、管理、插入）
- 分类管理（CRUD、树形结构）
- 标签管理（CRUD、使用统计）
- 主题管理（切换、预览、配置）
- 插件管理（列表、启用/禁用、配置）
- 设置页面（基础站点配置）

**不包含：**

- 双编辑器集成（TipTap + Vditor）— Phase 9
- 仪表盘/数据统计 — 后续 Phase
- 评论管理 — v2 需求
- 移动端深度适配 — Phase 5 桌面优先

</domain>

<decisions>
## Implementation Decisions

### 布局与导航

- **布局结构**：侧边栏导航 + 主内容区经典布局
- **导航组织**：分组式导航，按功能分组（内容管理、系统管理等），支持收起/展开
- **响应式**：桌面优先（≥1024px），预留平板/移动端扩展接口

### 视觉风格

- **风格定位**：现代极简 + 亲和力结合
  - 圆角卡片（border-radius: 8-12px）
  - 微妙阴影（subtle shadow）
  - 温暖配色（在专业感中加入温暖元素）
  - 适度留白

- **UI 组件系统**：shadcn-vue（基于 Radix UI + Tailwind CSS）
  - 与现有 Tailwind 方案完美集成
  - 源码复制到 `apps/site/components/ui/`
  - 类型安全，Vue 3 友好

- **深色模式**：Phase 5 仅实现浅色主题，但所有颜色使用 CSS 变量，预留深色模式切换接口

### 交互行为

- **数据加载**：渐进式加载 — 列表逐行淡入，避免骨架屏或 loading 转圈
- **表单验证**：实时验证 — 输入框失焦时立即验证
- **上传反馈**：独立进度条 — 每个文件显示独立进度和取消按钮
- **错误提示**：Toast 通知（顶部滑落）+ 内联错误（表单字段附近）结合
- **空状态**：插画风格 — 温暖友好的插画 + 引导文案 + 操作按钮
- **分页设计**：页码分页（1 2 3 ... 10），支持每页条数选择（10/20/50/100）

### 认证设计

- **Token 存储**：localStorage + Pinia store 管理
  - 登录后 token 存 localStorage
  - Pinia store 同步管理用户状态
  - 30 天免登录（与 JWT 过期时间一致）
  - Axios 拦截器自动添加 Authorization header

- **路由方案**：Nuxt 3 文件路由（约定式路由）
  - 目录：`apps/site/pages/admin/`
  - 登录页：`apps/site/pages/admin/login.vue`
  - 文章列表：`apps/site/pages/admin/posts/index.vue`
  - 文章编辑：`apps/site/pages/admin/posts/[id].vue`

### 编辑器策略

- **Phase 5**：简单编辑器（textarea 或 contentEditable）
  - 支持基础 Markdown 语法
  - 支持图片插入
  - 支持草稿自动保存

- **Phase 9**：升级到 TipTap（可视化）+ Vditor（Markdown）双编辑器

### 功能模块

#### 登录页面

- 用户名/邮箱 + 密码登录
- 记住登录状态（30 天）
- 错误提示：Toast 通知

#### 文章管理

- 文章列表：表格展示，支持分页、筛选（按分类/标签/状态）、搜索
- 文章创建/编辑：简单编辑器、分类选择、标签输入、封面图设置、SEO 字段
- 批量操作：批量删除、批量发布/下架
- 草稿管理：草稿箱、自动保存

#### 媒体库

- 上传：拖拽上传、多文件上传、独立进度条
- 管理：网格/列表视图切换、文件夹管理、预览、删除
- 插入：选择图片插入文章

#### 分类管理

- 基础 CRUD
- 树形结构展示
- 拖拽排序、父子关系调整

#### 标签管理

- 基础 CRUD
- 使用频率统计

#### 主题管理

- 主题列表：网格展示
- 主题预览：缩略图预览
- 主题切换：一键切换
- 主题配置：颜色、字体等配置

#### 插件管理

- 插件列表：显示已安装插件
- 启用/禁用：开关控制
- 插件配置：配置表单

#### 设置页面

- 基础站点设置：站点名称、描述、Logo、SEO 设置
- 用户设置：修改密码、个人资料

### 快捷键

- Phase 5 暂不实现快捷键系统，后续 Phase 统一规划

### 设计流程

- **Pencil + Skill 组合**：
  1. 使用 `mcp__pencil__batch_design` 创建整体布局线框图
  2. 使用 `ui-ux-pro-max` skill 获取具体组件设计灵感
  3. 按设计稿编码实现
  4. 使用 `mcp__pencil__get_screenshot` 截图对比验证

- **设计文件位置**：`docs/design/phase-05/` 目录存放 .pen 设计文件

### 测试策略

- **单元测试优先**：使用 Vitest 编写组件单元测试
- **测试重点**：
  - 组件渲染正确性
  - 用户交互响应
  - 表单验证逻辑
  - API 调用处理
- **E2E 测试**：留给 Phase 10 统一实现

### 联调方式

- **真实 API**：直接对接 Phase 4 已完成的 API
- **API 基础**：
  - `/api/v1/auth/*` — 认证
  - `/api/v1/posts/*` — 文章
  - `/api/v1/categories/*` — 分类
  - `/api/v1/tags/*` — 标签
  - `/api/v1/media/*` — 媒体
  - `/api/v1/themes/*` — 主题
  - `/api/v1/plugins/*` — 插件

### 技术栈

- **框架**：Nuxt 3 + Vue 3 Composition API
- **语言**：TypeScript 严格模式
- **样式**：Tailwind CSS + CSS Variables
- **组件**：shadcn-vue (Radix UI primitives)
- **状态管理**：Pinia
- **HTTP 请求**：ofetch / Axios
- **图标**：Lucide Icons 或 Heroicons

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- **Phase 4 API** — 完整的 CRUD API 已就绪
  - `apps/site/server/api/v1/posts/*` — 文章 API
  - `apps/site/server/api/v1/categories/*` — 分类 API
  - `apps/site/server/api/v1/tags/*` — 标签 API
  - `apps/site/server/api/v1/media/*` — 媒体 API
  - `apps/site/server/api/v1/auth/*` — 认证 API
  - `apps/site/server/api/v1/themes/*` — 主题 API
  - `apps/site/server/api/v1/plugins/*` — 插件 API

- **API 响应格式** — 统一响应格式
  - `createSuccessResponse()`, `createErrorResponse()`
  - `createPaginationResponse()`

- **认证中间件** — `auth.ts` 中间件
  - `requireAuth()`, `optionalAuth()`, `requireRole()`
  - JWT Token 验证（30 天过期）

- **数据库 Schema** — `packages/database/src/schema/*`
  - users, posts, categories, tags, media, post_tags 等完整 Schema

- **主题系统** — `packages/core/src/theme/ThemeManager.ts`
  - CSS Variables 主题切换
  - 主题配置管理

- **Composables** — `apps/site/composables/useTheme.ts`
  - 现有主题 composable

### Established Patterns

- **Drizzle ORM 类型**：`type User = typeof users.$inferSelect`
- **服务层模式**：API handler → service layer → database
- **验证模式**：Zod schema + `validateRequestBody()`
- **错误处理**：统一错误中间件 + HTTPError 类
- **响应格式**：`{ success: true, data: ... }`

### Integration Points

- **认证集成**：前台页面需要 JWT token 认证
- **API 调用**：前端调用现有 API 端点
- **主题集成**：使用现有 ThemeManager
- **数据库访问**：通过 `@my-blog/database` 包

</code_context>

<specifics>
## Specific Ideas

- "现代极简加亲和力二者结合" — 视觉风格指导原则
- "不想频繁登录" — Token 存储要求（30 天免登录）
- "需要你在 UI 开发时时时刻刻调用 skills 和 pencil mcp" — UI 开发流程要求
- "功能范围：主题管理和插件管理也是核心功能" — 功能边界确认
- "简单编辑器" — Phase 5 编辑器策略
- "暂不实现快捷键，后续实现" — 快捷键决策
- "页面路由我不懂你自行决定" — 路由方案由 Claude 决定（选择 Nuxt 3 文件路由）

</specifics>

<deferred>
## Deferred Ideas

- **双编辑器集成**：TipTap 可视化 + Vditor Markdown — Phase 9
- **仪表盘/数据统计**：访问量统计、热门文章排行 — 后续 Phase
- **评论管理**：内置评论或第三方评论集成 — v2 需求
- **移动端深度适配**：完整响应式支持 — 后续 Phase
- **深色模式实现**：深色主题切换功能 — 后续 Phase（CSS 变量已预留）
- **快捷键系统**：Ctrl+N、Ctrl+S、Ctrl+K 等 — 后续 Phase
- **E2E 测试**：Playwright E2E 测试 — Phase 10
- **归档功能**：文章归档 API — 后续 Phase
- **定时发布**：定时任务触发 — 后续 Phase
- **全文搜索**：SQLite FTS5 升级 — 后续 Phase

</deferred>

---

_Phase: 05-admin_
_Context gathered: 2026-03-23_
