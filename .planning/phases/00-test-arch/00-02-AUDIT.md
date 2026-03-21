# Phase 00 Plan 02: Phase 2 核心框架测试审查报告

**Audit Date:** 2026-03-21
**Auditor:** Claude Code (GSD Executor)
**Scope:** Phase 2 (核心框架) - Plugin System & Theme System

---

## Executive Summary

本次审查发现了 **1 个重大实现缺陷** 和 **1 个测试隔离问题**，已修复：

| 问题                                            | 严重性      | 状态      |
| ----------------------------------------------- | ----------- | --------- |
| ThemeManager.apply() 未应用 CSS 变量            | 🔴 Critical | ✅ 已修复 |
| ThemeManager 构造函数在主题未注册时调用 apply() | 🟡 Medium   | ✅ 已修复 |
| 测试隔离问题（localStorage 状态污染）           | 🟡 Medium   | ✅ 已修复 |

**修复后测试结果：** 26/26 测试通过（新增 3 个 CSS 变量验证测试）

---

## 1. Plugin System Audit (PLUGIN-01, PLUGIN-02, PLUGIN-03)

### 审查文件

- `packages/plugin/src/__tests__/plugin-manager.test.ts` (37 测试)
- `packages/plugin/src/__tests__/hook-registry.test.ts` (22 测试)
- `packages/plugin/src/__tests__/lifecycle.test.ts` (13 测试)

### 需求覆盖验证

| 需求                            | 测试覆盖                                                                       | 状态        |
| ------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| **PLUGIN-01**: 插件系统核心架构 | PluginManager 构造函数、register、unregister、getPlugin 测试                   | ✅ 完整覆盖 |
| **PLUGIN-02**: 16 个插件挂载点  | HookRegistry type-safety 测试覆盖 APP_INIT、ROUTER_BEFORE_EACH、API_REQUEST 等 | ✅ 完整覆盖 |
| **PLUGIN-03**: 插件生命周期管理 | LifecycleEmitter 事件触发、plugin onInit/onDestroy/onAppMounted 测试           | ✅ 完整覆盖 |

### 测试质量评估

**✅ 通过项：**

1. 测试基于预期行为而非实现细节
2. 集成测试验证完整生命周期流程
3. 类型安全测试验证上下文类型正确性
4. 错误处理测试验证 gracefully failure

**❌ 发现问题：**

- 无重大发现
- Plugin system 测试架构良好，遵循"测试是验证者，不是迁就者"原则

---

## 2. Theme System Audit (THEME-01, THEME-02, THEME-03)

### 审查文件

- `packages/core/src/theme/__tests__/theme-manager.test.ts` (原 23 测试 → 现 26 测试)
- `packages/core/src/theme/ThemeManager.ts` (正式代码)

### 需求覆盖验证

| 需求                                 | 测试覆盖                                                     | 状态        |
| ------------------------------------ | ------------------------------------------------------------ | ----------- |
| **THEME-01**: 主题系统核心架构       | ThemeManager register/apply/getCurrent 测试                  | ✅ 完整覆盖 |
| **THEME-02**: CSS Variables 主题变量 | ⚠️ 原测试仅验证 setCSSVariable 方法，未验证 apply() 自动应用 | 🔴 已修复   |
| **THEME-03**: JSON 主题配置文件      | ThemeConfig 类型定义完整                                     | ✅ 完整覆盖 |

### 🔴 发现的严重问题

#### 问题 1: ThemeManager.apply() 未应用 CSS 变量

**现象：**

```typescript
// 正式代码（修复前）
apply(themeName: string, options: ThemeSwitchOptions = {}): void {
  // ... 检查主题存在性
  document.documentElement.setAttribute('data-theme', themeName)
  // ❌ 缺失：从未读取 theme.colors/typography/spacing 并转换为 CSS 变量
  this.hooks.onChange.forEach((fn) => fn(themeName))
}
```

**影响：**

- THEME-02 需求未实现：主题配置仅设置 `data-theme` 属性，CSS 变量从未应用
- 测试通过是因为测试只验证 `setAttribute` 被调用，未验证 CSS 变量是否设置
- 这是典型的"测试迁就实现"：测试被写成验证"代码做了什么"，而非"需求要求什么"

**修复：**

