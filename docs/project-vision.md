# 博客项目愿景

> 本项目以**安知鱼主题 (AnZhiYu)** 为视觉参考目标，开发一个自托管的、可扩展的、现代化的动态博客平台。

## 设计参考

### 安知鱼主题 (AnZhiYu)

**GitHub**: https://github.com/anzhiyu-c/hexo-theme-anzhiyu
**文档**: https://docs.anheyu.com/
**MIT License** - 可自由使用和修改

安知鱼是基于 `hexo-theme-butterfly` 深度美化的 Hexo 主题，以其简洁美丽的界面和丰富的自定义功能著称。本项目将其前台效果作为视觉参考，用 Nuxt 3 动态渲染实现。

### 主题特点

| 特点 | 描述 |
|------|------|
| 简单免费 | 搭建简单，部署容易 |
| 易用功能丰富 | 兼容性强，功能全面 |
| 安全隐私 | 内容安全，隐私保护 |
| 极速访问 | 极致的访问速度 |
| 个性高度自定义 | 配置全量可自定义 |
| 深色模式 | 高度适配的暗色模式 |

---

## 为什么做这个

### Hexo + 安知鱼 的痛点

| 痛点 | 描述 |
|------|------|
| 内容管理混乱 | 几百篇文章全在 `_posts` 文件夹里，无法分类管理 |
| 无可视化编辑 | 写文章要用 VS Code，无法可视化编辑 |
| 媒体难管理 | 图片放本地文件夹，时间久了找不到 |
| 主题定制靠改源码 | 想改颜色要翻主题文件，改完怕升级被覆盖 |
| 无法动态扩展 | 加功能要改主题代码，升级全部白费 |
| 静态博客局限 | 想加统计、评论、点赞都要接第三方服务 |
| 无法多人协作 | 只有一个作者，无法分配编辑权限 |
| 部署更新麻烦 | 改一行字要重新 build 再部署 |

### 我们的解决方案

| 痛点 | 解决方案 |
|------|----------|
| 内容管理混乱 | 数据库 + 后台管理，分类/标签/搜索一体化 |
| 无可视化编辑 | 完整后台，文章/页面可视化编辑 |
| 媒体难管理 | 媒体库上传、预览、分类、批量操作 |
| 主题定制靠改源码 | 可视化主题配置面板，CSS 变量驱动 |
| 无法动态扩展 | 插件系统，Hooks 机制，主题升级不受影响 |
| 静态博客局限 | 动态渲染 (SSR)，可接入任何 API |
| 无多用户 | 用户系统 + 权限管理 |
| 部署更新麻烦 | SSR 应用，改完即时生效 |

---

## 目标用户

1. **有技术背景的博主** - 想要完整控制权，不依赖第三方平台
2. **需要多人协作的团队** - 需要编辑、管理员等不同权限
3. **从 WordPress 迁移的用户** - 想要更现代、更轻量的替代方案
4. **开发者** - 想要一个可扩展的博客平台，可以二次开发

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前台框架 | Nuxt 3 + Vue 3 | SSR + SPA 混合模式 |
| UI 框架 | UnoCSS | 原子化 CSS |
| 样式方案 | CSS Variables | 主题驱动的动态样式 |
| 后端框架 | Nitro | 统一的 API 层 |
| 数据库 | SQLite + Drizzle ORM | 轻量级，类型安全 |

---

## 对比定位

| | Hexo + 安知鱼 | WordPress | 本项目 |
|--|-------------------|-----------|--------|
| 架构 | 静态生成 | 动态 PHP | **动态 SSR** |
| 后台管理 | 无 | 有 | **有** |
| 前台样式 | 安知鱼风格 | 主题决定 | **安知鱼风格 (Nuxt 渲染)** |
| 主题定制 | 改源码 | 主题+插件 | **可视化配置 + 插件** |
| 扩展方式 | 改源码 | 插件+主题 | **插件系统** |
| 部署难度 | 低 | 中 | 中 |
| 性能 | 高 | 中 | 高 |
| 现代化程度 | 低 | 中 | **高** |
| 内容管理 | 文件系统 | 数据库 | **数据库 + 后台** |

---

## 核心功能

### 1. 完整后台管理

- [x] 文章/页面/草稿的 CRUD
- [x] 分类、标签的可视化管理
- [x] 媒体库（图片/文档/音视频）
- [x] 草稿箱、回收站
- [ ] 用户系统与权限管理
- [ ] 操作日志审计

### 2. 插件系统

- [x] 钩子（Hooks）在文章渲染、侧边栏、Footer 等位置插入功能
- [x] 插件是独立的 npm 包
- [ ] 插件市场
- [ ] 插件市场后台管理

### 3. 主题系统

- [x] CSS 变量驱动，颜色、字体、间距、圆角可动态配置
- [ ] 主题切换
- [ ] 主题市场
- [ ] 主题预览

### 4. 前台体验 (安知鱼风格)

#### 4.1 Hero 区域 (一图流)

全屏背景图 + 头像 + 标题 + 社交图标，内容滚动在下方。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `homepageHeroEnabled` | boolean | 是否显示 Hero |
| `homepageHeroTitle` | string | 博客名称 |
| `homepageHeroSubtitle` | string | 副标题/简介 |
| `homepageHeroBgImage` | string | 背景图 URL |
| `homepageHeroAvatar` | string | 头像 URL |
| `homepageIntro` | string | 博主介绍 |

#### 4.2 文章列表

支持**卡片式**和**时间线式**两种布局切换。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `homepageArticleListStyle` | select | `card` / `timeline` |

