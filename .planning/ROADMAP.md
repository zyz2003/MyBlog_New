# Roadmap: 重构恢复路线图

## Overview

当前重构分为四个阶段：

1. 先修复架构链路与前后台设置读取的一致性
2. 再完成前台壳层与首页结构重建
3. 然后补齐前台搜索、评论、文章详情等交互能力
4. 最后收口后台配置页、管理体验与前后台配置闭环

## Phases

- [x] **Phase 1: Recovery**  
  收口主题链路、前后台设置读取链路与页面层重复逻辑。

- [x] **Phase 2: Frontend Shell**  
  完成首页、导航、页脚、归档页等前台壳层重建，让整体结构贴近安知鱼主题。

- [x] **Phase 3: Frontend Features**  
  完成搜索、评论、文章增强组件与剩余前台交互能力。

- [x] **Phase 4: Admin Completion**  
  统一后台设置页、补齐保存链路、修复乱码文案，并打通“后台可改 -> 数据持久化 -> 前台真实生效”的闭环。

## Phase 1 Summary

### Goal

让代码库从“半重构”状态回到“单一路径、单一入口、可继续开发”的稳定状态。

### Achieved

1. 首页、主题与后台设置链路统一到更稳定的 composable 和 theme manager。
2. `useSiteSettings()` / `useAdminSettings()` 成为核心配置消费路径。
3. 关键后台设置页完成迁移。
4. `.planning` 与真实执行状态重新对齐。

## Phase 2 Summary

### Goal

让首页、导航、页脚、归档页不再像通用博客模板，而是具备明确的安知鱼风格壳层。

### Achieved

1. 首页 top/banner/category/post 组合完成重建。
2. 导航壳层与右侧悬浮按钮完成前台可用性修复。
3. 页脚三段式结构与归档页壳层补齐。
4. 前台可见乱码、分页点透明、按钮空心等问题完成清理。
5. `pnpm.cmd type-check` 通过，前台页面未引入新的阻断性错误。

### Deferred

- 更高保真的像素级对齐
- 顶部 banner、推荐卡片与文章流的视觉细磨
- 页脚与文章流的进一步细节精修

## Phase 3 Summary

### Goal

补齐前台剩余核心交互，让搜索、评论与文章详情页从“占位状态”升级为可实际使用的完整链路。

### Achieved

1. 搜索弹层改为真实调用 `/api/search`，支持防抖、键盘选择与正确跳转。
2. 独立搜索页补齐分页、空状态、错误状态与更清晰的搜索体验。
3. 评论模块增加 `post-comment` 锚点、Twikoo 安全加载与未配置时的友好提示。
4. 最新评论卡片从占位符改为真实状态卡，避免继续暴露假数据。
5. 文章详情页统一到日期路由，补齐 AI 摘要、目录、版权卡片与评论区联动。
6. Markdown 标题自动生成稳定锚点，目录组件能跟随标题工作。
7. `pnpm.cmd type-check` 通过，搜索页与文章页链路已完成功能级联调。

### Residual Risk

- 开发环境仍存在既有 hydration warning，主要集中在旧壳层区域与富文本渲染链路，属于后续 SSR 细修项。
- `Nuxt Site Config` 仍提示 localhost 构建地址，该问题并非本阶段新增。

## Phase 4 Summary

### Goal

把后台管理端从“部分可编辑、部分无效、文案乱码”的状态，收口到“配置页结构统一、保存字段完整、前台能真实消费”的可维护状态。

### Achieved

1. `comments`、`features`、`seo`、`posts`、`sidebar`、`display`、`general` 等后台页完成统一整理，文案恢复可读中文。
2. 多个设置页迁移为统一的 `useAdminSettings()` 保存模式，减少各页手写请求导致的漂移。
3. `settings.schema.ts` 补齐 Phase 4 相关 key 的 Zod 校验覆盖，避免后台新增字段绕过结构约束。
4. `useSiteSettings()` 与前台类型定义更新，评论、侧边栏、右侧按钮等配置可被前台真实消费。
5. 右侧悬浮按钮接入 `rightsideItems` 配置，后台保存后前台显隐会同步生效。
6. 侧边栏设置同时写入新 `sidebar` 对象和兼容字段，修复“后台保存了但首页没变化”的链路问题。
7. 设置写入接口的错误提示恢复为正常中文，后台异常更容易排查。
8. `pnpm.cmd type-check` 通过。

