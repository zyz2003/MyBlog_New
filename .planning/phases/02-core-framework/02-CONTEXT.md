# Phase 2: 核心框架 - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

实现插件系统、主题系统、钩子系统核心架构。

**包含：**

- 插件系统核心架构（packages/plugin 独立包）
- 16 个插件挂载点实现
- 插件生命周期管理
- 主题系统核心架构
- CSS Variables 主题变量
- JSON 主题配置文件

**不包含：**

- 插件配置 UI（Phase 8）
- 官方插件开发（Phase 8）
- 主题预览功能（Phase 7）
- 默认主题完整实现（Phase 7）

</domain>

<decisions>
## Implementation Decisions

### 插件系统架构

- **包位置：** 独立的 `packages/plugin` 包（不与 core 耦合）
- **API 风格：** 导航守卫风格 API（类似 Vue Router：`(to, from, next)` 模式）
- **生命周期事件：** Claude's Discretion — 采用标准应用生命周期（init → mount → render → destroy）
- **注册方式：** `plugins.config.json` 配置文件注册
- **注册机制：** 混合模式（自动扫描 + 手动覆盖）
- **挂载点执行：** 混合模式（简单 hook 同步，复杂 hook 异步）
- **挂载点类型：** Claude's Discretion — 采用 TypeScript 类型安全枚举方式

### 主题系统架构

- **CSS Variables：** Claude's Discretion — 采用 `[data-theme]` 选择器方案（支持多主题并存，方便切换）
- **配置结构：** 分层结构（colors / typography / spacing 等分类）
- **默认主题：** Classic 经典博客风格
- **主题切换：** Claude's Discretion — 基于扩展性和方便性原则选择实现方案

### 插件配置存储

- **存储方案：** 混合存储
  - 运行时配置：SQLite 数据库（与数据库层统一）
  - 静态配置：JSON 文件
- **配置更新：** 热更新（修改后立即生效，无需重启）

### Claude's Discretion

以下区域由 Claude 在规划/实施时自行决定：

- 插件生命周期事件的具体设计和数量
- CSS Variables 的具体定义位置和组织方式
- 主题动态切换的具体实现机制
- 16 个挂载点的类型定义和命名
- 同步/异步挂载点的具体划分标准

</decisions>

<code_context>

## Existing Code Insights

### 项目当前状态

- **Monorepo 结构：** pnpm workspace，apps/site + packages/\* 架构
- **包别名已配置：** nuxt.config.ts 中已配置 `@my-blog/core`、`@my-blog/database` 等别名
- **TypeScript：** 严格模式当前为 `false`
- **现有包：** packages/core, packages/database, packages/utils, packages/types（骨架已创建）

### 复用资产

- **nuxt.config.ts：** 已建立配置模式，可扩展 plugins.config.json
- **TypeScript 基础：** 类型系统已就位，可用于插件类型定义

### 集成点

- 插件系统需要与 Nuxt 3 应用生命周期集成
- 主题系统需要与 Tailwind CSS 集成
- 插件配置需要与 SQLite 数据库层（Phase 3）集成

</code_context>

<specifics>
## Specific Ideas

- "方便随时更换" — 主题切换需要简单快速
- "扩展性强" — 架构设计需要考虑未来扩展
- 用户信任 Claude 在技术实现层面的决策

</specifics>

<deferred>
## Deferred Ideas

以下想法在讨论中被提及，但属于其他 Phase：

- **插件配置 UI** — Phase 8（插件系统完整功能）
- **主题预览功能** — Phase 7（主题系统完整功能）
- **默认主题完整实现** — Phase 7（Minimal + Classic 主题）
- **官方插件开发** — Phase 8（SEO 优化插件等）

</deferred>

---

_Phase: 02-core-framework_
_Context gathered: 2026-03-17 via /gsd:discuss-phase_