#### 4.3 侧边栏组件

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `homepageSidebarEnabled` | boolean | 是否显示侧边栏 |
| `homepageSidebarWidgets` | multi-select | 要显示的小部件 |

**可用小部件：**
- `profile` - 博主信息
- `stats` - 网站统计
- `tags` - 标签云
- `categories` - 分类
- `recent` - 最新文章
- `archive` - 归档
- `friends` - 友链

#### 4.4 深色模式

支持**跟随系统**和**手动切换**两种模式。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `darkMode` | select | `auto` / `light` / `dark` |

#### 4.5 SEO 与元信息

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `siteTitle` | string | 站点标题 |
| `siteDescription` | string | 站点描述 |
| `seoTitle` | string | SEO 标题 |
| `seoDescription` | string | SEO 描述 |
| `seoKeywords` | string | SEO 关键词 |

#### 4.6 社交链接

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `github` | string | GitHub URL |
| `twitter` | string | Twitter URL |
| `weibo` | string | 微博 URL |
| `email` | string | 联系邮箱 |

---

## 安知鱼 _config.yml 配置映射

> 将 AnzhiYu 主题 1343 行 YAML 配置拆分为可视化后台管理页面。
> 数据持久化：`system_settings` 表 (key-value) + `/api/settings` 接口。
> 最后审计：2026-05-13

### 映射总览

| 后台页面 | 路由 | 覆盖的 _config.yml 章节 | 完整度 |
|---------|------|------------------------|--------|
| 首页设置 | `/admin/homepage` | `home_top`, `cover`, `mainTone`, `index_post_content`, `article_double_row`, `disable_top_img`, `index_img`, `default_top_img`, `index_site_info_top`, `index_top_img_height` | 85% |
| 侧栏设置 | `/admin/sidebar` | `aside` (enable/position/widgets), `sidebar` (移动端) | 50% |
| SEO 设置 | `/admin/seo` | `site_verification`, SEO 元信息 (title/desc/keywords) | 85% |
| 全局设置 | `/admin/general` | `social`, `footer` (owner/runtime/badges/socialBar/footerBar/subTitle), `darkmode`, `diytitle`, `console`, `inject`, `subtitle`, `favicon`, `avatar`, `display_mode` | 70% |
| 文章设置 | `/admin/posts` | `post_meta.post`, `post_copyright`, `reward`, `related_post`, `post_pagination`, `noticeOutdate` | 70% |
| 评论设置 | `/admin/comments` | `comments` (公共), `twikoo`, `waline`, `valine`, `artalk`, `giscus` | 60% |
| 代码与搜索 | `/admin/display` | `highlight_*`, `copy`, `search` (local/Algolia/Docsearch), `mathjax`, `katex`, `lazyload`, `fancybox`, `medium_zoom`, `pangu`, `pjax`, `instantpage` | 80% |
| 统计分析 | `/admin/analytics` | `baidu_analytics`, `google_analytics`, `cloudflare_analytics`, `microsoft_clarity`, `LA`, `umami`, `busuanzi` | 85% |
| 特效与功能 | `/admin/features` | 背景特效、`nav_music`、AI 摘要、评论弹幕、欢迎语、快捷键、右键菜单、简繁转换、阅读模式等 | 40% |
| 主题管理 | `/admin/themes` | `theme_color`, `font` (配色/字体/间距/圆角可视化编辑) | 60% |
| 插件中心 | `/admin/plugins` | 插件列表/启用/禁用 | 80% |

### 首页设置 详细映射

| _config.yml 字段 | Vue 字段 | 状态 |
|---|---|---|
| `home_top.enable` | `homeTop.enabled` | ✅ |
| `home_top.title` | `homeTop.title` | ✅ |
| `home_top.subTitle` | `homeTop.subTitle` | ✅ |
| `home_top.siteText` | `homeTop.siteText` | ✅ |
| `home_top.timemode` | `homeTop.timemode` | ✅ |
| `home_top.default_descr` | `homeTop.defaultDescr` | ✅ |
| `home_top.swiper.enable` | `homeTop.swiperEnabled` | ✅ |
| `home_top.swiper.swiper_css/js` | — | ❌ |
| `home_top.category[]` (name/path/icon/shadow/class) | `categoryItems` | PARTIAL — `class` 字段缺失 |
| `home_top.banner` (tips/title/image/link) | `todayCard` | ✅ |
| `cover.index_enable` | `articleList.coverEnabled` | ✅ |
| `cover.aside_enable` | `articleList.asideCover` | ✅ |
| `cover.archives_enable` | `articleList.archivesCover` | ✅ |
| `cover.position` | `articleList.coverPosition` | ✅ |
| `cover.default_cover` | — | ❌ |
| `disable_top_img` | `topImage.disableTopImg` | ✅ |
| `index_img` | `topImage.indexImg` | ✅ |
| `default_top_img` | `topImage.defaultTopImg` | ✅ |
| `index_site_info_top` | `topImage.siteInfoTop` | ✅ |
| `index_top_img_height` | `topImage.topImgHeight` | ✅ |
| `mainTone.*` | `mainTone.*` | ✅ |
| `index_post_content.method` | `articleList.introMethod` | ✅ |
| `index_post_content.length` | `articleList.introLength` | ✅ |
| `article_double_row` | `articleList.doubleRow` | ✅ |
| `post_meta.page` (date_type/format/categories/tags/label) | — | ❌ |
| `peoplecanvas` | — | ❌ |

### 待补充字段 (按页面)

