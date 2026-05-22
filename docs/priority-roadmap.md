# 优先级路线图 (Priority Roadmap)

> 最后更新: 2026-05-12
> 状态: 活跃开发中

---

## 一、当前项目状态概览

### 已完成 (Stable)

| 模块 | 状态 | 备注 |
|------|------|------|
| Monorepo 脚手架 | ✅ 完成 | pnpm workspace 正常运行 |
| 数据库层 | ✅ 完成 | Drizzle ORM + SQLite (WAL) |
| API 层 | ✅ 完成 | Nitro 路由 + 服务层 |
| 后台管理 - 文章 | ✅ 完成 | CRUD + Vditor 编辑器 + 批量导入 |
| 后台管理 - 页面 | ✅ 完成 | 新建/编辑/列表 |
| 后台管理 - 登录 | ✅ 完成 | JWT + localStorage 持久化 |
| 后台管理 - 分类/标签 | ✅ 完成 | 可视化管理 |
| 后台管理 - 媒体库 | ✅ 完成 | 上传/预览/筛选/批量操作/视图切换 |
| 后台管理 - 主题配置 | ✅ 完成 | 配色/字体/间距/圆角配置面板 |
| 后台管理 - 插件管理 | ✅ 完成 | 插件列表/启用/禁用 |
| 媒体库存储 | ✅ 完成 | 数据库 blob 存储，替代文件系统 |
| 前台博客 - 首页 | ✅ 完成 | 文章列表 + 分页 |
| 前台博客 - 文章详情 | ✅ 完成 | Markdown 渲染 + 代码高亮 + 卡片容器 |
| 前台 - 导航栏 | ✅ 完成 | 动态页面导航 |
| 前台 - 深色模式 | ✅ 完成 | 布局支持 + 主题切换 |
| 插件系统 - 后端 | ✅ 完成 | 插件注册/启用/禁用/Hooks |
| 插件系统 - 前端挂载点 | ✅ 完成 | 6 个挂载点 + PluginRenderer |
| CSS 变量迁移 | ✅ 完成 | 后台 variables.css + UnoCSS 主题映射 |

### 进行中 (In Progress)

| 模块 | 状态 | 备注 |
|------|------|------|
| 插件系统完善 | ⚠️ 进行中 | 页面自动注册、热重载 |

### 待开发 (Planned)

| 模块 | 优先级 | 备注 |
|------|--------|------|
| 插件管理后台 UI | P1 | 需要更完善的 CRUD 界面 |
| 插件热重载机制 | P2 | 开发体验优化 |
| 插件沙箱隔离 | P2 | 安全增强 |
| 双编辑器 (TipTap) | P2 | 按需扩展 |
| 测试覆盖 | P2 | 单元测试 + E2E |
| 主题系统 - 组件覆盖 | P3 | 技术难度大，CSS 变量覆盖已够用 |
| 部署文档 | P3 | Docker + 用户文档 |

**已完成验证**：friends-links 插件 ✅ — 页面自动注册 + 导航栏显示正常

---

## 二、主题系统 (已完成)

### 2.1 设计理念

`apps/site/` 前台博客本身就是**默认主题**，基于 CSS 变量系统实现主题配置。

```
apps/site/  → 默认主题（内置）
CSS 变量    → 主题配置（颜色、字体、间距、圆角等）
后台配置面板 → 主题配置界面
```

### 2.2 核心概念

| 概念 | 实现 | 说明 |
|------|------|------|
| 主题包 | `apps/site/` | 前台所有页面即为主题 |
| 主题配置 | CSS 变量 | `assets/css/variables.css` |
| 配置面板 | 后台主题管理 | 配色、字体、间距、圆角等 |
| 主题切换 | API 持久化 | 保存不同配置方案 |

### 2.3 当前状态

| 功能 | 状态 | 说明 |
|------|------|------|
| CSS 变量系统 | ✅ 已完成 | 颜色、字体、间距、圆角、阴影等 |
| 主题配置面板 | ✅ 已完成 | 后台可视化配置 |
| 深色模式 | ✅ 已完成 | 布局切换 + 主题配置 |
| 主题预设 | 🔜 可选 | 保存/加载配置方案 |

### 2.4 技术说明

组件级覆盖（替换前台组件）在 Nuxt 3 中技术难度较大，因为组件解析基于目录优先级。CSS 变量已能覆盖大部分主题定制需求，组件级覆盖作为可选扩展（优先级 P3）。

---

## 三、插件系统状态 (P1 - 中优先级)

### 3.1 已完成功能

| 功能 | 状态 | 文件 |
|------|------|------|
| 插件注册/启用/禁用 | ✅ | `server/core/plugin/` |
| 插件 Hooks 执行 | ✅ | `server/core/plugin/hooks.ts` |
| 前端挂载点 | ✅ | `components/mount-points/` |
| PluginRenderer | ✅ | `components/plugins/PluginRenderer.vue` |
| 插件管理后台 | ✅ | `pages/admin/plugins.vue` |

