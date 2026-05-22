# 前台复刻路线图 — 安知鱼主题完美复刻

> 目标：将安知鱼 (AnZhiYu) 主题的所有视觉交互效果完整复刻到 Nuxt 3 前台
> 参考：`docs/anzhiyu-reference/hexo-theme-anzhiyu/`
> 当前状态：后台管理面板已完成，前台已复刻约 25%

---

## 现有前台完成度评估

### 已完成（约 25%）
- 首页基本结构：HomeTop（轮播/推荐）、HomePostList（文章列表）
- 侧边栏骨架：BlogSidebar（作者卡片、标签、分类、最近文章、归档、站点信息）
- 文章详情页：基本渲染 + Vditor 样式
- 分类/标签列表页：基础列表
- 布局：BlogLayout（导航栏 + 内容 + 侧边栏 + 页脚）
- 主题色系统：CSS Variables 基础架构

### 未完成（约 75%）
- 导航栏：缺少搜索、暗色模式切换、移动端菜单
- 页脚：缺少安知鱼特色页脚（随机友链、备案信息等）
- 搜索：本地搜索/Algolia/Docsearch 均未对接
- 评论：Twikoo/Valine/Waline 组件未实现
- 右键菜单：安知鱼特色右键菜单
- 音乐播放器：APlayer 集成
- AI 摘要：文章 AI 摘要区块
- 速达：键盘快捷键导航
- 相册页：瀑布流相册
- 友链页：随机友链 + 申请
- 关于页：个人介绍
- 留言板：基于评论系统
- 404 页：安知鱼特色 404
- 动画效果：页面切换、滚动、悬浮等
- 响应式：移动端适配
- 后台配置消费：前台读取后台设置驱动渲染

---

## Phase 规划

### Phase 1: 核心骨架 — 导航栏 + 页脚 + 布局
**目标**：完成全站通用骨架，所有页面都有完整的导航和页脚
**参考**：`layout/includes/header/`, `layout/includes/footer.pug`
**交付物**：
- BlogNavbar：logo、导航菜单、搜索入口、暗色模式切换、移动端汉堡菜单
- BlogFooter：安知鱼特色页脚（随机友链、运行时间、备案信息）
- BlogLayout 完善：导航栏固定、页脚吸底、内容区最小高度
- 移动端响应式导航

### Phase 2: 首页完善 — 轮播 + 文章列表 + 侧边栏
**目标**：首页视觉效果与安知鱼一致
**参考**：`layout/includes/top/`, `layout/includes/post-list.pug`, `layout/includes/sidebar.pug`
**交付物**：
- HomeTop 完善：轮播图动画、推荐文章卡片悬浮效果
- HomePostList 完善：文章卡片悬浮效果、封面图懒加载、分类/标签筛选
- BlogSidebar 完善：所有卡片组件对接后台配置、动画效果
- 首页响应式布局

### Phase 3: 文章详情页 — 渲染 + 目录 + 评论
**目标**：文章阅读体验与安知鱼一致
**参考**：`layout/post.pug`, `layout/includes/post/`, `layout/includes/widget/toc.pug`
**交付物**：
- 文章渲染：Front Matter 字段消费（mainColor、topImg、toc、aside 等）
- 目录组件：TOC 浮动导航、滚动高亮
- 评论系统：Twikoo/Valine/Waline 集成，后台配置驱动
- AI 摘要区块
- 代码块：高亮、复制按钮、折叠（highlightShrink）
- 数学公式：MathJax/KaTeX 按需加载
- 文章版权声明
- 上下篇导航

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

### Phase 6: 动画与打磨 — 过渡动画 + 性能 + 响应式
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