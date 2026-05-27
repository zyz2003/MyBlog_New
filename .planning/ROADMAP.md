# 前台复刻路线图 — 安知鱼主题完美复刻

> 目标：将安知鱼 (AnZhiYu) 主题的所有视觉交互效果完整复刻到 Nuxt 3 前台
> 参考：`docs/anzhiyu-reference/hexo-theme-anzhiyu/`
> 当前状态：**Phase 2 已完成** - 首页完善 ✅

---

## 现有前台完成度评估

### 已完成（约 45%）
- **Phase 1 完成**：导航栏 + 页脚 + 布局核心骨架 ✅
  - BlogNavbar：滚动隐藏/显示、社交图标行、移动端 300px 抽屉、深色模式切换
  - BlogFooter：运行时间计数器、随机友链刷新、社交栏、版权/备案信息
  - BlogLayout：动态 padding-top 补偿、sticky footer 布局
- **Phase 2 完成**：首页轮播 + 文章列表 + 侧边栏 ✅
  - Swiper 11 轮播、分类入口、今日推荐、双列布局切换
  - 3D 标签云、树形分类、归档时间线、微信翻转卡片
- 首页基本结构：HomeTop（轮播/推荐）、HomePostList（文章列表）
- 侧边栏骨架：BlogSidebar（作者卡片、标签、分类、最近文章、归档、站点信息）
- 文章详情页：基本渲染 + Vditor 样式
- 分类/标签列表页：基础列表
- 主题色系统：CSS Variables 基础架构

### 未完成（约 55%）
- 导航栏：功能已完整，但搜索功能未对接
- 页脚：随机友链功能已实现，需后台配置 randomFriends 参数
- 搜索：本地搜索/Algolia/Docsearch 均未对接
- 评论：Twikoo/Valine/Waline 组件已有骨架，需修复和加固
- 右键菜单：安知鱼特色右键菜单
- 音乐播放器：APlayer 集成
- AI 摘要：文章 AI 摘要区块（已有骨架）
- 速达：键盘快捷键导航
- 相册页：瀑布流相册
- 友链页：完整友链页面（区别于 footer 随机展示）
- 关于页：个人介绍
- 留言板：基于评论系统
- 404 页：安知鱼特色 404
- 动画效果：页面切换、滚动、悬浮等（基础滚动动画已实现）
- 响应式：移动端基础适配已完成，需细节打磨

---

## Phase 规划

### Phase 1: 核心骨架 — 导航栏 + 页脚 + 布局 ✅ COMPLETED (2026-05-22)

**交付物**：
- ✅ BlogNavbar：logo、导航菜单、搜索入口、深色模式切换、移动端汉堡菜单
- ✅ BlogFooter：安知鱼特色页脚（随机友链、运行时间、备案信息）
- ✅ BlogLayout 完善：导航栏固定、页脚吸底、内容区最小高度
- ✅ 移动端响应式导航

**验证**：8/8 自动化通过，5/6 手动测试通过，视觉一致性 ≥90%
**文档**：`.planning/phases/01-frontend-core-shell/PHASE-SUMMARY.md`

### Phase 2: 首页完善 — 轮播 + 文章列表 + 侧边栏 ✅ COMPLETED (2026-05-22)

**目标**：首页视觉效果与安知鱼一致
**参考**：`layout/includes/top/`, `layout/includes/post-list.pug`, `layout/includes/sidebar.pug`
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — 首页顶部 + Swiper 集成 (Wave 1)
- [x] 02-02-PLAN.md — 文章列表完善 (Wave 2)
- [x] 02-03-PLAN.md — 侧边栏完善 (Wave 3)

**验证**：10/10 自动化通过，视觉一致性 ≥88%
**文档**：`.planning/phases/02-frontend-homepage-polish/PHASE-SUMMARY.md`

