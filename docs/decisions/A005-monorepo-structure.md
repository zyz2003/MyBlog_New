# A005: Monorepo 结构决策

**日期**: 2026-04-30
**状态**: 已采纳（保留 Monorepo，但精简包结构）
**决策者**: ZhangYaZhou

---

## 背景

项目使用 pnpm workspace 管理多包，需要决定哪些代码放在独立包中。

## 原方案

```
my-blog/
├── apps/site/         # 主应用
├── packages/core/     # 核心框架包 (插件/主题/钩子系统)
├── packages/database/ # 数据库包 (Schema/迁移)
└── packages/plugins/  # 独立插件包
```

## 问题

`packages/core` 和 `packages/database` 只被 `apps/site` 一个应用消费，拆分为独立包增加了：
- 跨包引用的配置复杂度
- 构建脚本的维护成本
- 开发时的热更新延迟

## 决策

- **移除** `packages/core` — 核心系统移入 `apps/site/server/core/`
- **移除** `packages/database` — 数据库层移入 `apps/site/server/db/`
- **保留** `packages/plugins/` — 独立插件包保留，用于复杂插件的独立开发
- **保留** pnpm workspace — 为未来扩展预留

## 当前结构

```
my-blog/
├── apps/site/              # 主应用 (包含所有核心代码)
│   └── server/
│       ├── core/           # 插件/主题/钩子系统
│       ├── db/             # Schema/迁移/连接
│       ├── services/       # 业务服务层
│       ├── storage/        # 存储适配层
│       └── api/            # API 路由
│
├── packages/plugins/       # 独立插件包 (可选)
│   ├── twikoo/
│   └── google-analytics/
│
└── themes/                 # 主题目录
```

## 扩展路径

当项目发展到需要多应用共享代码时：

```
阶段 1 (当前): 所有代码在 apps/site 内
    ↓
阶段 2 (多应用): 抽取共享代码到 packages/
    ├── packages/core/      ← 从 server/core/ 抽取
    ├── packages/database/  ← 从 server/db/ 抽取
    └── packages/ui/        ← 从 components/ui/ 抽取
    ↓
阶段 3 (生态): 完整的包生态
    ├── @my-blog/core       ← npm 发布
    ├── @my-blog/database   ← npm 发布
    └── @my-blog/ui         ← npm 发布
```

## pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

保留此配置，确保未来扩展时无需修改 Monorepo 结构。

---

**相关文档**: [架构方案 - 项目目录结构](../architecture.md#三项目目录结构)
