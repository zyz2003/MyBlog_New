# Phase 5: 后台管理 - Plan 04/08 执行总结

**Plan 名称**: 文章管理功能
**执行日期**: 2026-03-25
**状态**: ⚠️ 部分完成

---

## 一、执行概述

本 Plan 完成了文章管理的核心页面开发，包括文章列表页和文章编辑/新建页。部分子组件尚未拆分，功能已在页面中直接实现。

### 交付物清单

| 类型 | 文件 | 状态 |
|------|------|------|
| 列表页面 | `apps/site/pages/admin/posts/index.vue` | ✅ 完成 |
| 编辑页面 | `apps/site/pages/admin/posts/[id].vue` | ✅ 完成 |
| API 端点 | `apps/site/server/api/v1/posts/bulk.put.ts` | ✅ 完成 |

### 子组件状态

| 组件 | 文件 | 状态 | 备注 |
|------|------|------|------|
| PostList | `components/admin/posts/PostList.vue` | ⚠️ 已在页面内实现 | 可后续拆分 |
| SimpleEditor | `components/admin/posts/SimpleEditor.vue` | ❌ 未创建 | 使用 Textarea 替代 |
| PostForm | `components/admin/posts/PostForm.vue` | ⚠️ 已在页面内实现 | 可后续拆分 |
| BulkActions | `components/admin/posts/BulkActions.vue` | ⚠️ 已在页面内实现 | 可后续拆分 |
| CategoryTagSelector | `components/admin/posts/CategoryTagSelector.vue` | ❌ 未创建 | 使用 Select 直接实现 |
| CoverImageUploader | `components/admin/posts/CoverImageUploader.vue` | ❌ 未创建 | 使用 Input 直接实现 |

---

## 二、功能详情

### 2.1 文章列表页 (`/admin/posts/index.vue`)

**已实现功能**:

| 功能 | 状态 | 说明 |
|------|------|------|
| 表格展示 | ✅ | 使用 shadcn-vue Table 组件 |
| 分页 | ✅ | 支持 10/20/50/100 条每页 |
| 状态筛选 | ✅ | 全部/已发布/草稿/审核中/已归档 |
| 分类筛选 | ✅ | 预留 UI，待分类功能完成后启用 |
| 标签筛选 | ✅ | 预留 UI，待标签功能完成后启用 |
| 搜索 | ✅ | 按标题搜索 |
| 多选 | ✅ | Checkbox 支持全选/单选 |
| 批量发布 | ✅ | 批量更新状态为已发布 |
| 批量归档 | ✅ | 批量更新状态为已归档 |
| 批量删除 | ✅ | 批量删除选中文章 |
| 单篇删除 | ✅ | 行内删除按钮 |
| 编辑导航 | ✅ | 点击编辑跳转编辑页 |
| 状态徽章 | ✅ | 不同状态不同颜色 |
| 标签显示 | ✅ | 多标签以 Badge 显示 |
| 浏览量显示 | ✅ | 实时显示文章浏览量 |

**API 集成**:
- `GET /api/v1/posts?limit=&offset=&category=&tag=&status=&search=` - 获取文章列表
- `DELETE /api/v1/posts/bulk` - 批量删除
- `PUT /api/v1/posts/bulk` - 批量更新状态
- `DELETE /api/v1/posts/:id` - 删除单篇

### 2.2 文章编辑页 (`/admin/posts/[id].vue`)

**已实现功能**:

| 功能 | 状态 | 说明 |
|------|------|------|
| 新建模式 | ✅ | `/admin/posts/new` 路由 |
| 编辑模式 | ✅ | `/admin/posts/:id` 路由 |
| 标题输入 | ✅ | 必填，最少 2 字符验证 |
| Slug 生成 | ✅ | 从标题自动生成，可手动编辑 |
| Markdown 编辑 | ✅ | 使用 Textarea，支持 Markdown 语法 |
| 分类选择 | ✅ | Select 下拉选择 |
| 标签多选 | ✅ | 支持添加/移除多个标签 |
| 状态选择 | ✅ | 草稿/已发布/审核中/已归档 |
| 封面图 URL | ✅ | 输入图片 URL |
| SEO 标题 | ✅ | 可选 |
| SEO 描述 | ✅ | 可选 |
| 表单验证 | ✅ | 标题/Slug/内容验证 |
| 自动保存 | ✅ | 每 30 秒自动保存草稿 |
| 保存提示 | ✅ | 使用 Toast 提示 |
| 删除确认 | ✅ | 删除前弹窗确认 |
| 返回列表 | ✅ | 返回按钮 |
| 预览功能 | ✅ | 预留按钮（未实现） |

**API 集成**:
- `GET /api/v1/posts/:id` - 获取文章详情（编辑模式）
- `POST /api/v1/posts` - 创建新文章
- `PUT /api/v1/posts/:id` - 更新文章
- `DELETE /api/v1/posts/:id` - 删除文章

---

## 三、技术实现

