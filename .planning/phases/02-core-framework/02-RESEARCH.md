# Phase 2: 核心框架 - Research

**Researched:** 2026-03-17
**Researcher:** Claude Code (gsd-phase-researcher)
**Status:** Complete

---

## Executive Summary

This research answers: **"What do I need to know to PLAN Phase 2 well?"**

Phase 2 requires building two independent but complementary systems:

1. **Plugin System** (`packages/plugin`) - Extensible architecture with 16 hook points
2. **Theme System** (part of `packages/core` or standalone) - CSS Variables-based theming

Key findings:

- Nuxt 3 提供了强大的插件系统基础（`plugins/` 目录 + `app:created` 等 hooks）
- 导航守卫模式 `(to, from, next)` 适合插件挂载点，但需要适配应用生命周期
- CSS Variables + `[data-theme]` 是最灵活的主题切换方案
- TypeScript 泛型 + 接口是类型安全插件 API 的核心

---

## 1. Nuxt 3 插件系统架构模式

### 1.1 Nuxt 3 原生插件机制

Nuxt 3 提供以下应用生命周期 hooks:

```typescript
// Nuxt 插件执行时机
export default defineNuxtPlugin((nuxtApp) => {
  // 在 app 创建时执行
  nuxtApp.hook('app:created', () => {})

  // 在 app 渲染前执行
  nuxtApp.hook('app:beforeMount', () => {})

  // 在 app 挂载后执行
  nuxtApp.hook('app:mounted', () => {})

  // 在每次页面导航前执行
  nuxtApp.hook('page:loading:start', () => {})

  // 在 SSR 上下文设置时执行
  nuxtApp.hook('app:rendered', () => {})
})
```

**关键发现:**

- Nuxt 3 的插件在 `app:created` 之前执行
- 插件可以 `provide` 值给整个应用
- 插件有明确的执行顺序（通过插件文件名前缀控制：`01.plugin.ts`）

### 1.2 自定义插件系统架构

基于用户需求（独立于 `packages/core`），推荐架构:

```
packages/plugin/
├── src/
│   ├── index.ts              # 主入口
│   ├── types.ts              # 类型定义
│   ├── PluginManager.ts      # 插件管理器
│   ├── lifecycle/            # 生命周期事件
│   │   ├── events.ts         # 事件定义
│   │   └── emitter.ts        # 事件发射器
│   ├── hooks/                # 16 个挂载点
│   │   ├── registry.ts       # 挂载点注册表
│   │   └── types.ts          # 挂载点类型
│   └── utils/
│       ├── loader.ts         # 插件加载器
│       └── validator.ts      # 插件验证器
├── plugins.config.json       # 插件配置文件
└── package.json
```

### 1.3 推荐架构决策

| 决策点   | 推荐方案               | 理由                            |
| -------- | ---------------------- | ------------------------------- |
| 包位置   | 独立 `packages/plugin` | 不与 core 耦合，便于维护        |
| API 风格 | 导航守卫适配版         | 用户明确偏好，符合 Vue 生态习惯 |
| 注册方式 | JSON 配置 + 自动扫描   | 平衡灵活性和便利性              |
| 执行模式 | 混合（同步 + 异步）    | 简单 hook 同步，复杂 hook 异步  |

---

## 2. 插件生命周期管理最佳实践

### 2.1 标准应用生命周期

推荐采用 8 个生命周期事件:

```typescript
export enum PluginLifecycleEvent {
  // 初始化阶段
  INIT = 'plugin:init', // 插件系统初始化
  REGISTER = 'plugin:register', // 插件注册

  // 应用启动阶段
  APP_CREATED = 'app:created', // 应用创建
  APP_MOUNT = 'app:mounted', // 应用挂载

  // 运行时阶段
  NAVIGATION_START = 'navigation:start', // 导航开始
  NAVIGATION_END = 'navigation:end', // 导航结束
  RENDER = 'render', // 页面渲染

  // 销毁阶段
  DESTROY = 'plugin:destroy', // 插件销毁
}
```

### 2.2 导航守卫模式 API 设计

```typescript
// 插件定义接口
export interface Plugin {
  name: string
  version: string

  // 生命周期钩子（可选实现）
  onInit?(ctx: PluginContext): Promise<void> | void
  onAppCreated?(ctx: PluginContext): Promise<void> | void
  onAppMounted?(ctx: PluginContext): Promise<void> | void
  onNavigationStart?(ctx: NavigationContext): Promise<void> | void
  onNavigationEnd?(ctx: NavigationContext): Promise<void> | void
  onDestroy?(): Promise<void> | void
}

// 导航守卫模式（用户明确偏好）
export interface NavigationGuard {
  (to: RouteLocation, from: RouteLocation, next: () => void): Promise<void> | void
}
```

