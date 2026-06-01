# 路线图 — 安知鱼视觉对齐打磨

> 创建日期: 2026-06-01
> 基于: 安知鱼源码 vs 当前实现的差异对比

---

## 总览

前台基础功能已搭建完成 (6 Phase)，但与安知鱼源码对比仍有显著视觉和交互差异。
本轮重点：**对齐安知鱼的核心视觉体验**，补齐缺失的关键功能，**前后台同步调整**。

| Phase | 名称 | 优先级 | 前台 | 后台 | 预估 |
|-------|------|--------|------|------|------|
| 1 | Hero + 导航栏核心体验 | P0 | 全屏Hero/打字机/进度条 | homepage.vue 增字段 | 中 |
| 2 | 移动端 + 侧栏完善 | P0 | 抽屉侧栏/区域分离 | sidebar.vue 增字段 | 中 |
| 3 | 文章页体验对齐 | P1 | 版权翻转/AI摘要/元信息 | posts.vue + features.vue 增字段 | 中 |
| 4 | 首页文章列表增强 | P1 | 时间线/分页/TodayCard | homepage.vue 增字段 | 中 |
| 5 | 控制台 + 特色交互 | P1 | 控制台/大菜单/BBTimeList | features.vue 增字段 + 新 essays API | 大 |
| 6 | 小部件功能补全 | P2 | 各Widget增强/TOC/自定义HTML | sidebar.vue + 新 schema | 中 |
| 7 | 架构重构 | P0 | composables/主题注入 | 统一配置系统/事务 | 大 |

---

## Phase 1: Hero + 导航栏核心体验 (P0)

> 首页最醒目的视觉差异

### 前台任务

- [ ] **1.1 全屏 Hero 背景**
  - HomeTop 改为全屏视差背景图 (参考 top.pug)
  - 半透明遮罩层 + 渐变
  - 滚动时视差效果 (background-attachment: fixed 或 JS 驱动)
  - 滚出 Hero 后内容区自然衔接

- [ ] **1.2 打字机副标题**
  - 集成 Typed.js (或 typed.js 轻量替代)
  - 支持数据源：一言 API / 古诗词 / 自定义文本数组
  - 打字 + 删除 + 循环动画
  - 配置项：typeSpeed, backSpeed, loop, startDelay

- [ ] **1.3 向下滚动指示器**
  - Hero 底部弹跳箭头动画 (1.5s infinite)
  - 点击平滑滚动到内容区
  - 滚动离开 Hero 后自动隐藏

- [ ] **1.4 导航栏滚动进度条**
  - 页面顶部 3px 进度条，显示阅读百分比
  - 滚动到顶部时隐藏
  - 颜色跟随主题色

- [ ] **1.5 页面名称指示器**
  - 滚动超过阈值后导航栏显示当前页面标题
  - hover 提示"回到顶部"，点击回顶部
  - 非首页时显示

### 后台任务

- [ ] **1.B1 homepage.vue 增加字段**
  - `heroFullScreenEnable` (boolean) — 是否全屏 Hero
  - `heroParallaxEnable` (boolean) — 是否启用视差
  - `heroScrollIndicatorEnable` (boolean) — 是否显示向下滚动指示器
  - `heroBackgroundImage` (string) — Hero 视差背景图 URL
  - `homeTopSubTitleSource` (select: custom | hitokoto) — 副标题数据源

- [ ] **1.B2 settings.schema.ts 更新**
  - 添加对应 Zod schema 字段
  - 更新 useSiteSettings 类型定义

### 验收标准
- 首页 Hero 占满首屏，背景图 + 打字机 + 向下箭头
- 导航栏有滚动进度条和页面名称
- 后台首页设置可配置 Hero 模式

---

## Phase 2: 移动端 + 侧栏完善 (P0)

> 移动端目前完全无法操作侧栏

### 前台任务

