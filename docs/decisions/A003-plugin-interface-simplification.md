# A003: 插件适配器接口精简

**日期**: 2026-04-30
**状态**: 已采纳
**决策者**: ZhangYaZhou

---

## 背景

插件系统的核心是 `PluginAdapter` 接口，定义了插件的元信息、配置、挂载点、生命周期等。

## 原方案 (11 个字段)

```typescript
interface PluginAdapter {
  meta: PluginMeta              // 元信息
  configSchema: ConfigSchema    // 配置 Schema
  mountPoints: MountPoint[]     // 挂载点
  component?: AsyncComponentLoader  // Vue 组件 (SSR)
  onInit?(config): Promise<void>    // 初始化
  onMount?(container, config): void // 挂载
  onUnmount?(): void                // 卸载
  onConfigChange?(new, old): void   // 配置变更
  serverRoutes?: ServerRoute[]      // 服务端路由
  dependencies?: string[]           // 依赖
  conflicts?: string[]              // 冲突
}
```

## 问题

1. **90% 的插件用不到生命周期钩子** — 大多数插件只需要"配置 + 渲染"
2. **dependencies/conflicts 很少使用** — 个人博客的插件通常独立运行
3. **serverRoutes 是高级功能** — 绝大多数插件不需要自建 API
4. **接口字段过多增加开发门槛** — 新插件开发者需要理解 11 个概念

## 决策

简化为 **核心接口 (5 个字段)** + **扩展接口 (可选)**。

## 简化后的接口

### 核心接口 (必须)

```typescript
interface PluginAdapter {
  /** 元信息 (name, label, type, version) */
  meta: PluginMeta
  /** 配置表单 Schema (后台自动生成配置界面) */
  configSchema: ConfigSchema
  /** 挂载到哪个位置 */
  mountPoints: MountPoint[]
  /** 渲染方式: Vue 组件 (SSR 安全) 或 脚本注入 (纯客户端) */
  component?: AsyncComponentLoader
  onMount?(container: HTMLElement, config: Record<string, any>): void
}
```

### 扩展接口 (可选，按需实现)

```typescript
interface PluginAdapterExtended extends PluginAdapter {
  /** 插件初始化 (加载外部 SDK 等) */
  onInit?(config: Record<string, any>): Promise<void>
  /** 插件卸载清理 */
  onUnmount?(): void
  /** 配置变更回调 */
  onConfigChange?(newConfig: Record<string, any>, oldConfig: Record<string, any>): void
  /** 自定义服务端 API 路由 */
  serverRoutes?: ServerRoute[]
  /** 依赖的其他插件 */
  dependencies?: string[]
  /** 冲突的插件 */
  conflicts?: string[]
}
```

## 对比

| 字段 | 原方案 | 简化后 | 说明 |
|------|--------|--------|------|
| `meta` | 必须 | 必须 | 核心信息 |
| `configSchema` | 必须 | 必须 | 配置表单 |
| `mountPoints` | 必须 | 必须 | 挂载位置 |
| `component` | 可选 | 可选 | Vue 组件渲染 |
| `onMount` | 可选 | 可选 | DOM 渲染 |
| `onInit` | 可选 | **扩展** | 加载 SDK 等 |
| `onUnmount` | 可选 | **扩展** | 清理资源 |
| `onConfigChange` | 可选 | **扩展** | 配置变更 |
| `serverRoutes` | 可选 | **扩展** | 自建 API |
| `dependencies` | 可选 | **扩展** | 插件依赖 |
| `conflicts` | 可选 | **扩展** | 插件冲突 |

## 实施

- 核心接口在 `server/core/plugin/types.ts` 中定义
- 扩展接口通过 TypeScript 的 `Partial<>` 或继承实现
- 插件管理器只依赖核心接口，扩展功能通过类型守卫按需调用
- 文档示例基于核心接口编写

## 示例

**简单插件 (只需要核心接口)**:

```typescript
const myPlugin: PluginAdapter = {
  meta: { name: 'back-to-top', label: '回到顶部', type: 'feature', version: '1.0.0' },
  configSchema: {},
  mountPoints: ['body-end'],
  component: () => import('./BackToTop.vue'),
}
```

**复杂插件 (使用扩展接口)**:

```typescript
const twikooPlugin: PluginAdapter = {
  meta: { name: 'twikoo', label: 'Twikoo 评论', type: 'comment', version: '1.6.0' },
  configSchema: { envId: { type: 'string', label: '环境 ID', required: true } },
  mountPoints: ['post-end'],
  component: () => import('./TwikooComment.vue'),
  // 扩展功能
  async onInit(config) {
    await loadScript('https://cdn.jsdelivr.net/npm/twikoo/dist/twikoo.all.min.js')
  },
  onUnmount() {
    ;(window as any).twikoo?.destroy?.()
  },
}
```

---

**相关文档**: [架构方案 - 插件接口定义](../architecture.md#431-插件接口定义-typescript)