**首页设置** — `post_meta.page`, `cover.default_cover`, `home_top.swiper.css/js`, `category.class`, `peoplecanvas`
**侧栏设置** — `sidebar.site_data/menus_items/tags_cloud/display_mode`, `aside.card_*` 详细配置
**SEO 设置** — `site_verification.msvalidate`, `Open_Graph_meta`
**全局设置** — `favicon`, `avatar`, `pwa`, `footer.socialBar.centerImg`, `footer.list`, `footer.footerBar.cc/linkList`, `footer.runtime` 详细字段
**文章设置** — `toc`, `wordcount`, `ptool`, `post_edit`, `photofigcaption`, `h2Divider`, `anchor`
**评论设置** — `valine`/`waline`/`giscus` 完整字段, `newest_comments`, `visitorMail`
**代码与搜索** — `mermaid`, `note`, `table_interlaced_discoloration`, `icons`
**统计分析** — `cnzz_analytics`, `google_adsense`
**特效与功能** — `sharejs`/`addtoany`, `chat_*`, `preloader`, `centerConsole`, `friends_vue`, `dynamicEffect`, `agreementPopup`, `snackbar`, `aplayerInject`
**主题管理** — `beautify`, `blog_title_font`, `icons`

### 未纳入后台的配置 (技术层，无需 UI)

| 配置 | 原因 |
|------|------|
| `CDN` | 构建时配置，非运行时 |
| `css_prefix` | 构建工具自动处理 |
| `category_ui` / `tag_ui` | 前台路由逻辑，非配置项 |
| `pageThumbnailSuffix` | 低优先级 |

---

## 安知鱼主题参考文件

> **重要开发参考**：安知鱼 Hexo 主题完整源码已克隆到 `docs/anzhiyu-reference/hexo-theme-anzhiyu/`。
> 所有前台页面的 Vue 3 复刻均以此目录中的 Pug 模板、CSS 样式、JS 脚本为参考基准。

### 参考文件结构

```
docs/anzhiyu-reference/hexo-theme-anzhiyu/
├── _config.yml              # 1343 行完整配置（→ 后台 11 个配置页面）
├── languages/               # 多语言文件 (zh-CN, zh-TW, en)
├── layout/                  # 页面模板 (Pug → Vue 3 复刻)
│   ├── index.pug            # 首页
│   ├── post.pug             # 文章详情页
│   ├── archive.pug          # 归档页
│   ├── category.pug         # 分类页
│   ├── tag.pug              # 标签页
│   ├── page.pug             # 自定义页面
│   └── includes/            # 组件/局部模板
│       ├── layout.pug       # 主布局骨架 (HTML shell)
│       ├── head.pug         # <head> 配置注入
│       ├── header/          # 顶部导航 + 社交 + 文章元信息
│       ├── footer.pug       # 页脚 (版权/徽章/运行时间/链接)
│       ├── sidebar.pug      # 移动端侧栏
│       ├── widget/          # 侧栏小部件 (15 个)
│       ├── top/             # 首页 Hero 区域
│       ├── post/            # 文章相关 (版权/元信息)
│       ├── loading/         # 加载动画
│       ├── anzhiyu/         # 安知鱼特有 (AI摘要/右键菜单/控制台)
│       ├── third-party/     # 第三方集成 (评论/搜索/统计)
│       └── mixins/          # 可复用 Pug mixins
└── source/                  # 主题静态资源 (CSS/JS/图片)
```

### 参考文件使用方式

| 要实现什么 | 参考文件 |
|-----------|---------|
| 前台页面结构 | `layout/*.pug` → Vue 3 `<template>` |
| 配置项默认值 | `_config.yml` → 后台表单默认值 |
| 侧栏小部件 | `layout/includes/widget/*.pug` → `components/blog/*Widget.vue` |
| 文章渲染逻辑 | `layout/post.pug` + `layout/includes/post/` |
| 首页 Hero 区域 | `layout/includes/top/` + `layout/includes/header/` |
| 页脚结构 | `layout/includes/footer.pug` |
| CSS 样式/颜色 | `source/` → CSS Variables (`variables.css`) |
| 多语言文案 | `languages/zh-CN.yml` |

---

## 前台页面 (安知鱼风格) — 完整对照表

### 前台路由与页面

| 前台路由 | Vue 页面文件 | 对应安知鱼 | 后台驱动 | 状态 |
|---------|-------------|-----------|---------|------|
| `/` | `pages/index.vue` | `layout/index.pug` | 首页设置 + 侧栏设置 + 全局设置 | 🔄 进行中 |
| `/articles/[year]/[month]/[id]` | `pages/articles/...` | `layout/post.pug` | 文章设置 + 评论设置 | ✅ 基本完成 |
| `/articles` | `pages/articles/` | 文章列表 | 首页设置 (分页/封面) | 🔄 进行中 |
| `/categories` | `pages/categories/` | `layout/category.pug` | 分类管理 | 🔄 进行中 |
| `/tags` | `pages/tags/` | `layout/tag.pug` | 标签管理 | 🔄 进行中 |
| `/archive` | `pages/archive.vue` | `layout/archive.pug` | — | ❌ 未建 |
| `/about` | 自定义页面 | `layout/includes/page/about.pug` | 页面管理 | ✅ |
| `/links` | 自定义页面 | `layout/includes/page/flink.pug` | 全局设置 (social) | ❌ 未建 |
| `/[slug]` | 动态路由 | `layout/page.pug` | 页面管理 | ✅ |
| 404 | `error.vue` | `layout/includes/404.pug` | — | ❌ 未建 |

### 前台组件 ↔ 安知鱼模板对照