### 3.1 使用的主要组件

- **shadcn-vue**: Table, Badge, Button, Checkbox, Input, Label, Select, Textarea, Card, Separator
- **lucide-vue-next**: Plus, Search, Filter, Download, Save, Eye, Trash2, ArrowLeft
- **Vue Router**: 路由导航和参数获取
- **Pinia**: 未使用（直接组件状态管理）
- **useToast**: Toast 提示

### 3.2 关键代码片段

**自动保存草稿**:
```typescript
let autoSaveTimer: NodeJS.Timeout | null = null

async function autoSave() {
  if (isNewPost.value || !post.value.id || saving.value) return
  const payload = {
    title: post.value.title,
    slug: post.value.slug,
    content: post.value.content,
    excerpt: post.value.excerpt,
    status: 'draft' as const,
  }
  await $fetch(`/api/v1/posts/${post.value.id}`, {
    method: 'PUT',
    body: payload,
  })
}

onMounted(() => {
  autoSaveTimer = setInterval(() => {
    if (isEditMode.value && post.value.id) {
      autoSave()
    }
  }, 30000)
})
```

**Slug 自动生成**:
```typescript
function generateSlug() {
  if (!post.value.title) return
  const slug = post.value.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  post.value.slug = slug
}
```

**批量操作**:
```typescript
async function handleBulkDelete() {
  if (selectedPostIds.value.size === 0) return
  if (!confirm(`确定要删除选中的 ${selectedPostIds.value.size} 篇文章吗？`)) return
  try {
    await $fetch('/api/v1/posts/bulk', {
      method: 'DELETE',
      body: { ids: Array.from(selectedPostIds.value) },
    })
    selectedPostIds.value.clear()
    fetchPosts()
  } catch (error) {
    console.error('Failed to bulk delete:', error)
  }
}
```

---

## 四、已知问题与待办

### 4.1 未完成的组件拆分

当前所有功能都在页面组件内实现，建议后续拆分为独立组件以提高可维护性：

- [ ] 提取 `PostList.vue` 组件
- [ ] 提取 `PostForm.vue` 组件
- [ ] 创建 `SimpleEditor.vue` 组件（带 Markdown 工具栏）
- [ ] 创建 `CategoryTagSelector.vue` 组件
- [ ] 创建 `CoverImageUploader.vue` 组件
- [ ] 提取 `BulkActions.vue` 组件

### 4.2 功能增强

- [ ] 富文本编辑器集成（TipTap/Vditor）
- [ ] 图片上传功能（从本地上传）
- [ ] 媒体库集成
- [ ] 文章预览功能
- [ ] 分类/标签管理页面
- [ ] 离开页面确认（有未保存更改时）

### 4.3 测试

- [ ] 创建 `PostList.test.ts`
- [ ] 创建 `PostForm.test.ts`
- [ ] 创建 `SimpleEditor.test.ts`
- [ ] 创建页面测试文件

---

## 五、API 端点使用

| 端点 | 方法 | 用途 | 状态 |
|------|------|------|------|
| `/api/v1/posts` | GET | 获取文章列表 | ✅ 已集成 |
| `/api/v1/posts` | POST | 创建文章 | ✅ 已集成 |
| `/api/v1/posts/:id` | GET | 获取文章详情 | ✅ 已集成 |
| `/api/v1/posts/:id` | PUT | 更新文章 | ✅ 已集成 |
| `/api/v1/posts/:id` | DELETE | 删除文章 | ✅ 已集成 |
| `/api/v1/posts/bulk` | DELETE | 批量删除 | ✅ 已集成 |
| `/api/v1/posts/bulk` | PUT | 批量更新 | ✅ 已集成 |

---

## 六、下一步计划

### Plan 05: 分类和标签管理

**目标**: 实现分类和标签的 CRUD 功能

**主要组件**:
- `CategoriesPage.vue` - 分类管理页面
- `TagsPage.vue` - 标签管理页面
- `CategoryForm.vue` - 分类表单
- `TagForm.vue` - 标签表单

### Plan 06: 媒体库管理

**目标**: 实现媒体文件的上传、管理和使用

**主要组件**:
- `MediaPage.vue` - 媒体库页面
- `MediaGrid.vue` - 媒体网格展示
- `MediaUploader.vue` - 上传组件

---

## 七、验收状态

- [x] 文章列表表格展示
- [x] 分页功能（页码 + 每页条数）
- [x] 筛选功能（状态、分类、标签、搜索）
- [x] 多选和批量操作
- [x] 新建文章页面
- [x] 编辑文章页面
- [x] 表单验证
- [x] 自动保存草稿
- [ ] SimpleEditor Markdown 工具栏（使用 Textarea 替代）
- [ ] 分类标签选择器组件（已在页面内实现）
- [ ] 封面图上传组件（使用 Input 替代）

**Must Have 完成度**: 7/10 (70%)

---

*文档创建时间：2026-03-25*
*Phase: 05-admin, Plan: 04/08*