## Current Status

四个阶段已按当前重构路线完成。后续如果继续推进，建议进入“验收与精修”路线，而不是再回到结构性重写。

### Phase 5: Frontend Settings Consumption

**Goal:** Close the remaining admin-to-frontend configuration loop so backend-managed settings produce real public-site changes
**Requirements**: Consume the highest-impact existing admin settings on the homepage, global shell, and selected fallback paths
**Depends on:** Phase 4
**Plans:** 1 plan

Plans:
- [x] 05-01 Frontend Consumption Of Admin-Controlled Settings

### Phase 5 Summary

#### Goal

Make the backend configuration center a real frontend driver so public-site behavior changes when
admins update the corresponding settings, rather than leaving AnZhiYu-aligned keys stored but
unused.

#### Achieved

1. `useSiteSettings()` now normalizes more of the admin-managed frontend contract, including
   `peoplecanvas`, `linkPageTop`, `pageThumbnailSuffix`, `topImage`, `mourn`, `error_404`,
   `error_img`, footer subtitle/cc, and rightside button ordering
2. Homepage top-area rendering is now config-driven for peoplecanvas mode, top image behavior,
   category cards, thumbnail suffixes, and fallback cover strategy
3. Public shell and detail surfaces now consume settings more broadly:
   navbar/profile/footer/rightside buttons/article detail/friends page all honor backend-managed
   values instead of relying on hardcoded-only output
4. Previously dead settings paths were activated, including friends-page top copy, footer bar
   subtitle and cc display, homepage comment-count toggles, mourn-day grayscale behavior, and
   article/recent-post image fallback chains
5. `pnpm.cmd type-check` passes after the settings-consumption wave

#### Residual Risk

- Verification has reached code-level and type-level completion, but a final manual admin-save ->
  frontend-visible-change smoke pass is still valuable before calling the whole frontend migration
  fully stabilized
- `nuxt-site-config` still warns about localhost build URL; this predates the phase and was not
  introduced here

### Phase 6: Frontend Parity Polish

**Goal:** Shrink the remaining visual, structural, and interaction gap between the current public frontend and the AnZhiYu reference theme
**Requirements**: Audit the highest-traffic public pages first, fix the largest parity deviations before expanding page count, and preserve the working admin-to-frontend config loop from Phase 5
**Depends on:** Phase 5
**Plans:** 1 plan

Plans:
- [x] 06-01 High-Traffic Frontend Parity Audit And First Repair Wave

### Phase 6 Summary

#### Goal

Shrink the remaining visual, structural, and interaction gap between the current public frontend
and the AnZhiYu reference on the pages users notice most.

#### Achieved

1. Completed a concrete parity audit for the highest-traffic public frontend surfaces rather than
   relying on vague visual complaints
2. Rebuilt the search page, archive page, sidebar recent-post hierarchy, homepage article stream,
   article detail hero/summary/copyright shell, friends page wrapper, homepage top section, and
   footer shell to more closely follow the reference structure and rhythm
3. Removed or reduced visible garbled fallback copy across key public-facing surfaces, including
   homepage, detail pages, friends page, dynamic-page fallback, and footer/top-level shell text
4. Preserved the admin-driven settings-consumption chain established in Phase 5 while increasing
   public-theme parity
5. Re-ran `pnpm.cmd type-check` throughout the repair waves and kept the frontend type-clean aside
   from the pre-existing `nuxt-site-config` localhost warning

#### Result

Phase 6 closed the highest-value public parity gap. Further frontend work should now be treated as
fine polish, screenshot-level comparison, or incremental UX refinement instead of core parity
recovery.

---
*Last updated: 2026-05-19*