| Nuxt 组件 | 对应安知鱼模板 | 功能 | 状态 |
|----------|--------------|------|------|
| `HomeTop.vue` | `layout/includes/top/top.pug` | 首页 Hero 区域 (标题+副标题+社交) | ✅ |
| `BlogSlider.vue` | `layout/includes/top/` (swiper) | 文章轮播 | ✅ |
| `BannerGroup.vue` | `home_top.banner` | 今日推荐横幅 | ✅ |
| `TopGroup.vue` | `layout/includes/top/` | 顶部文章组 | ✅ |
| `CategoryBar.vue` | `home_top.category` | 分类快捷入口 | ✅ |
| `CategoryItem.vue` | `home_top.category[].item` | 单个分类按钮 | ✅ |
| `PostItem.vue` | `layout/includes/mixins/post-ui.pug` | 文章列表项 | ✅ |
| `ArticleCard.vue` | 文章卡片 | 卡片式文章展示 | ✅ |
| `ArticleContent.vue` | `layout/post.pug` (content) | Markdown 渲染 + 代码高亮 | ✅ |
| `Pagination.vue` | `layout/includes/pagination.pug` | 分页导航 | ✅ |
| `CategoryNav.vue` | `layout/includes/categoryGroup.pug` | 分类导航 | ✅ |
| `TagCloud.vue` | `layout/includes/widget/card_tags.pug` | 标签云 | ✅ |
| `TableOfContents.vue` | `layout/includes/widget/card_post_toc.pug` | 文章目录 | ✅ |
| `Sidebar.vue` | `layout/includes/sidebar.pug` | 侧栏容器 | ✅ |
| `ProfileWidget.vue` | `layout/includes/widget/card_author.pug` | 博主信息卡 | ✅ |
| `StatsWidget.vue` | `layout/includes/widget/card_webinfo.pug` | 网站统计卡 | ✅ |
| `RecentPostsWidget.vue` | `layout/includes/widget/card_recent_post.pug` | 最新文章 | ✅ |

### 前台尚未复刻的安知鱼组件

| 安知鱼模板 | 功能 | 对应 Nuxt 组件 (待建) |
|-----------|------|---------------------|
| `layout/includes/header/index.pug` | 顶部导航栏 (PC+移动) | `BlogNavbar.vue` |
| `layout/includes/header/social.pug` | 社交图标行 | 可合并到 HomeTop |
| `layout/includes/header/post-info.pug` | 文章页顶部元信息 | `PostHeader.vue` |
| `layout/includes/footer.pug` | 完整页脚 (版权/徽章/社交栏/链接) | `BlogFooter.vue` |
| `layout/includes/widget/card_announcement.pug` | 公告栏 | `AnnounceWidget.vue` |
| `layout/includes/widget/card_archives.pug` | 归档小部件 | `ArchiveWidget.vue` |
| `layout/includes/widget/card_categories.pug` | 分类小部件 | `CategoriesWidget.vue` |
| `layout/includes/widget/card_weixin.pug` | 微信卡片 | `WechatWidget.vue` |
| `layout/includes/widget/card_newest_comment.pug` | 最新评论 | `RecentCommentsWidget.vue` |
| `layout/includes/widget/card_ad.pug` | 广告位 | `AdWidget.vue` |
| `layout/includes/loading/` | 加载动画 (fullpage/pace) | `Preloader.vue` |
| `layout/includes/rightside.pug` | 右下角按钮组 | `RightsideButtons.vue` |
| `layout/includes/music.pug` | 左下角音乐播放器 | `MusicPlayer.vue` |
| `layout/includes/anzhiyu/rightmenu.pug` | 定制右键菜单 | `RightClickMenu.vue` |
| `layout/includes/anzhiyu/ai-info.pug` | 文章 AI 摘要 | `AiSummary.vue` |
| `layout/includes/anzhiyu/console.pug` | 控制台欢迎信息 | 内联 script |
| `layout/includes/bbTimeList.pug` | 首页顶部时间轴 | `TimeBanner.vue` |
| `layout/includes/shortcutKey.pug` | 快捷键 | `ShortcutKeys.vue` |
| `layout/includes/third-party/search/` | 搜索组件 (Algolia/本地) | `SearchWidget.vue` |
| `layout/includes/third-party/comments/` | 评论组件 | `CommentWidget.vue` |
| `layout/includes/post/post-copyright.pug` | 文章版权声明 | `PostCopyright.vue` |
| `layout/includes/popup/` | 弹窗通知 | `ToastNotification.vue` |

### 前台布局结构图

```
┌─────────────────────────────────────────────────┐
│ BlogNavbar.vue        ← header/index.pug        │
│ (Logo + 导航 + 社交 + 暗色切换)                   │
├─────────────────────────────────────────────────┤
│ HomeTop.vue           ← top/top.pug             │
│ (Hero 全屏背景 + 标题 + 副标题 + 社交图标)          │
├─────────────────────────────────────────────────┤
│ CategoryBar.vue       ← home_top.category       │
│ (分类快捷入口按钮)                                │
├─────────────────────────────────────────────────┤
│ BlogSlider / BannerGroup / TopGroup             │
│ (轮播 / 今日推荐 / 文章组)                        │
├────────────────────────────────┬────────────────┤
│ PostItem / ArticleCard (列表)  │ Sidebar.vue    │
│ Pagination.vue (分页)          │ ProfileWidget  │
│                                │ StatsWidget    │
│                                │ TagCloud       │
│                                │ RecentPosts    │
│                                │ ArchiveWidget  │
├────────────────────────────────┴────────────────┤
│ BlogFooter.vue         ← footer.pug             │
│ (版权 + 徽章 + 社交栏 + 运行时间)                  │
├─────────────────────────────────────────────────┤
│ RightsideButtons │ MusicPlayer │ Preloader       │
│ ShortcutKeys │ RightClickMenu │ SearchWidget     │
└─────────────────────────────────────────────────┘
```