```typescript
// 正式代码（修复后）
apply(themeName: string, options: ThemeSwitchOptions = {}): void {
  const theme = this.themes.get(themeName)!

  // 设置 data-theme 属性
  document.documentElement.setAttribute('data-theme', themeName)

  // ✅ 新增：应用主题配置到 CSS Variables
  this.applyThemeVariables(theme)

  // ... 其余逻辑
}

private applyThemeVariables(theme: ThemeConfig): void {
  // 应用颜色变量
  if (theme.colors) {
    this.setCSSVariable('--color-primary', theme.colors.primary)
    this.setCSSVariable('--color-background', theme.colors.background)
    this.setCSSVariable('--color-text', theme.colors.text)
    // ... 其他颜色
  }

  // 应用排版变量
  if (theme.typography) {
    this.setCSSVariable('--font-family', theme.typography.fontFamily)
    this.setCSSVariable('--font-size', theme.typography.fontSize)
    // ... 其他排版
  }

  // 应用间距、圆角、阴影变量
  // ...
}
```

#### 问题 2: 构造函数在主题未注册时调用 apply()

**现象：**

```typescript
// 修复前
constructor(defaultTheme: string = 'classic') {
  this.currentTheme = defaultTheme
  // ❌ 问题：此时 themes Map 为空，classic 主题未注册
  this.apply(this.currentTheme, { transition: false })
}
```

**影响：**

- 每次测试都产生警告：`Theme "classic" not found, falling back to current`
- 测试输出污染，掩盖真正的问题

**修复：**

```typescript
// 修复后
constructor(defaultTheme: string = 'classic') {
  this.currentTheme = defaultTheme
  // ✅ 不在构造函数中应用主题，主题会在 register() 时自动应用
}
```

#### 问题 3: 测试隔离问题

**现象：**

- `localStorageMock` 的 store 在测试间共享
- `should not persist theme when persist option is false` 测试失败
- 原因：前一个测试已调用 `setItem`，mock 未被清空

**修复：**

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear() // ✅ 新增：清空 localStorage 状态
  themeManager = new ThemeManager('classic')
})
```

---

## 3. 新增测试验证修复

添加 3 个测试验证 CSS 变量应用：

```typescript
it('should apply theme colors to CSS variables', () => {
  themeManager.apply('test')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-primary', '#ff0000')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-background', '#ffffff')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-text', '#000000')
})

it('should apply theme typography to CSS variables', () => {
  themeManager.apply('test')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--font-family', 'Arial')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--font-size', '16px')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--line-height', '1.5')
})

it('should apply theme spacing to CSS variables', () => {
  themeManager.apply('test')
  expect(mockElement.style.setProperty).toHaveBeenCalledWith('--spacing-unit', '8px')
})
```

---

## 4. 审查总结

### 插件系统

- **状态:** ✅ 良好
- **测试数:** 72 测试全部通过
- **需求覆盖:** PLUGIN-01/02/03 完整覆盖
- **发现问题:** 无

### 主题系统

- **状态:** ✅ 已修复
- **测试数:** 23 → 26 测试（新增 3 个 CSS 变量验证测试）
- **需求覆盖:** THEME-01/02/03 完整覆盖
- **发现问题:** 3 个（全部修复）

### 核心原则验证

> **审查标准：**
>
> 1. ✅ 测试是否基于 REQUIREMENTS.md 中的需求？
> 2. ✅ 如果测试失败，是否会暴露正式代码的 bug？
> 3. ✅ 测试是否验证了需求，而不是验证"当前实现"？

**案例：** 主题系统测试原先只验证"当前实现"（`setAttribute` 被调用），未验证需求（CSS 变量被应用）。审查发现后修复正式代码，并添加测试确保需求被验证。

---

## 5. 建议

### 后续工作

1. **集成测试：** 考虑创建 `tests/integration/theme-switch-e2e.test.ts` 验证完整主题切换流程
2. **视觉回归测试：** 主题切换后可视化验证样式变化
3. **无障碍测试：** 验证主题切换后的对比度、可读性

### 测试架构改进

1. 确保所有 mock 状态在 `beforeEach` 中重置
2. 添加测试覆盖率报告，识别未覆盖的需求
3. 定期执行此类"基于需求的测试审查"

---

**Commit:** `ace291e: fix(theme): apply CSS variables from theme config in apply() method`

**Files Modified:**

- `packages/core/src/theme/ThemeManager.ts` (+102 行)
- `packages/core/src/theme/__tests__/theme-manager.test.ts` (+6 行)

**Audit Completed:** 2026-03-21
