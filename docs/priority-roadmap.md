# 优先级路线图 (Priority Roadmap)

> 最后更新: 2026-05-08
> 状态: 活跃开发中

---

## 一、当前项目状态概览

### 已完成 (Stable)

| 模块 | 状态 | 备注 |
|------|------|------|
| Monorepo 脚手架 | ✅ 完成 | pnpm workspace 正常运行 |
| 数据库层 | ✅ 完成 | Drizzle ORM + SQLite (WAL) |
| API 层 | ✅ 完成 | Nitro 路由 + 服务层 |
| 后台管理 - 文章 | ✅ 完成 | CRUD + Vditor 编辑器 |
| 后台管理 - 页面 | ✅ 完成 | 新建/编辑/列表 (2026-05-08 修复) |
| 后台管理 - 登录 | ✅ 完成 | JWT + localStorage 持久化 (2026-05-08 修复) |
| 前台博客 - 首页 | ✅ 完成 | 文章列表 + 分页 |
| 前台博客 - 文章详情 | ✅ 完成 | SSR 渲染 |
| 前台 - 导航栏 | ✅ 完成 | 动态页面导航 (2026-05-08 修复) |
| 插件系统 - 后端 | ✅ 完成 | 插件注册/启用/禁用 |
| 插件系统 - 前端 | ⚠️ 基本可用 | 挂载点渲染已修复，待增强 |

### 进行中 (In Progress)

| 模块 | 状态 | 备注 |
|------|------|------|
| 主题系统 - 架构设计 | 📋 已规划 | 见下方详细设计 |
| 插件系统 - 前台效果 | ⚠️ 部分可用 | test-hello 插件已渲染，friends-links 待验证 |

### 待开发 (Planned)

| 模块 | 优先级 | 备注 |
|------|--------|------|
| 主题系统 - 覆盖机制 | P0 | 核心架构功能 |
| 插件管理后台 UI | P1 | 需要 CRUD 界面 |
| 双编辑器 (TipTap) | P2 | 按需扩展 |
| 测试覆盖 | P2 | 单元测试 + E2E |
| 部署文档 | P3 | Docker + 用户文档 |

---

## 二、主题系统架构 (P0 - 高优先级)

### 2.1 设计理念

采用 **Hexo + Butterfly** 模式:

```
apps/site/  → 骨骼和肌肉 (默认主题，内置)
themes/     → 皮肤和衣服 (覆盖层，可选)
```

### 2.2 核心概念

| 层级 | 目录 | 作用 | 类比 |
|------|------|------|------|
| 基础层 | `apps/site/` | 提供完整默认实现 | 骨骼 + 肌肉 |
| 覆盖层 | `themes/xxx/` | 覆盖特定文件 | 皮肤 + 衣服 |

### 2.3 覆盖机制设计

```
themes/
└── butterfly/           # 主题名称
    ├── manifest.json    # 主题元信息
    ├── components/      # 覆盖 apps/site/components/ 下的组件
    │   ├── layouts/
    │   │   └── BlogLayout.vue   # 覆盖默认布局
    │   └── modules/
    │       └── ArticleCard.vue  # 覆盖文章卡片
    ├── pages/           # 覆盖或新增页面
    │   └── index.vue    # 覆盖首页
    ├── styles/
    │   └── variables.css # CSS 变量覆盖
    └── assets/          # 主题专属资源
        └── images/
```

### 2.4 实现优先级

1. **P0-1**: 主题配置读取 (manifest.json)
2. **P0-2**: CSS 变量覆盖机制
3. **P0-3**: 组件覆盖解析器
4. **P0-4**: 主题切换 API

### 2.5 当前状态

- `apps/site/themes/` 目录已删除 (无用)
- `themes/` 根目录已删除 (无用)
- 覆盖机制 **尚未实现**
- 现有样式为硬编码，需迁移到 CSS 变量

---

## 三、插件系统状态 (P1 - 中优先级)

### 3.1 已修复问题 (2026-05-08)

| 问题 | 修复方案 | 影响文件 |
|------|----------|----------|
| 挂载点组件命名冲突 | 移至 `components/mount-points/` | 6 个 MountPoint 组件 |
| PluginMount 脚本不执行 | 移除 ClientOnly，简化渲染逻辑 | `PluginMount.vue` |
| PluginRenderer 未传递 scriptContent | 添加 scriptContent prop 传递 | `PluginRenderer.vue` |
| 类型声明缺失 | 新增 `types/plugin.d.ts` | `window.__PLUGIN_CONFIG__` |

