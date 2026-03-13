<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">仪表盘</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">欢迎回来，{{ user?.username || '管理员' }}！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 文章统计 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">总文章数</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.postCount }}</p>
            <p class="text-xs text-green-500 mt-2" v-if="stats.newPostsThisMonth > 0">
              +{{ stats.newPostsThisMonth }} 本月新增
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 分类统计 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">分类数</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.categoryCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 标签统计 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">标签数</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.tagCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 访问量统计 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">总访问量</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats.totalViews }}</p>
            <p class="text-xs text-green-500 mt-2" v-if="stats.newViewsToday > 0">
              +{{ stats.newViewsToday }} 今日新增
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近文章 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">最近文章</h2>
          <NuxtLink to="/admin/articles" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            查看全部
          </NuxtLink>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="recentPosts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p>暂无文章</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/admin/articles/edit/${post.id}`" class="block">
                  <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ post.title }}</p>
                </NuxtLink>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatDate(post.createdAt) }}
                </p>
              </div>
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="{
                  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': post.status === 'published',
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': post.status === 'draft',
                }"
              >
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">快速操作</h2>
        </div>
        <div class="p-6 grid grid-cols-2 gap-4">
          <NuxtLink
            to="/admin/articles/create"
            class="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">新建文章</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/media"
            class="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <svg class="w-8 h-8 text-green-600 dark:text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">媒体库</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/categories"
            class="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">分类管理</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            target="_blank"
            class="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M15 9l6 6m-6-6V3" />
            </svg>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">查看站点</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white">系统信息</h2>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">系统版本</p>
          <p class="text-sm font-medium text-gray-800 dark:text-white">v1.0.0 (开发中)</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">技术栈</p>
          <p class="text-sm font-medium text-gray-800 dark:text-white">Nuxt 3 + Vue 3 + TypeScript</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">数据库</p>
          <p class="text-sm font-medium text-gray-800 dark:text-white">SQLite (Drizzle ORM)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
useHead({
  title: '仪表盘 - 博客管理系统',
})

const user = ref(null)
const stats = ref({
  postCount: 0,
  categoryCount: 0,
  tagCount: 0,
  totalViews: 0,
  newPostsThisMonth: 0,
  newViewsToday: 0,
})
const recentPosts = ref([])
const loading = ref(true)

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

// 加载统计数据
const loadStats = async () => {
  try {
    const [posts, categories, tags] = await Promise.all([
      $fetch('/api/articles'),
      $fetch('/api/categories'),
      $fetch('/api/tags'),
    ])

    stats.value.postCount = posts.data?.length || 0
    stats.value.categoryCount = categories.data?.length || 0
    stats.value.tagCount = tags.data?.length || 0
    stats.value.totalViews = posts.data?.reduce((sum, post) => sum + (post.viewCount || 0), 0) || 0

    // 最近文章
    recentPosts.value = posts.data?.slice(0, 5) || []
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
}

// 获取当前用户
const fetchUser = async () => {
  try {
    user.value = await $fetch('/api/auth/me')
  } catch (e) {
    console.error('Failed to fetch user:', e)
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([fetchUser(), loadStats()])
})
</script>