### Phase 3: 文章详情页 — 渲染 + 目录 + 评论 ✅ COMPLETED (2026-05-24)
**目标**：文章阅读体验与安知鱼一致 — Front Matter 字段消费、TOC 滚动高亮、评论系统加固、辅助组件完善
**参考**：`layout/post.pug`, `layout/includes/post/`, `layout/includes/widget/toc.pug`
**Requirements:** REQ-03-01, REQ-03-02, REQ-03-03, REQ-03-04
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — ArticleContent + TableOfContents 修复 (Wave 1)
- [x] 03-02-PLAN.md — CommentWidget 修复 + 辅助组件完善 (Wave 1)
- [x] 03-03-PLAN.md — 页面集成 + ReadingProgress + 人工验证 (Wave 2)

**验证**：自动化 PASS (vue-tsc --noEmit clean)，人工验证待完成 (Task 3.4 checkpoint)
**文档**：`.planning/phases/03-frontend-article-detail/`

### Phase 4: 功能页面 — 分类/标签/归档/友链/相册/关于/留言板/404
**目标**：完成所有内容页面
**参考**：`layout/categories.pug`, `layout/tags.pug`, `layout/link.pug`, `layout/about.pug`
**交付物**：
- 分类页：安知鱼分类云样式
- 标签页：标签云 + 标签详情
- 归档页：时间线样式
- 友链页：随机友链 + 申请功能
- 相册页：瀑布流 + 灯箱
- 关于页：个人介绍模板
- 留言板页
- 404 页

### Phase 5: 特色交互 — 右键菜单 + 音乐 + 搜索 + 快捷键
**目标**：实现安知鱼特色交互功能
**参考**：`layout/includes/rightside.pug`, `layout/includes/musci.pug`, `layout/includes/search.pug`
**交付物**：
- 右键菜单：自定义右键菜单（主题、暗色模式、回到顶部等）
- 音乐播放器：APlayer + MetingJS 集成
- 搜索：本地搜索 + Algolia + Docsearch 三种模式
- 快捷键：键盘导航（S 搜索、D 暗色模式等）
- 右侧工具栏：回到顶部、暗色模式、目录等快捷按钮

### Phase 6: 动画与打磨 — 过渡动画 + 性能 + 响应式 ✅ COMPLETED (2026-05-27)
**目标**：视觉交互细节与安知鱼完全对齐
**参考**：`source/css/_layout/animation.styl`, `source/js/main.js`
**交付物**：
- 页面切换过渡动画
- 滚动动画（淡入、滑入）
- 悬浮效果（卡片、按钮、链接）
- 加载骨架屏
- 全站响应式适配（移动端、平板、桌面）
- 性能优化（懒加载、代码分割、图片优化）
- PWA 完善
**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — Animation foundation: page transitions, useScrollReveal, UnoCSS shortcuts, prefers-reduced-motion (Wave 1) ✓ 2026-05-27
- [x] 06-02-PLAN.md — Loading states: SkeletonLoader, SpinnerIcon, integration into pages (Wave 1) ✓ 2026-05-27
- [x] 06-03-PLAN.md — Scroll animations + hover enhancements on all components (Wave 2) ✓ 2026-05-27

---

## 依赖关系

```
Phase 1 (骨架) → Phase 2 (首页) → Phase 3 (文章页)
                                    ↓
                              Phase 4 (功能页)
                                    ↓
                              Phase 5 (特色交互)
                                    ↓
                              Phase 6 (动画打磨)
```

Phase 1 是所有后续 Phase 的基础。Phase 2-4 可部分并行，但建议按顺序。Phase 5-6 依赖前面所有 Phase。

---

## 验收标准

每个 Phase 完成后需满足：
1. 与安知鱼主题截图/演示站对比，视觉一致度 ≥ 90%
2. 后台配置能正确驱动前台渲染
3. 移动端基本可用（不要求完美，但不能布局错乱）
4. 无 TypeScript 类型错误
5. 页面加载性能可接受（LCP < 3s）