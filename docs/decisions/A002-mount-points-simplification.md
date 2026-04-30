# A002: 挂载点精简 — 19 个 → 6 个

**日期**: 2026-04-30
**状态**: 已采纳
**决策者**: ZhangYaZhou

---

## 背景

插件系统通过挂载点（Mount Point）将插件组件注入到页面的指定位置。原方案设计了 19 个标准挂载点。

## 原方案 (19 个挂载点)

```
head-start, head-end,
body-start, body-end,
header-start, header-end,
nav-start, nav-end,
main-start,
sidebar-start, sidebar-end,
post-start, post-end,
comment-before, comment-after,
footer-start, footer-end,
global-floating
```

## 问题

1. **维护成本高** — 每个挂载点需要独立的渲染逻辑、状态管理、生命周期处理
2. **使用频率不均** — 大多数第三方服务只用 2-3 个位置
3. **过度设计** — 个人博客不需要 19 个精确注入点
4. **Vue 机制冗余** — 部分挂载点（如 header-start/end）可以用 Vue 的 named slots 替代

## 决策

MVP 阶段保留 **6 个高频挂载点**，其余记录在本文档中，后续按需恢复。

## 保留的挂载点 (6 个)

| 挂载点 | 位置 | 典型用途 | 使用频率 |
|--------|------|---------|---------|
| `head-end` | `</head>` 前 | 统计脚本、SEO meta、自定义 link | ★★★★★ |
| `header-end` | Header 组件末尾 | 搜索框、用户按钮、暗黑模式切换 | ★★★★ |
| `post-end` | 文章正文后 | 评论系统、打赏、相关推荐 | ★★★★★ |
| `sidebar` | 侧边栏区域 | 文章目录、标签云、热门文章 | ★★★★ |
| `footer-start` | Footer 组件前 | 站点信息扩展、订阅框 | ★★★ |
| `body-end` | `</body>` 前 | 全局悬浮按钮（回到顶部、客服） | ★★★★ |

## 暂缓的挂载点 (13 个)

以下挂载点已从实现中移除，但保留设计文档，后续按需恢复：

| 挂载点 | 原用途 | 恢复条件 |
|--------|--------|---------|
| `head-start` | `<head>` 开始位置注入 meta | 需要大量自定义 meta 标签时 |
| `body-start` | `<body>` 开始位置 | 需要全局遮罩/加载动画时 |
| `header-start` | Header 组件开始 | 需要顶部公告栏时 |
| `nav-start` | 导航栏开始 | 需要导航栏前插入内容时 |
| `nav-end` | 导航栏结束 | 需要导航栏后插入内容时 |
| `main-start` | 主内容区开始 | 需要内容区顶部通知时 |
| `sidebar-start` | 侧边栏开始 | 需要侧边栏顶部特殊组件时 |
| `sidebar-end` | 侧边栏结束 | 需要侧边栏底部特殊组件时 |
| `post-start` | 文章正文前 | 需要文章顶部提示/目录时（可用 sidebar 替代） |
| `comment-before` | 评论区前 | 需要评论前插入提示时 |
| `comment-after` | 评论区后 | 需要评论后插入内容时 |
| `footer-end` | Footer 组件结束 | 需要页脚后插入版权信息时 |
| `global-floating` | 全局悬浮组件 | 合并到 `body-end` |

## 实施

- 挂载点类型定义只包含 6 个值
- `PluginMount.vue` 组件只处理 6 个挂载点
- 文档和示例基于 6 个挂载点编写

## 恢复流程

当需要恢复某个挂载点时：
1. 在 `server/core/plugin/types.ts` 的 `MountPoint` 类型中添加
2. 在 `components/modules/PluginMount.vue` 中添加渲染逻辑
3. 更新本文档状态

---

**相关文档**: [架构方案 - 插件系统](../architecture.md#43-插件系统详解)