---

## 已实现功能

### 后台管理 ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 仪表盘 | ✅ | 统计卡片 + 最新文章 + 操作动态 |
| 文章管理 | ✅ | CRUD、分类、标签、SEO、批量导入 Markdown |
| 页面管理 | ✅ | 自定义页面 CRUD |
| 草稿箱 | ✅ | 草稿保存和管理 |
| 分类管理 | ✅ | 树形分类 |
| 标签管理 | ✅ | 标签 CRUD |
| 媒体库 | ✅ | 上传、预览、筛选、批量操作、视图切换 |
| 首页设置 | ✅ | HomeTop、分类入口、今日推荐、文章列表、封面、顶部图、主色调 |
| 侧栏设置 | ✅ | 侧栏开关 + 7 个小部件选择 |
| SEO 设置 | ✅ | 标题/描述/关键词 + 百度/Google 验证 |
| 全局设置 | ✅ | 社交链接、页脚、深色模式、标题卖萌、控制台、自定义注入 |
| 文章设置 | ✅ | 文章元信息、版权声明、打赏、相关文章、分页、过期提醒 |
| 评论设置 | ✅ | 5 种评论系统选择与配置 |
| 代码与搜索 | ✅ | 代码高亮、复制、搜索、数学公式、懒加载、排版优化 |
| 统计分析 | ✅ | 7 种统计服务 + 不蒜子 |
| 特效与功能 | ✅ | 背景特效、音乐、AI 摘要、右键菜单、快捷键、欢迎语、评论弹幕 |
| 主题管理 | ✅ | 配色/字体/间距/圆角/布局 + 实时预览 + CSS 变量导出 |
| 插件管理 | ✅ | 插件列表/启用/禁用/筛选 |

### 前台博客 (安知鱼风格) — 7 页 + 17 组件

#### 前台页面 (7 个)

| 页面 | 路由 | 状态 | 说明 |
|------|------|------|------|
| 首页 | `/` | 🔄 进行中 | Hero + 分类栏 + 文章列表 + 侧栏 |
| 文章详情 | `/articles/[year]/[month]/[id]` | ✅ 基本完成 | Markdown 渲染 + 代码高亮 + 卡片容器 |
| 文章列表 | `/articles` | 🔄 进行中 | 分页浏览 |
| 分类页 | `/categories` | 🔄 进行中 | 分类树 + 文章筛选 |
| 标签页 | `/tags` | 🔄 进行中 | 标签云 + 文章筛选 |
| 自定义页面 | `/[slug]` | ✅ | 动态路由渲染 |
| 归档页 | `/archive` | ❌ 未建 | 时间线归档 |

#### 前台组件 (17 个已建 + 22 个待建)

**已建组件 (17):**

| 组件 | 功能 | 状态 |
|------|------|------|
| `HomeTop.vue` | Hero 区域 (全屏背景+标题+社交图标) | ✅ |
| `BlogSlider.vue` | 文章轮播 | ✅ |
| `BannerGroup.vue` | 今日推荐横幅 | ✅ |
| `TopGroup.vue` | 顶部文章组 | ✅ |
| `CategoryBar.vue` | 分类快捷入口导航 | ✅ |
| `CategoryItem.vue` | 单个分类按钮 | ✅ |
| `PostItem.vue` | 文章列表项 | ✅ |
| `ArticleCard.vue` | 文章卡片 | ✅ |
| `ArticleContent.vue` | Markdown 内容渲染 + 代码高亮 | ✅ |
| `Pagination.vue` | 分页导航 | ✅ |
| `CategoryNav.vue` | 分类导航 | ✅ |
| `TagCloud.vue` | 标签云 | ✅ |
| `TableOfContents.vue` | 文章目录 | ✅ |
| `Sidebar.vue` | 侧栏容器 | ✅ |
| `ProfileWidget.vue` | 博主信息卡 | ✅ |
| `StatsWidget.vue` | 网站统计 | ✅ |
| `RecentPostsWidget.vue` | 最新文章列表 | ✅ |

**待建组件 (22):**

| 组件 | 对应安知鱼模板 | 优先级 |
|------|--------------|--------|
| `BlogNavbar.vue` | `header/index.pug` | P0 |
| `BlogFooter.vue` | `footer.pug` | P0 |
| `PostHeader.vue` | `header/post-info.pug` | P1 |
| `PostCopyright.vue` | `post/post-copyright.pug` | P1 |
| `AnnounceWidget.vue` | `widget/card_announcement.pug` | P1 |
| `ArchiveWidget.vue` | `widget/card_archives.pug` | P1 |
| `CategoriesWidget.vue` | `widget/card_categories.pug` | P1 |
| `WechatWidget.vue` | `widget/card_weixin.pug` | P2 |
| `RecentCommentsWidget.vue` | `widget/card_newest_comment.pug` | P2 |
| `AdWidget.vue` | `widget/card_ad.pug` | P3 |
| `Preloader.vue` | `loading/` | P1 |
| `RightsideButtons.vue` | `rightside.pug` | P1 |
| `MusicPlayer.vue` | `music.pug` | P1 |
| `RightClickMenu.vue` | `anzhiyu/rightmenu.pug` | P1 |
| `AiSummary.vue` | `anzhiyu/ai-info.pug` | P1 |
| `SearchWidget.vue` | `third-party/search/` | P1 |
| `CommentWidget.vue` | `third-party/comments/` | P1 |
| `TimeBanner.vue` | `bbTimeList.pug` | P2 |
| `ShortcutKeys.vue` | `shortcutKey.pug` | P2 |
| `ToastNotification.vue` | `popup/` | P2 |
| `FriendsPage.vue` | `page/flink.pug` | P2 |
| `404Page.vue` | `404.pug` | P3 |