- [ ] **2.1 移动端抽屉侧栏**
  - 汉堡按钮触发侧栏从右侧滑出
  - 侧栏内容：导航菜单 + 暗色模式切换 + 站点数据链接(文章数/分类数/标签数)
  - 遮罩层 + 滑入/滑出动画
  - 点击遮罩或菜单项自动关闭

- [ ] **2.2 侧栏区域分离**
  - 顶部区域：ProfileWidget (非 sticky)
  - 粘性区域：其他小部件 (sticky，可滚动)
  - 底部区域：自定义 HTML 内容

- [ ] **2.3 侧栏 Toggle 按钮**
  - 桌面端侧栏开关按钮 (参考 rightside.pug)
  - 记住用户偏好 (localStorage)
  - 开关动画 (滑入/滑出 + 内容区自适应宽度)

### 后台任务

- [ ] **2.B1 sidebar.vue 增加字段**
  - `sidebarMobileDrawerEnable` (boolean) — 移动端抽屉模式
  - `sidebarToggleDefaultState` (select: open | closed) — 默认开关状态

### 验收标准
- 移动端可通过汉堡菜单打开侧栏
- 侧栏 Profile 固定顶部，其余可滚动
- 侧栏开关有记忆功能

---

## Phase 3: 文章页体验对齐 (P1)

> 文章页是用户停留最久的页面

### 前台任务

- [ ] **3.1 版权区域升级**
  - 双头像 3D 翻转动画 (frontAvatar + backAvatar)
  - 原创/转载视觉徽章
  - 作者副标题显示
  - 版权+工具+分享组合容器 (而非独立垂直堆叠)

- [ ] **3.2 AI 摘要交互增强**
  - 按钮组：介绍自己 / 生成简介 / 推荐文章
  - AI 模型切换 UI
  - 朗读摘要按钮 (Web Speech API)

- [ ] **3.3 文章元信息完善**
  - 分类 + 标签带文章数量指示器
  - IP 属地显示 (可配置开关)
  - 评论计数 (来自第三方评论系统)
  - 两行布局 (meta-firstline + meta-secondline)

- [ ] **3.4 打赏面板升级**
  - 全屏遮罩叠加层
  - 点击遮罩关闭
  - 二维码居中显示 + 阴影

### 后台任务

- [ ] **3.B1 posts.vue 增加字段**
  - `postCopyright.frontAvatar` (string) — 正面头像 URL
  - `postCopyright.backAvatar` (string) — 背面头像 URL
  - `postCopyright.originalBadgeEnable` (boolean) — 原创徽章
  - `postCopyright.reprintBadgeEnable` (boolean) — 转载徽章
  - `postCopyright.authorSubtitle` (string) — 作者副标题
  - `postMetaPost.ipLocation` (boolean) — IP 属地显示
  - `postMetaPost.commentCountSource` (select) — 评论计数来源
  - `postMetaPost.twoLineLayout` (boolean) — 双行布局
  - `reward.overlayMode` (select: modal | slide-up | inline) — 赞赏显示模式
  - `reward.overlayCloseOnOutsideClick` (boolean) — 点击外部关闭

- [ ] **3.B2 features.vue 增加字段**
  - `aiSummary.interactiveEnable` (boolean) — 交互式摘要
  - `aiSummary.model` (string) — 模型名称
  - `aiSummary.apiUrl` (string) — API URL
  - API 密钥存储方案 (环境变量优先)

### 验收标准
- 版权区域有翻转头像和原创徽章
- AI 摘要有交互按钮
- 打赏面板有遮罩层
- 后台可配置版权/元信息/赞赏新字段

---

## Phase 4: 首页文章列表增强 (P1)

> 时间线视图 + 分页增强 + TodayCard 交互

### 前台任务

- [ ] **4.1 时间线视图**
  - 按年份分组的时间线布局
  - 年份标签样式 (大号年份 + 分割线)
  - 列表/时间线切换按钮 (持久化到 localStorage)

- [ ] **4.2 分页增强**
  - 页码跳转输入框 (输入页码 + 回车跳转)
  - 分页样式对齐安知鱼 (更简洁)

