<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus, Search, Filter, Download } from 'lucide-vue-next'
import PostList from '~/components/admin/posts/PostList.vue'
import BulkActions from '~/components/admin/posts/BulkActions.vue'

interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: 'draft' | 'published' | 'archived' | 'reviewing'
  categoryId: string | null
  category?: { name: string; slug: string } | null
  tags: { name: string; slug: string }[]
  authorId: string
  author?: { username: string } | null
  viewCount: number
  likeCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface ListResponse {
  items: PostListItem[]
  total: number
  limit: number
  offset: number
}

// Route and router
const router = useRouter()

// Loading state
const loading = ref(false)

// Posts data
const posts = ref<PostListItem[]>([])
const total = ref(0)
const limit = ref(10)
const offset = ref(0)

// Selected posts for bulk operations
const selectedPostIds = ref<Set<string>>(new Set())
const selectAll = ref(false)

// Filters
const statusFilter = ref<string>('all')
const categoryFilter = ref<string>('all')
const tagFilter = ref<string>('all')
const searchQuery = ref('')

// Fetch posts list
async function fetchPosts() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      limit: String(limit.value),
      offset: String(offset.value),
    })

    if (statusFilter.value !== 'all') {
      params.append('status', statusFilter.value)
    }
    if (categoryFilter.value !== 'all') {
      params.append('category', categoryFilter.value)
    }
    if (tagFilter.value !== 'all') {
      params.append('tag', tagFilter.value)
    }
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    const response = await $fetch<ListResponse>(`/api/v1/posts?${params.toString()}`)
    posts.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
}

// Handle page size change
function handlePageSizeChange(value: string) {
  limit.value = Number(value)
  offset.value = 0
  fetchPosts()
}

// Handle page change
function handlePageChange(newOffset: number) {
  offset.value = newOffset
  fetchPosts()
}

// Handle search
function handleSearch() {
  offset.value = 0
  fetchPosts()
}

// Handle filter change
function handleFilterChange() {
  offset.value = 0
  fetchPosts()
}

// Handle bulk delete
async function handleBulkDelete() {
  if (selectedPostIds.value.size === 0) return

  if (!confirm(`确定要删除选中的 ${selectedPostIds.value.size} 篇文章吗？`)) {
    return
  }

  try {
    await $fetch('/api/v1/posts/bulk', {
      method: 'DELETE',
      body: { ids: Array.from(selectedPostIds.value) },
    })
    selectedPostIds.value.clear()
    selectAll.value = false
    fetchPosts()
  } catch (error) {
    console.error('Failed to bulk delete:', error)
  }
}

// Handle bulk publish
async function handleBulkPublish() {
  if (selectedPostIds.value.size === 0) return

  try {
    await $fetch('/api/v1/posts/bulk', {
      method: 'PUT',
      body: {
        ids: Array.from(selectedPostIds.value),
        status: 'published'
      },
    })
    selectedPostIds.value.clear()
    selectAll.value = false
    fetchPosts()
  } catch (error) {
    console.error('Failed to bulk publish:', error)
  }
}

// Handle bulk archive
async function handleBulkArchive() {
  if (selectedPostIds.value.size === 0) return

  try {
    await $fetch('/api/v1/posts/bulk', {
      method: 'PUT',
      body: {
        ids: Array.from(selectedPostIds.value),
        status: 'archived'
      },
    })
    selectedPostIds.value.clear()
    selectAll.value = false
    fetchPosts()
  } catch (error) {
    console.error('Failed to bulk archive:', error)
  }
}

// Navigate to create new post
function handleCreatePost() {
  router.push('/admin/posts/new')
}

// Navigate to edit post
function handleEditPost(id: string) {
  router.push(`/admin/posts/${id}`)
}