#### 前台覆盖率

| 类别 | 已建 | 待建 | 完成度 |
|------|------|------|--------|
| 页面 (7) | 6 | 1 (归档) | 85% |
| 核心组件 (Hero/文章/侧栏) | 17 | 0 | 100% |
| 辅助组件 (导航/页脚/搜索/评论) | 0 | 8 | 0% |
| 效果组件 (音乐/右键/快捷键/AI摘要) | 0 | 8 | 0% |
| 扩展组件 (微信/广告/友链/404) | 0 | 6 | 0% |
| **总计 (39)** | **17** | **22** | **44%**

### 插件系统 ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 钩子系统 | ✅ | 文章渲染、侧边栏、Footer 等 6 个挂载点 |
| 插件市场 | ✅ | 官方插件列表 |
| 主题市场 | ✅ | 官方主题列表 |

---

## 已知问题与重构计划

> 审计日期：2026-05-13。以下问题在开发过程中积累，需要系统性重构解决。

### 一、架构层问题

#### 1.1 两套配置系统互相隔离 (严重)

项目存在两套独立的配置存储和读取路径，互不相通：

| 系统 | 存储 | 写入 | 读取 | 用途 |
|------|------|------|------|------|
| **Settings 系统** | `system_settings` 表 (K-V) | `/api/settings` PUT | `/api/settings` GET | 11 个后台配置页面 |
| **Theme 系统** | `theme_settings` 表 + `themes/*/config.json` | `ThemeManager.activate()` | `ThemeManager.getActiveCSS()` | 主题配色/字体/间距 |

**问题**：后台的 `themes.vue` 使用 ThemeCustomizer 组件，保存到 `system_settings` 表的 `themeConfig` key。但 `ThemeManager` 从 `theme_settings` 表 + 文件系统读配置。**你在后台配的主题颜色，ThemeManager 根本不知道。**

**修复方向**：统一到一套系统。ThemeCustomizer 保存时同时写入 `theme_settings` 表（或直接调用 `ThemeManager`），`ThemeManager` 不再依赖文件系统扫描。

#### 1.2 主题 CSS 变量无法注入前台 (严重)

`ThemeManager.getActiveCSS()` 能生成 `:root { --color-primary: #xxx; }`，但：
- 没有 API endpoint 暴露这段 CSS
- 前台布局 `layouts/frontend/default.vue` 没有调用它
- 前台页面使用的是 `variables.css` 里的**硬编码默认值**

**修复方向**：添加 `/api/themes/active.css` GET endpoint，返回 `text/css`。前台布局通过 `<link>` 或 `<style>` 动态注入。

#### 1.3 Composables 层完全缺失 (严重)

`composables/` 目录不存在。所有共享逻辑被复制粘贴：

```
11 个后台页面 × 相同的 fetchSettings() (30 行) = 330 行重复代码
11 个后台页面 × 相同的 handleSave()   (20 行) = 220 行重复代码
```

前台 `index.vue` 和 `Sidebar.vue` 各自独立 fetch settings/articles/categories/tags，没有数据共享。

**修复方向**：
- `useSiteSettings()` — 前台统一读取所有 settings，带缓存和 SSR 支持
- `useAdminSettings(keys, category)` — 后台统一 fetch + save 逻辑
- 所有页面和组件通过 composables 获取数据，不再各自 fetch

#### 1.4 后台布局双重嵌套 (中等)

```
pages/admin.vue          ← 没设 layout → Nuxt 套 frontend default
  └─ <NuxtPage />
       └─ homepage.vue   ← layout: 'admin-default'
```

导致前端布局（header/footer）包裹后台布局（sidebar/navbar），产生双重 scroll 容器。

**修复方向**：`admin.vue` 添加 `layout: 'admin-default'`，所有子页面去掉 layout 声明，继承父级。

### 二、数据层问题

#### 2.1 batchUpdate 非事务 (中等)

```ts
// settings.service.ts — 逐条执行，非原子操作
for (const item of items) {
  await SettingsService.upsert(item.key, item.value, ...)
}
```

10 个 key 保存时如果第 7 个失败，前 6 个已写入，无法回滚。

**修复方向**：用 Drizzle 的 `db.transaction()` 包裹批量操作。

#### 2.2 值类型完全丢失 (中等)

```ts
// settings.service.ts
value: value as any  // 所有类型信息丢失
```

JSON 列存进去是序列化数据，读出来时无 schema 验证。前端全靠手动 `as string` / `as number` 强制转换，运行时类型错误无法被 TypeScript 捕获。

**修复方向**：用 Zod schema 定义每个 setting key 的类型，读写时自动校验和序列化/反序列化。

#### 2.3 无缓存层 (低)

每次页面加载都全量查询 `system_settings` 表。settings 是低频变更数据，完全可以缓存。

**修复方向**：Nitro 内存缓存 + 写入时自动失效。

### 三、前端层问题

#### 3.1 页面样式方案不统一 (中等)

| 方式 | 生效？ | 使用情况 |
|------|--------|---------|
| scoped `<style>` + `@apply` | ❌ 不生效 | homepage.vue 曾用，边框全丢 |
| 内联 UnoCSS 工具类 | ✅ | seo.vue, sidebar.vue 等 |
| 组件内 `<style scoped>` 普通 CSS | ✅ | 个别组件 |

