# A001: CSS 框架选择 — Tailwind CSS → UnoCSS

**日期**: 2026-04-30
**状态**: 已采纳
**决策者**: ZhangYaZhou

---

## 背景

博客系统需要支持运行时动态换肤（后台修改颜色/字体后即时生效），核心机制是 CSS Variables。

## 原方案

Tailwind CSS 3.x 作为主要样式方案。

## 问题

Tailwind CSS 的颜色是**编译时确定**的。`bg-blue-500` 在构建时被替换为固定的 hex 值（如 `#3B82F6`），无法在运行时通过 CSS Variables 动态切换。

要让 Tailwind 响应 CSS Variables，需要手动映射：

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      surface: 'var(--color-surface)',
    }
  }
}
```

但这会导致：
- **失去 Tailwind 的 opacity 工具类** — `bg-primary/50` 不会工作（Tailwind 无法对 CSS Variable 做 alpha 计算）
- **所有颜色都要手动映射一遍** — 维护成本高
- **IDE 提示失效** — 颜色预览、对比度检查等功能无法使用

## 决策

采用 **UnoCSS** 替代 Tailwind CSS。

## 理由

1. **原生 CSS Variables 支持** — UnoCSS 支持 `text-$color-primary` 语法，直接引用 CSS Variable，无需手动映射
2. **按需生成** — 只生成实际使用的 CSS，体积更小
3. **兼容 Tailwind 语法** — UnoCSS 的 preset-wind 完全兼容 Tailwind 的工具类语法，学习成本为零
4. **更快的构建速度** — UnoCSS 比 Tailwind 快 5-10 倍
5. **更好的扩展性** — 自定义规则、图标、属性模式等

## 对比

| 特性 | Tailwind CSS 3.x | UnoCSS |
|------|-------------------|--------|
| CSS Variables 动态颜色 | 需手动映射，丢失 opacity | 原生支持 `$var` 语法 |
| 构建速度 | 较慢 | 极快（纯引擎） |
| 语法兼容 | - | 兼容 Tailwind + Windi |
| 按需生成 | 是 | 是 |
| 图标集成 | 需额外插件 | 内置 preset-icons |
| 社区生态 | ★★★★★ | ★★★★ |

## 实施

- 使用 UnoCSS + `preset-wind`（兼容 Tailwind 语法）
- 使用 `preset-icons` 集成图标
- CSS Variables 定义在主题 `styles.css` 中
- UnoCSS 配置中定义语义化颜色 token（映射到 CSS Variables）

## 回退方案

如果 UnoCSS 出现兼容性问题，可回退到 Tailwind CSS + 手动颜色映射，功能不受影响，只是开发体验略差。

---

**相关文档**: [架构方案 - 技术栈选型](../architecture.md#24-技术栈选型详解)
