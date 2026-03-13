<template>
  <div>
    <!-- 页面标题和操作 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">文章管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理和编辑您的博客文章</p>
      </div>
      <NuxtLink
        to="/admin/articles/create"
        class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新建文章
      </NuxtLink>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center space-x-4">
          <!-- 状态筛选 -->
          <select
            v-model="filters.status"
            @change="loadArticles"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="scheduled">定时发布</option>
            <option value="archived">已归档</option>
          </select>

          <!-- 分类筛选 -->
          <select
            v-model="filters.category"
            @change="loadArticles"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- 搜索框 -->
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索文章标题或内容..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <!-- 表格 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                标题
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                分类
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                浏览量
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                发布日期
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </td>
            </tr>
            <tr v-else-if="articles.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>暂无文章</p>
                <NuxtLink to="/admin/articles/create" class="text-blue-600 hover:underline mt-2 inline-block">
                  创建第一篇文章
                </NuxtLink>
              </td>
            </tr>
            <tr
              v-for="article in articles"
              :key="article.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div v-if="article.coverImage" class="w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                    <img :src="article.coverImage" :alt="article.title" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/admin/articles/edit/${article.id}`"
                      class="text-sm font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {{ article.title }}
                    </NuxtLink>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {{ article.summary || '无摘要' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': article.status === 'published',
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': article.status === 'draft',
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': article.status === 'scheduled',
                    'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400': article.status === 'archived',
                  }"
                >
                  {{ statusText(article.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="category in article.categories?.slice(0, 2)"
                    :key="category.id"
                    class="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                  >
                    {{ category.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ article.viewCount || 0 }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(article.publishedAt || article.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <NuxtLink
                    :to="`/admin/articles/edit/${article.id}`"
                    class="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium"
                  >
                    编辑
                  </NuxtLink>
                  <button
                    @click="confirmDelete(article)"
                    class="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div
        v-if="pagination.totalPages > 1"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 条，共 {{ pagination.total }} 条
        </p>
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
useHead({
  title: '文章管理 - 博客管理系统',
})

// 状态
const articles = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filters = ref({
  status: '',
  category: '',
})
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// 状态文本映射
const statusText = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    scheduled: '定时发布',
    archived: '已归档',
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 加载文章
const loadArticles = async () => {
  try {
    loading.value = true
    const query = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.category && { category: filters.value.category }),
      ...(searchQuery.value && { search: searchQuery.value }),
    })

    const data = await $fetch(`/api/articles?${query}`)
    articles.value = data.data || []
    pagination.value = data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loading.value = false
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const data = await $fetch('/api/categories')
    categories.value = data.data || []
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadArticles()
}

// 翻页
const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadArticles()
}

// 确认删除
const confirmDelete = async (article) => {
  if (!confirm(`确定要删除文章"${article.title}"吗？此操作不可恢复。`)) {
    return
  }

  try {
    await $fetch(`/api/articles/${article.id}`, { method: 'DELETE' })
    articles.value = articles.value.filter((a) => a.id !== article.id)
  } catch (e) {
    console.error('Failed to delete article:', e)
    alert('删除失败，请重试')
  }
}

// 初始化
onMounted(async () => {
  await loadCategories()
  await loadArticles()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