`@apply` 需要 UnoCSS `transformerDirectives`，当前未开启。

**修复方向**：统一用内联 UnoCSS 工具类。如需抽象，用 UnoCSS `shortcuts` 配置而非 scoped `@apply`。

#### 3.2 前台组件与后台配置未打通 (高)

后台设了封面位置、摘要方式、侧栏小部件选择——但前台组件各自独立 fetch，彼此不知道对方的数据。
- `index.vue` fetch `/api/settings` → 手动解析到 `homeTopConfig`/`sidebarConfig`
- `Sidebar.vue` 独立 fetch articles/categories/tags
- 没有 `useSiteConfig()` 统一入口

**修复方向**：建 `useSiteSettings()` composable，所有前台组件通过它拿配置，底层用 `useState` 确保 SSR 和客户端共享同一份数据。

#### 3.3 后台页面结构不统一 (低)

每个页面的根容器、间距、卡片写法不完全一致：
- seo.vue: `<div class="space-y-6">` 
- 有的用 `mb-6` 做 header 间距
- 有的根容器无任何 class

**修复方向**：不需要抽象成组件模板——11 个页面的内容各不相同，强行统一会失去灵活性。但应该约定根容器 class = `space-y-6`，header 统一用 `mb-6`。

### 四、安全层问题

#### 4.1 无 CSRF 保护 (低)

JWT 通过 `Authorization: Bearer xxx` header 传递，浏览器不会自动附加，天然防 CSRF。但如果后续添加 cookie 认证需要加 CSRF token。

#### 4.2 无请求频率限制 (低)

`server/middleware/rate-limit.ts` 存在但需确认是否对 `/api/admin/*` 生效。

### 五、重构优先级

| 优先级 | 任务 | 影响范围 | 预估工作量 |
|--------|------|---------|-----------|
| **P0** | 统一配置系统 (合并 settings + theme) | server + admin + frontend | 大 |
| **P0** | 建 `useSiteSettings()` + `useAdminSettings()` composables | 所有页面 | 中 |
| **P0** | 修复 admin.vue 布局链 | layouts + 所有 admin 子页面 | 小 |
| **P0** | 添加 `/api/themes/active.css` endpoint | server + frontend layout | 小 |
| **P1** | batchUpdate 加事务 | settings.service.ts | 小 |
| **P1** | 前台 BlogNavbar + BlogFooter 组件 | components/blog/ | 中 |
| **P1** | 统一样式方案 (scoped `@apply` → 内联 UnoCSS) | 所有页面 | 中 |
| **P2** | Settings 值加 Zod 类型校验 | server/services/ | 中 |
| **P2** | 补全后台各页面缺失字段 | admin pages | 中 |
| **P3** | 添加 settings 缓存层 | server/services/ | 小 |
| **P3** | 补全前台 22 个待建组件 | components/blog/ | 大 |

---

## 待开发功能

### 第零阶段：架构重构 (P0) 🔧

> 必须先修好地基再盖楼

- [ ] **统一配置系统** — 合并 `system_settings` 和 `theme_settings` 两条存储路径
- [ ] **`useSiteSettings()` composable** — 前台统一配置入口，替代所有分散的 fetch
- [ ] **`useAdminSettings()` composable** — 后台统一 fetch/save 逻辑，消除 11 个页面中的重复代码
- [ ] **修复 admin.vue 布局链** — `admin.vue` 加 `layout: 'admin-default'`，子页面去掉 layout 声明
- [ ] **添加 `/api/themes/active.css` endpoint** — 让后台配的主题颜色真正注入前台
- [ ] **统一样式方案** — 全部改用内联 UnoCSS 工具类，废弃 scoped `@apply`

### 第一阶段：前台核心组件补全 (P0)

> 目标：前台页面具备完整的导航、页脚、搜索、评论能力

- [ ] **BlogNavbar.vue** — 顶部导航栏 (参考 `header/index.pug`)
- [ ] **BlogFooter.vue** — 完整页脚 (参考 `footer.pug`)
- [ ] **SearchWidget.vue** — 搜索组件 (参考 `third-party/search/`)
- [ ] **CommentWidget.vue** — 评论组件 (参考 `third-party/comments/`)
- [ ] **归档页** — 时间线归档页面
- [ ] **batchUpdate 加事务** — `settings.service.ts` 用 `db.transaction()`

### 第二阶段：文章体验增强 (P1)

- [ ] **PostHeader.vue** — 文章页顶部元信息 (参考 `header/post-info.pug`)
- [ ] **PostCopyright.vue** — 文章版权声明 (参考 `post/post-copyright.pug`)
- [ ] **AiSummary.vue** — 文章 AI 摘要 (参考 `anzhiyu/ai-info.pug`)
- [ ] **Preloader.vue** — 加载动画 (参考 `loading/`)
- [ ] **RightsideButtons.vue** — 右下角按钮组 (参考 `rightside.pug`)
- [ ] **MusicPlayer.vue** — 左下角音乐播放器 (参考 `music.pug`)
- [ ] **RightClickMenu.vue** — 定制右键菜单 (参考 `anzhiyu/rightmenu.pug`)
- [ ] **Settings 值加 Zod 类型校验**

### 第三阶段：后台字段补全 + 侧栏完善 (P2)

- [ ] 补全后台各页面缺失的 AnzhiYu 配置字段（见上方按页面清单）
- [ ] **AnnounceWidget / ArchiveWidget / CategoriesWidget** — 侧栏小部件
- [ ] **WechatWidget / RecentCommentsWidget** — 扩展侧栏组件
- [ ] **后台各页面 UI 精细化打磨**