// Delete single post
async function handleDeletePost(id: string) {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await $fetch(`/api/v1/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
  } catch (error) {
    console.error('Failed to delete post:', error)
  }
}

// Calculate pagination
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const totalPagesDisplay = computed(() => Math.min(5, totalPages.value))

// Lifecycle
onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">文章管理</h1>
          <p class="text-sm text-slate-500 mt-1">创建、编辑和管理您的博客文章</p>
        </div>
        <Button @click="handleCreatePost">
          <Plus class="h-4 w-4 mr-2" />
          新建文章
        </Button>
      </div>

      <!-- Filters Bar -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            v-model="searchQuery"
            placeholder="搜索文章标题..."
            class="pl-9"
            @keyup.enter="handleSearch"
          />
        </div>
        <Select v-model="statusFilter" @update:model-value="handleFilterChange">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="reviewing">审核中</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="categoryFilter" @update:model-value="handleFilterChange">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="tagFilter" @update:model-value="handleFilterChange">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="标签" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部标签</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" @click="handleSearch">
          <Filter class="h-4 w-4 mr-2" />
          筛选
        </Button>
        <Button variant="outline">
          <Download class="h-4 w-4 mr-2" />
          导出
        </Button>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedPostIds.size > 0" class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <span class="text-sm text-slate-600">已选择 {{ selectedPostIds.size }} 篇文章</span>
        <Button variant="outline" size="sm" @click="handleBulkPublish">
          批量发布
        </Button>
        <Button variant="outline" size="sm" @click="handleBulkArchive">
          批量归档
        </Button>
        <Button variant="destructive" size="sm" @click="handleBulkDelete">
          批量删除
        </Button>
      </div>

      <!-- Posts Table -->
      <div class="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox
                  :checked="selectAll"
                  @update:checked="handleSelectAll"
                />
              </TableHead>
              <TableHead>标题</TableHead>
              <TableHead class="w-24">状态</TableHead>
              <TableHead class="w-32">分类</TableHead>
              <TableHead class="w-32">标签</TableHead>
              <TableHead class="w-24">浏览量</TableHead>
              <TableHead class="w-32">发布时间</TableHead>
              <TableHead class="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="post in posts" :key="post.id">
              <TableCell>
                <Checkbox
                  :checked="selectedPostIds.has(post.id)"
                  @update:checked="(checked) => handleSelectPost(post.id, checked)"
                />
              </TableCell>
              <TableCell>
                <div class="font-medium text-slate-900">{{ post.title }}</div>
                <div class="text-xs text-slate-500">{{ post.slug }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="statusConfig[post.status]?.variant">
                  {{ statusConfig[post.status]?.label }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-slate-600">
                {{ post.category?.name || '-' }}
              </TableCell>
              <TableCell class="text-sm text-slate-600">
                <div v-if="post.tags && post.tags.length > 0" class="flex gap-1">
                  <Badge v-for="tag in post.tags" :key="tag.slug" variant="outline" class="text-xs">
                    {{ tag.name }}
                  </Badge>
                </div>
                <span v-else class="text-slate-400">-</span>
              </TableCell>
              <TableCell class="text-sm text-slate-600">
                {{ post.viewCount }}
              </TableCell>
              <TableCell class="text-sm text-slate-600">
                {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('zh-CN') : '-' }}
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-sky-600 hover:text-sky-700"
                    @click="handleEditPost(post.id)"
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-red-600 hover:text-red-700"
                    @click="handleDeletePost(post.id)"
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="posts.length === 0 && !loading">
              <TableCell :colspan="8" class="text-center py-8 text-slate-500">
                暂无文章，点击"新建文章"开始创作
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-600">
          共 {{ total }} 条结果
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-600">每页</span>
            <Select v-model="limit" @update:model-value="handlePageSizeChange">
              <SelectTrigger class="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 条</SelectItem>
                <SelectItem value="20">20 条</SelectItem>
                <SelectItem value="50">50 条</SelectItem>
                <SelectItem value="100">100 条</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage <= 1"
              @click="handlePageChange((currentPage - 2) * limit)"
            >
              上一页
            </Button>
            <template v-for="page in totalPagesDisplay" :key="page">
              <Button
                :variant="currentPage === page ? 'default' : 'outline'"
                size="sm"
                class="w-8"
                @click="handlePageChange((page - 1) * limit)"
              >
                {{ page }}
              </Button>
            </template>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="handlePageChange(currentPage * limit)"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
