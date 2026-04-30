# A004: 渲染模式决策 — SSR + SPA 混合模式

**日期**: 2026-04-30
**状态**: 已采纳（保留原方案，记录注意事项）
**决策者**: ZhangYaZhou

---

## 背景

博客系统需要同时满足：
- 前台博客：SEO 友好、首屏快速加载 → 需要 SSR
- 后台管理：交互复杂、不需要 SEO → SPA 即可

## 方案

使用 Nuxt 3 的 `routeRules` 配置混合渲染模式：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 前台博客页面 — SSR
    '/': { prerender: true },
    '/articles/**': { swr: 3600 },
    '/categories/**': { swr: 3600 },
    '/tags/**': { swr: 3600 },
    '/pages/**': { swr: 3600 },
    '/about': { prerender: true },
    '/search': { ssr: true },

    // 后台管理 — SPA
    '/admin/**': { ssr: false },
  },
})
```

## 已知风险与应对

### 风险 1: JS Bundle 体积

后台 SPA 的 JS Bundle 会包含前台 SSR 的代码，Nuxt 不会自动按路由拆分。

**应对**: 后台页面使用 `defineAsyncComponent` 或 `lazy` 组件延迟加载后台专用组件，减少首屏 JS 体积。

### 风险 2: `<ClientOnly>` 使用场景

在 SSR 页面中使用 `<ClientOnly>` 会导致内容闪烁（先显示空白，hydration 后再填充）。

**应对**:
- 前台页面尽量避免 `<ClientOnly>`
- 插件渲染优先使用 Vue 组件方式（支持 SSR）
- 必须用 `<ClientOnly>` 的场景加 loading 状态

### 风险 3: 服务端/客户端代码边界

某些代码只能在客户端运行（操作 DOM、访问 window），某些只能在服务端运行（数据库查询）。

**应对**:
- 使用 `import.meta.client` / `import.meta.server` 判断环境
- API 路由始终在服务端执行
- 插件的 `onMount` 等 DOM 操作用 `<ClientOnly>` 包裹

### 风险 4: 缓存策略一致性

SSR 页面和 SPA 页面的缓存策略不同，可能导致数据不一致。

**应对**: 统一通过 API 层获取数据，前端缓存策略由 `useFetch` composable 统一管理。

## 决策理由

虽然有上述风险，但混合模式是 Nuxt 3 的原生支持方案，相比以下替代方案更优：

| 方案 | 优点 | 缺点 |
|------|------|------|
| **全 SSR** | 统一、简单 | 后台页面不需要 SSR，浪费资源 |
| **全 SPA** | 简单 | 前台无 SSR，SEO 差，首屏慢 |
| **独立部署 (SSR + 独立 SPA)** | 完全解耦 | 部署复杂、跨域问题、代码重复 |
| **混合模式 (当前方案)** | 各取所需 | 需注意上述风险 |

## 结论

保留混合模式方案，开发时注意上述风险点。如遇到无法解决的问题，可降级为全 SPA 模式（SEO 通过预渲染补充）。

---

**相关文档**: [架构方案 - 数据流架构](../architecture.md#22-数据流架构图)