### 3.2 当前插件

| 插件名 | 类型 | 挂载点 | 效果 |
|--------|------|--------|------|
| test-hello | 测试插件 | sidebar | 浮动问候消息 |
| friends-links | 友链页面 | post-end | 友链列表 (待验证) |

### 3.3 待完善

- [ ] 插件管理后台 UI (CRUD 界面)
- [ ] 插件启用时自动注册页面 (friends-links)
- [ ] 插件热重载机制
- [ ] 插件沙箱隔离

---

## 四、近期修复记录 (2026-05-08)

### 4.1 新建页面功能

**问题**: 点击"新建页面"后无反应
**原因**: 模板字符串包含 `<template>` 标签导致 Vue 解析器无限循环 (内存溢出)
**修复**: 移除模板字符串中的 Vue SFC 标签，使用纯 HTML
**文件**: `pages/admin/pages/new.vue`

### 4.2 登录状态持久化

**问题**: 刷新页面后需要重新登录
**原因**: SSR 中间件在客户端恢复认证前执行
**修复**:
1. 新建 `plugins/auth.client.ts` 从 localStorage 恢复认证
2. 中间件添加 `if (import.meta.server) return` 跳过 SSR 检查
**文件**: `plugins/auth.client.ts`, `middleware/admin-auth.ts`

### 4.3 导航栏显示

**问题**: 导航栏显示 slug 而非标题
**原因**: API `getNavPages` 未返回 `title` 字段
**修复**: 查询添加 title 字段，回退逻辑改为 `navLabel > title > slug`
**文件**: `server/services/page.service.ts`, `layouts/default.vue`, `layouts/dark.vue`

### 4.4 前台页面渲染

**问题**: 动态页面内容为空
**原因**: `DynamicPageRenderer` 期望 SFC 格式但收到纯 HTML
**修复**: 添加回退逻辑 `templateMatch?.[1] || props.code`
**文件**: `components/DynamicPageRenderer.vue`

---

## 五、技术债务清单

### 5.1 高优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 样式硬编码 | 无法主题切换 | 迁移到 CSS 变量 |
| 无测试覆盖 | 回归风险高 | 添加 Vitest 单元测试 |
| 错误处理不完善 | 用户体验差 | 统一错误边界 |

### 5.2 中优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 组件缺少类型定义 | IDE 支持弱 | 补充 TypeScript 类型 |
| API 响应格式不统一 | 前端处理复杂 | 标准化响应格式 |
| 缺少 loading 状态 | 体验差 | 添加骨架屏 |

### 5.3 低优先级

| 项目 | 影响 | 建议方案 |
|------|------|----------|
| 代码注释不足 | 维护困难 | 补充关键注释 |
| README 过时 | 新人上手难 | 更新文档 |

---

## 六、下一步行动计划

### 立即执行 (本周)

1. **验证插件渲染**
   - 启动开发服务器
   - 确认 test-hello 插件在侧边栏显示
   - 验证 friends-links 友链页面

2. **CSS 变量迁移准备**
   - 盘点现有硬编码样式
   - 设计变量命名规范
   - 创建 `styles/variables.css` 基础结构

### 短期目标 (2 周内)

3. **主题覆盖机制 - P0-1**
   - 实现 manifest.json 读取
   - 创建主题配置 API

4. **主题覆盖机制 - P0-2**
   - 实现 CSS 变量覆盖
   - 支持运行时切换

### 中期目标 (1 个月内)

5. **组件覆盖解析器**
   - 实现文件级覆盖
   - 支持新增页面/组件

6. **插件管理后台**
   - CRUD 界面
   - 启用/禁用即时生效

---

## 七、架构决策记录

| 决策 | 日期 | 原因 |
|------|------|------|
| 移除 apps/site/themes/ | 2026-05-08 | 与根目录 themes/ 功能重复 |
| 移除根目录 themes/default | 2026-05-08 | 未实现覆盖机制，空壳无用 |
| 采用 CSS 变量主题方案 | 2026-05-08 | 运行时切换，性能好 |
| 插件挂载点移至 mount-points/ | 2026-05-08 | 避免 Nuxt 保留目录冲突 |
| 登录状态客户端恢复 | 2026-05-08 | SSR 无法访问 localStorage |

---

## 八、相关文档

- [架构文档](./architecture.md) - 整体架构设计
- [决策记录](./decisions/) - 详细决策文档

---

**维护者**: ZhangYaZhou
**项目**: My Blog (Nuxt 3)
**仓库**: v2 分支
