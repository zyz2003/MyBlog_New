# Roadmap: 个人博客系统

**Created**: 2026-03-13
**Version**: v1.0

---

## Phase 1: 项目脚手架与核心系统

**Goal**: 搭建 Monorepo 架构，实现插件系统、主题系统、数据库 Schema 等核心基础设施

**Requirements**:
- THEME-01, THEME-02, THEME-03, THEME-04
- STYLE-01, STYLE-02, STYLE-03
- PLUGIN-01, PLUGIN-02, PLUGIN-03, PLUGIN-04

**Success Criteria**:
1. pnpm workspace 正常运行，packages 和 apps 目录结构清晰
2. 插件注册中心可以注册和加载插件
3. 16 个标准挂载点可以正常工作
4. 主题切换功能验证通过
5. CSS Variables 动态换肤生效
6. 数据库 Schema 创建完成并可以迁移

**交付物**:
- `packages/core` - 核心系统包
- `packages/db` - 数据库包
- `apps/admin` - 后台应用脚手架
- `apps/site` - 前台应用脚手架

---

## Phase 2: 用户认证与内容管理

**Goal**: 实现用户登录认证、文章 CRUD、分类标签管理、基础前台和后台

**Requirements**:
- AUTH-01, AUTH-02, AUTH-03, AUTH-04
- CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06, CONTENT-07
- TAX-01, TAX-02, TAX-03, TAX-04
- SITE-01, SITE-02, SITE-03, SITE-04, SITE-05
- ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-06

**Success Criteria**:
1. 管理员可以登录后台
2. 可以创建、编辑、删除文章
3. 可以管理分类和标签
4. 前台可以正常访问文章列表和详情页（SSR）
5. 分类页和标签页正常显示

**交付物**:
- 完整的认证系统
- 文章管理 CRUD API
- 前台博客页面
- 后台管理界面

---

## Phase 3: 媒体资源管理

**Goal**: 实现媒体库、图片上传、多尺寸生成、存储配置

**Requirements**:
- MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04
- ADMIN-04

**Success Criteria**:
1. 可以上传图片/视频到媒体库
2. 图片自动生成缩略图
3. 支持本地存储和对象存储配置
4. 媒体库支持多种视图模式

**交付物**:
- 媒体管理 API
- 媒体库管理界面
- 图片处理服务

---

## Phase 4: 示例插件与文档完善

**Goal**: 开发示例插件（Twikoo 评论适配），完善开发文档

**Requirements**:
- 插件系统验证
- 文档完善

**Success Criteria**:
1. Twikoo 评论插件可以正常集成
2. 插件开发文档完整
3. 主题开发文档完整

**交付物**:
- plugins/twikoo-adapter - 示例插件
- 完整的开发文档

---

## 里程碑 v1.0

**目标**: 发布第一个可用版本

**包含 Phase**: 1, 2, 3, 4

**核心功能**:
- ✅ 博客内容管理（文章、分类、标签）
- ✅ 主题样式系统
- ✅ 插件系统
- ✅ 媒体资源管理
- ✅ 前台博客站点
- ✅ 后台管理系统

---

*Last updated: 2026-03-13 after roadmap creation*