- [ ] **4.3 文章卡片交互微调**
  - Hover 效果收敛：封面 scale 1.03 (当前 1.08)
  - translateY 幅度减小 (-4px → -2px)
  - 阴影变化更柔和

- [ ] **4.4 TodayCard 叠加定位**
  - 从顺序排列改为绝对定位覆盖 (overlay)
  - 关闭/隐藏按钮 + 动画 (opacity + scale)
  - 关闭状态记忆 (sessionStorage)

### 后台任务

- [ ] **4.B1 homepage.vue 增加字段**
  - `homepageDefaultLayout` (select: card | timeline) — 默认布局模式
  - `todayCard.dismissible` (boolean) — 可关闭
  - `todayCard.animationType` (select: fade | slide | scale) — 动画类型
  - `todayCard.dismissRemember` (boolean) — 记住关闭状态

### 验收标准
- 首页支持卡片/时间线两种视图
- 分页有跳转输入框
- TodayCard 可关闭
- 后台可配置默认布局和 TodayCard 行为

---

## Phase 5: 控制台 + 特色交互 (P1)

> 安知鱼的标志性交互功能

### 前台任务

- [ ] **5.1 控制台面板 (Console)**
  - 导航栏下拉控制中心 (backdrop-blur)
  - 暗色模式开关
  - 侧栏开关
  - 音乐播放/暂停
  - 字体大小调节滑块
  - 快捷键提示面板
  - 最新评论/标签/归档缩略展示

- [ ] **5.2 回首页大菜单 (Mega Menu)**
  - 九宫格分组导航 (2-3 列)
  - 图标 + 文字 + 描述
  - 从导航栏 Logo 触发
  - backdrop-filter: blur(20px) + 缩放动画

- [ ] **5.3 BBTimeList 即时说说栏**
  - 首页顶部水平滚动短文条
  - 支持表情 + 文字
  - 自动滚动 + hover 暂停
  - 数据来自 essays API

- [ ] **5.4 随机文章按钮**
  - 导航栏 "随便逛逛" 按钮
  - 点击跳转到随机文章 (调用 API)

### 后台任务

- [ ] **5.B1 features.vue 增加字段**
  - `centerConsole.fontSizeAdjust` (boolean) — 字体调节
  - `centerConsole.keyboardShortcutsEnable` (boolean) — 快捷键面板
  - `bbtimeEnable` (boolean) — 启用 BBTimeList
  - `bbtimeSource` (select: local | api) — 数据源
  - `bbtimeApiUrl` (string) — 外部 API URL

- [ ] **5.B2 general.vue 增加字段**
  - `nav.megaMenuEnable` (boolean) — 启用大菜单
  - `nav.menuIconEnable` (boolean) — 导航项显示图标
  - NavbarMenuGroup 类型增加 `description?: string`

- [ ] **5.B3 新增 essays 数据实体 (工作量最大)**
  - 数据库 schema: `essays` 表 (id, content, created_at, updated_at, tags)
  - 服务层: `essay.service.ts` (CRUD)
  - API 端点: `/api/essays` (GET 列表, POST/PUT/DELETE 管理)
  - 后台管理: 新增 `pages/admin/essays.vue` (说说管理页面)
  - 导航菜单: admin 侧栏增加"说说管理"入口

### 验收标准
- 控制台面板可打开，各开关均可用
- 大菜单有九宫格布局
- BBTimeList 在首页滚动显示
- 后台可管理说说内容

---

## Phase 6: 小部件功能补全 (P2)

> 各小部件的功能细节补全

### 前台任务

- [ ] **6.1 ProfileWidget 增强**
  - 点击问候动态打招呼 (changeSayHelloText)
  - 作者名链接到关于页
  - 副标题显示
  - 头像加载失败回退 (onerror)

- [ ] **6.2 AnnounceWidget 增强**
  - 图标摇晃动画 (anzhiyu-shake)
  - 支持富文本内容 (Markdown 渲染)