### 2.3 插件配置文件格式

```json
{
  "plugins": [
    {
      "name": "seo-plugin",
      "path": "./plugins/seo-plugin.js",
      "enabled": true,
      "config": {
        "siteName": "My Blog"
      }
    }
  ]
}
```

---

## 3. TypeScript 类型安全的插件 API 设计

### 3.1 核心类型定义

```typescript
// 插件上下文
export interface PluginContext {
  app: App<any>
  config: Record<string, any>
  hooks: HookRegistry
}

// 导航上下文
export interface NavigationContext {
  to: RouteLocation
  from: RouteLocation
  next: () => void
}

// 插件挂载点类型
export type HookFn<T = any> = (ctx: T) => Promise<T> | T

// 同步挂载点
export interface SyncHook<T = any> {
  type: 'sync'
  fn: (ctx: T) => T
}

// 异步挂载点
export interface AsyncHook<T = any> {
  type: 'async'
  fn: (ctx: T) => Promise<T>
}

// 联合类型
export type Hook = SyncHook | AsyncHook
```

### 3.2 16 个挂载点分类

基于 Nuxt 3 生命周期和业务需求，推荐 16 个挂载点:

| #   | 挂载点               | 类型  | 触发时机     |
| --- | -------------------- | ----- | ------------ |
| 1   | `app:init`           | sync  | 应用初始化   |
| 2   | `app:created`        | async | 应用创建后   |
| 3   | `app:mounted`        | async | 应用挂载后   |
| 4   | `router:before-each` | async | 路由守卫     |
| 5   | `router:after-each`  | sync  | 路由完成后   |
| 6   | `page:loading:start` | sync  | 页面加载开始 |
| 7   | `page:loading:end`   | sync  | 页面加载结束 |
| 8   | `page:render`        | async | 页面渲染     |
| 9   | `component:mount`    | sync  | 组件挂载     |
| 10  | `component:unmount`  | sync  | 组件卸载     |
| 11  | `api:request`        | async | API 请求前   |
| 12  | `api:response`       | async | API 响应后   |
| 13  | `api:error`          | async | API 错误处理 |
| 14  | `theme:change`       | sync  | 主题切换     |
| 15  | `storage:set`        | sync  | 数据存储     |
| 16  | `storage:get`        | sync  | 数据读取     |

### 3.3 类型安全注册表

```typescript
// 挂载点名称枚举
export enum HookName {
  APP_INIT = 'app:init',
  APP_CREATED = 'app:created',
  // ... 其他 14 个
}

// 每个挂载点的上下文类型映射
export interface HookContextMap {
  [HookName.APP_INIT]: { app: App }
  [HookName.APP_CREATED]: { app: App; nuxt: NuxtApp }
  [HookName.ROUTER_BEFORE_EACH]: NavigationContext
  // ...
}

// 类型安全的注册函数
export interface HookRegistry {
  register<T extends HookName>(
    hook: T,
    fn: (ctx: HookContextMap[T]) => HookContextMap[T] | Promise<HookContextMap[T]>
  ): void
}
```

---

## 4. CSS Variables 主题切换方案

### 4.1 推荐架构

```
themes/
├── classic/
│   ├── index.ts          # 主题入口
│   ├── variables.css     # CSS Variables 定义
│   └── theme.json        # 主题元数据
└── minimal/
    ├── index.ts
    ├── variables.css
    └── theme.json
```

### 4.2 CSS Variables 定义位置

推荐在 `packages/core/styles/variables.css`:

```css
/* 基础变量（所有主题共享） */
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
}

/* Classic 主题 */
[data-theme='classic'] {
  --color-primary: #2c5282;
  --color-bg: #ffffff;
  --color-text: #1a202c;
  --spacing-unit: 8px;
  --radius-md: 4px;
}

/* Minimal 主题 */
[data-theme='minimal'] {
  --color-primary: #000000;
  --color-bg: #f5f5f5;
  --color-text: #333333;
  --spacing-unit: 4px;
  --radius-md: 0px;
}
```

### 4.3 主题切换实现

```typescript
// 主题管理器
export class ThemeManager {
  private currentTheme: string

  constructor(defaultTheme: string = 'classic') {
    this.currentTheme = defaultTheme
    this.apply(defaultTheme)
  }

  apply(themeName: string): void {
    document.documentElement.setAttribute('data-theme', themeName)
    this.currentTheme = themeName

    // 触发插件挂载点
    this.hooks.trigger('theme:change', { theme: themeName })
  }

  getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }
}
```