### 第四阶段：扩展页面与效果 (P3)

- [ ] **FriendsPage.vue** — 友链页 (参考 `page/flink.pug`)
- [ ] **404Page.vue** — 404 页面
- [ ] **TimeBanner.vue** — 首页时间轴 (参考 `bbTimeList.pug`)
- [ ] **ShortcutKeys.vue** — 快捷键支持
- [ ] **ToastNotification.vue** — 弹窗通知
- [ ] **Settings 缓存层**

---

## 文件结构

```
my-blog/
├── apps/site/
│   ├── components/
│   │   ├── layouts/            # 布局组件
│   │   ├── admin/              # 后台组件
│   │   │   ├── common/         # Sidebar, Navbar, Breadcrumb, CommandPalette
│   │   │   ├── dashboard/      # StatCards, QuickActions, ActivityTimeline
│   │   │   ├── articles/       # ArticleTable, ArticleEditor, TagInput, CategorySelector
│   │   │   ├── categories/     # CategoryTree, CategoryForm
│   │   │   ├── tags/           # TagTable, TagForm
│   │   │   ├── drafts/         # DraftList
│   │   │   ├── media/          # MediaUploader, MediaGallery
│   │   │   ├── themes/         # ThemeCard, ThemeCustomizer, ColorEditor, FontSelector, SpacingEditor, ThemePreview, CssVarsEditor
│   │   │   ├── plugins/        # PluginCard, ConfigFormRenderer
│   │   │   └── settings/       # SettingsForm (通用表单渲染器)
│   │   ├── blog/               # 前台组件 (安知鱼风格)
│   │   │   ├── HomeTop.vue     # Hero 区域
│   │   │   ├── BlogSlider.vue  # 文章轮播
│   │   │   ├── BannerGroup.vue # Banner 组合
│   │   │   ├── CategoryBar.vue # 分类导航栏
│   │   │   ├── CategoryItem.vue
│   │   │   ├── TopGroup.vue    # 顶部文章组
│   │   │   ├── PostItem.vue    # 文章条目
│   │   │   ├── ArticleCard.vue # 文章卡片
│   │   │   ├── ArticleContent.vue # 文章内容渲染
│   │   │   ├── Pagination.vue  # 分页
│   │   │   ├── CategoryNav.vue # 分类导航
│   │   │   ├── TagCloud.vue    # 标签云
│   │   │   ├── TableOfContents.vue # 文章目录
│   │   │   └── Sidebar/        # 侧边栏组件 (ProfileWidget, StatsWidget, RecentPostsWidget)
│   │   └── ui/                 # 基础 UI 组件
│   ├── composables/            # 组合式函数
│   ├── pages/
│   │   ├── index.vue           # 首页
│   │   ├── articles/           # 文章列表/详情
│   │   ├── categories/         # 分类页
│   │   ├── tags/               # 标签页
│   │   └── admin/              # 后台页面 (17 个页面)
│   │       ├── index.vue       # 仪表盘
│   │       ├── login.vue       # 登录
│   │       ├── articles/       # 文章管理 (index/[id]/new)
│   │       ├── pages/          # 页面管理 (index/[id]/new)
│   │       ├── categories.vue  # 分类管理
│   │       ├── tags.vue        # 标签管理
│   │       ├── drafts.vue      # 草稿箱
│   │       ├── media.vue       # 媒体库
│   │       ├── homepage.vue    # 首页设置
│   │       ├── sidebar.vue     # 侧栏设置
│   │       ├── seo.vue         # SEO 设置
│   │       ├── general.vue     # 全局设置
│   │       ├── posts.vue       # 文章设置
│   │       ├── comments.vue    # 评论设置
│   │       ├── display.vue     # 代码与搜索
│   │       ├── analytics.vue   # 统计分析
│   │       ├── features.vue    # 特效与功能
│   │       ├── themes.vue      # 主题管理
│   │       └── plugins.vue     # 插件中心
│   ├── stores/                 # Pinia 状态
│   ├── server/
│   │   ├── api/                # Nitro API 路由
│   │   ├── core/               # 插件/主题/钩子系统
│   │   ├── db/                 # Schema/迁移/连接
│   │   ├── services/           # 业务服务层
│   │   └── storage/            # 存储适配层
│   └── utils/                  # 工具函数
├── packages/plugins/           # 独立插件包
├── themes/                     # 主题目录
└── docs/                       # 文档
    ├── architecture.md         # 架构文档
    ├── project-vision.md       # 本文件
    ├── priority-roadmap.md     # 优先级路线图
    └── anzhiyu-reference/      # 安知鱼主题参考 (克隆)
```

---

## 总结

本项目是一个**完整的动态内容管理平台**，以安知鱼主题为视觉参考：

> **目标：既要有安知鱼的美观前台（Nuxt 3 动态渲染版），又要有 WordPress 的后台管理能力，还要有插件化的扩展架构。**

目前已将安知鱼 1343 行 `_config.yml` 拆分为 **11 个可视化后台配置页面**，整体覆盖度约 **70%**。剩余 30% 为评论/特效/侧栏等页面的细分字段补全和前台 UI 效果的持续打磨。

让用户拥有自托管博客的完全控制权，同时享受现代化技术栈带来的开发效率和用户体验。

---

## 相关链接

- 安知鱼主题官网: https://docs.anheyu.com/
- 安知鱼 GitHub: https://github.com/anzhiyu-c/hexo-theme-anzhiyu
- Butterfly 原版: https://github.com/jerryc127/hexo-theme-butterfly