- [ ] **6.3 RecentPostsWidget 增强**
  - 排序选项 (按更新日期/创建日期)

- [ ] **6.4 TagCloud 增强**
  - 高亮标签功能 (highlightTags)
  - 标签数量限制 (可配置)

- [ ] **6.5 StatsWidget 增强**
  - 总字数统计
  - 最后推送日期
  - 不蒜子加载旋转器 (替换 "0" 占位)

- [ ] **6.6 文章页侧栏目录 (TOC)**
  - 展开折叠 + 编号
  - 滚动百分比指示器
  - 当前标题高亮 (IntersectionObserver)

- [ ] **6.7 自定义 HTML 小部件**
  - card_top_self / card_bottom_self
  - 后台 HTML 编辑器
  - 前台安全渲染 (v-html + sanitize)

### 后台任务

- [ ] **6.B1 sidebar.vue 增加字段**
  - `cardAuthor.greetingText` (string) — 问候文本
  - `cardRecentPost.sortOptions` (multi-select) — 排序选项
  - `cardWebinfo.wordCount` (boolean) — 显示总字数
  - `sidebarCustomWidgets` (array: {id, title, html}) — 自定义小部件

### 验收标准
- 各小部件功能与安知鱼对齐
- 文章页侧栏目录功能完整
- 后台可配置小部件增强选项

---

## Phase 7: 架构重构 (P0)

> 必须先修好地基，主题配置才能生效

### 前台任务

- [ ] **7.1 useSiteSettings() composable**
  - 前台统一配置入口
  - useState 确保 SSR 和客户端共享
  - 替代所有分散的 fetch
  - 暴露 inject 配置 (CSS/HTML 注入)

- [ ] **7.2 主题 CSS 变量注入前台**
  - 前台布局动态注入主题 CSS
  - 后台配的主题色前台立即可见

### 后台任务

- [ ] **7.3 统一配置系统**
  - 合并 system_settings 和 theme_settings 两条存储路径
  - ThemeCustomizer 保存时写入 theme_settings
  - ThemeManager 不再依赖文件系统扫描

- [ ] **7.4 useAdminSettings() composable**
  - 后台统一 fetch + save 逻辑
  - 消除 11 个页面中的重复代码

- [ ] **7.5 修复 admin.vue 布局链**
  - admin.vue 添加 layout: 'admin-default'
  - 子页面去掉 layout 声明，继承父级

- [ ] **7.6 batchUpdate 加事务**
  - settings.service.ts 用 db.transaction()

- [ ] **7.7 themes.vue 增加 CSS/HTML 注入**
  - 激活现有 inject schema
  - 自定义 CSS 编辑器
  - 自定义 `<head>` / `<footer>` HTML 注入

### 验收标准
- 后台配的主题颜色前台立即可见
- 所有页面通过 composables 获取数据
- admin 布局不再双重嵌套
- settings 保存具备原子性

---

## 执行顺序

```
Phase 1  (Hero+导航)    ─┐
Phase 7  (架构重构)      ─┤── 可并行启动
                          │
Phase 2  (移动端+侧栏)   ─┤── 依赖 Phase 1
Phase 3  (文章页)        ─┤── 依赖 Phase 2
Phase 4  (文章列表)      ─┤── 依赖 Phase 1
Phase 5  (控制台+特色)   ─┤── 依赖 Phase 1+2
Phase 6  (小部件补全)    ─┘── 最后收尾
```

---

## 后台调整总览

| 后台页面 | 新增字段数 | 对应 Phase |
|---------|-----------|-----------|
| homepage.vue | ~8 | Phase 1, 4 |
| sidebar.vue | ~5 | Phase 2, 6 |
| posts.vue | ~10 | Phase 3 |
| features.vue | ~7 | Phase 3, 5 |
| general.vue | ~3 | Phase 5 |
| themes.vue | CSS/HTML 注入 | Phase 7 |
| **新增 essays.vue** | 新页面 | Phase 5 |
| settings.schema.ts | ~33 新字段 | 各 Phase |