### 3.2 挂载点列表

| 挂载点 | 组件 | 用途 |
|--------|------|------|
| header-end | `MountPointHeaderEnd.vue` | 头部导航后 |
| sidebar | `MountPointSidebar.vue` | 侧边栏 |
| post-end | `MountPointPostEnd.vue` | 文章详情末尾 |
| footer-start | `MountPointFooterStart.vue` | 页脚开始 |
| body-end | `MountPointBodyEnd.vue` | body 末尾 |
| head-end | `MountPointHeadEnd.vue` | head 末尾 |

### 3.3 当前插件

| 插件名 | 类型 | 挂载点 | 状态 |
|--------|------|--------|------|
| test-hello | 测试插件 | sidebar | ✅ 已验证 |
| friends-links | 友链页面 | page | ✅ 已验证 — 页面注册+导航栏显示正常 |

### 3.4 待完善

- [ ] 插件启用时自动注册页面路由
- [ ] 插件热重载机制
- [ ] 插件沙箱隔离

---

## 四、已完成功能详情 (2026-05-12)

### 4.1 媒体库数据库存储

**问题**: 之前媒体文件存储在文件系统，部署时不方便
**解决方案**: 改为数据库 blob 存储

| 文件 | 说明 |
|------|------|
| `server/db/schema/media.ts` | 添加 `data: blob()` 和 `storageType: database` |
| `server/services/media.service.ts` | upload 存 DB，getFileByFilename 读取 |
| `server/api/media/[filename].get.ts` | 新增文件下载 endpoint |
| `server/middleware/auth.ts` | GET /api/media/:filename 公开访问 |

### 4.2 文章导入功能

**功能**: 支持批量导入 Markdown 文件

| 文件 | 说明 |
|------|------|
| `server/api/articles/import.post.ts` | 解析 frontmatter，支持 title/slug/excerpt/status |
| `pages/admin/articles/index.vue` | 添加导入按钮和结果展示 |

### 4.3 前台文章样式优化

**问题**: 使用不存在的 Tailwind Typography 插件
**解决方案**: 使用原生 CSS 重写

| 文件 | 说明 |
|------|------|
| `components/blog/ArticleContent.vue` | 原生 CSS 渲染 Markdown，支持代码高亮 |
| `pages/articles/[year]/[month]/[id].vue` | 添加文章卡片容器，max-w-3xl 居中 |

### 4.4 CSS 变量迁移

**完成项**:
- `assets/css/variables.css` — 后台专用 warm CSS 变量
- `uno.config.ts` — UnoCSS 颜色映射到 CSS 变量
- `layouts/admin/default.vue` — 后台布局导入 variables.css

---

## 五、技术债务清单

### 5.1 高优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 无测试覆盖 | 回归风险高 | 添加 Vitest 单元测试 |
| 错误处理不完善 | 用户体验差 | 统一错误边界 |

### 5.2 中优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 组件缺少类型定义 | IDE 支持弱 | 补充 TypeScript 类型 |
| API 响应格式不统一 | 前端处理复杂 | 标准化响应格式 |
| 缺少 loading 状态 | 体验差 | 添加骨架屏 |
| 插件热重载缺失 | 开发体验差 | 实现文件监听 + 重载 |

### 5.3 低优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 代码注释不足 | 维护困难 | 补充关键注释 |
| README 过时 | 新人上手难 | 更新文档 |
| 部署文档缺失 | 用户部署难 | Docker + 一键部署 |

---

## 六、下一步行动计划

### 立即执行

1. **验证 friends-links 插件**
   - 确认友链在文章详情页显示

2. **完善插件管理 UI**
   - 插件配置表单渲染
   - 插件市场（可选）

### 短期目标 (1-2 周内)

3. **插件增强**
   - 自动注册页面路由
   - 插件热重载

### 中期目标 (1 个月内)

5. **双编辑器支持**
   - TipTap 富文本编辑器

6. **测试覆盖**
   - Vitest 单元测试
   - Playwright E2E 测试

---

## 七、架构决策记录

| 决策 | 日期 | 原因 |
|------|------|------|
| 媒体库数据库存储 | 2026-05-12 | 部署更便捷， portability 更好 |
| 移除文件系统存储 | 2026-05-12 | 与数据库存储重复 |
| 后台 CSS 变量分离 | 2026-05-09 | 前后台主题系统独立 |
| 媒体库公开下载 | 2026-05-12 | 允许前台直接访问媒体文件 |
| 文章导入功能 | 2026-05-12 | 支持批量导入 Markdown |
| 前台文章卡片容器 | 2026-05-12 | 提升阅读体验，边界清晰 |

---

## 八、相关文档

- [架构文档](./architecture.md) — 整体架构设计
- [决策记录](./decisions/) — 详细决策文档
- [项目愿景](./project-vision.md) — 项目定位和目标

---

**维护者**: ZhangYaZhou
**项目**: My Blog (Nuxt 3)
**仓库**: v2 分支