### 4.4 主题配置文件格式

```json
{
  "name": "classic",
  "displayName": "经典博客",
  "version": "1.0.0",
  "author": "My Blog Team",
  "colors": {
    "primary": "#2c5282",
    "secondary": "#4a5568",
    "background": "#ffffff",
    "text": "#1a202c"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": "16px",
    "lineHeight": "1.5"
  },
  "spacing": {
    "unit": "8px",
    "scale": "1.25"
  }
}
```

---

## 5. 类似系统的设计模式参考

### 5.1 Vue Router 导航守卫

```typescript
// Vue Router 模式（用户明确偏好）
router.beforeEach((to, from, next) => {
  // to: 即将要进入的目标路由
  // from: 当前导航正要离开的路由
  // next: 必须调用的函数

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login') // 重定向
  } else {
    next() // 继续
  }
})
```

**适配到插件系统:**

```typescript
// 插件导航守卫
pluginManager.registerGuard('navigation', (ctx, next) => {
  if (ctx.to.meta.requiresPlugin && !pluginEnabled) {
    next(false) // 取消导航
  } else {
    next() // 继续
  }
})
```

### 5.2 Webpack/Vite 插件系统

```typescript
// Webpack 插件模式
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 访问 compilation.assets 获取所有输出文件
      callback()
    })
  }
}
```

**关键启发:**

- 使用 `tap` / `tapAsync` / `tapPromise` 区分同步/异步
- 插件通过 `apply` 方法注册 hooks
- hooks 有明确的执行顺序

### 5.3 Express/Koa 中间件

```typescript
// Koa 中间件模式（洋葱模型）
app.use(async (ctx, next) => {
  console.log('before')
  await next()
  console.log('after')
})
```

**适配到插件系统:**

- 适合需要"包裹"逻辑的场景（如日志、错误处理）
- 可以用在 `api:request` / `api:response` 挂载点

---

## 6. 推荐实施策略

### 6.1 Phase 2 范围界定

**必须实现:**

1. `packages/plugin` 独立包
2. 插件管理器（PluginManager）
3. 8 个生命周期事件
4. 16 个挂载点注册表
5. `plugins.config.json` 配置文件
6. CSS Variables 主题基础设施
7. 主题切换 API
8. 2 个示例主题（Classic 骨架 + Minimal 骨架）

**不实现（后续 Phase）:**

- 插件配置 UI（Phase 8）
- 官方插件开发（Phase 8）
- 主题预览功能（Phase 7）
- 完整主题样式（Phase 7）

### 6.2 技术决策总结

| 领域          | 决策                                      |
| ------------- | ----------------------------------------- |
| 插件包位置    | `packages/plugin` 独立包                  |
| API 风格      | 导航守卫模式 `(to, from, next)`           |
| 生命周期      | 8 个标准事件（init → destroy）            |
| 挂载点类型    | TypeScript 枚举 + 泛型映射                |
| 注册方式      | `plugins.config.json` + 自动扫描          |
| 执行模式      | 混合（同步 hook + 异步 hook）             |
| CSS Variables | `[data-theme]` 选择器方案                 |
| 主题配置      | JSON 文件（分层结构）                     |
| 主题切换      | `document.documentElement.setAttribute()` |

---

## 7. 风险与注意事项

### 7.1 技术风险

| 风险                     | 概率 | 影响 | 缓解措施           |
| ------------------------ | ---- | ---- | ------------------ |
| Nuxt 3 SSR 兼容性问题    | 中   | 高   | 优先测试 SSR 场景  |
| 插件加载顺序问题         | 中   | 中   | 支持显式依赖声明   |
| CSS Variables 浏览器兼容 | 低   | 低   | 现代浏览器支持良好 |
| 主题切换闪烁             | 中   | 中   | 预加载主题变量     |

### 7.2 设计注意事项

1. **类型安全优先** - 所有 API 必须有完整的 TypeScript 类型
2. **文档即代码** - 每个 API 都有 JSDoc 注释
3. **测试覆盖** - 核心逻辑需要单元测试
4. **向后兼容** - 预留扩展点，避免破坏性变更

---

## 8. 参考资源

- [Nuxt 3 插件文档](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Nuxt 3 Hooks 参考](https://nuxt.com/docs/api/advanced/hooks)
- [Vue Router 导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [CSS Variables MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [Webpack Tapable](https://github.com/webpack/tapable)

---

_Research complete: 2026-03-17_
_Next: Planning phase - create PLAN.md files_
