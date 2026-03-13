<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- 左侧文章列表 -->
    <div class="lg:col-span-2 space-y-6">
      <!-- 文章卡片 -->
      <article
        v-for="post in posts"
        :key="post.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <!-- 封面图 -->
        <NuxtLink v-if="post.coverImage" :to="`/articles/${post.slug}`" class="block">
          <img
            :src="post.coverImage"
            :alt="post.title"
            class="w-full h-48 object-cover hover:opacity-90 transition-opacity"
          />
        </NuxtLink>

        <div class="p-6">
          <!-- 文章标题 -->
          <NuxtLink :to="`/articles/${post.slug}`" class="block">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {{ post.title }}
            </h2>
          </NuxtLink>

          <!-- 文章摘要 -->
          <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {{ post.summary || post.content?.substring(0, 200) + '...' }}
          </p>

          <!-- 元信息 -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div class="flex items-center space-x-4">
              <!-- 发布日期 -->
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(post.publishedAt || post.createdAt) }}
              </span>

              <!-- 浏览量 -->
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {{ post.viewCount || 0 }}
              </span>
            </div>

            <!-- 分类和标签 -->
            <div class="flex items-center space-x-2">
              <NuxtLink
                v-for="category in post.categories?.slice(0, 2)"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {{ category.name }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>

      <!-- 空状态 -->
      <div v-if="posts.length === 0 && !loading" class="text-center py-16">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">暂无文章</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- 加载更多 -->
      <div v-if="!loading && hasMore" class="text-center py-4">
        <button
          @click="loadMore"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          加载更多
        </button>
      </div>
    </div>

    <!-- 右侧边栏 -->
    <aside class="space-y-6">
      <!-- 个人简介 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          B
        </div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">博主昵称</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">热爱技术，热爱生活</p>
        <div class="flex justify-center space-x-4">
          <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
        </div>
      </div>

      <!-- 分类 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          分类
        </h3>
        <div class="space-y-2">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="text-gray-700 dark:text-gray-300">{{ category.name }}</span>
            <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ category.postCount || 0 }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 标签 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          标签
        </h3>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in tags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            #{{ tag.name }}
          </NuxtLink>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
// 页面元数据
useHead({
  title: '首页 - My Blog',
  meta: [
    { name: 'description', content: '个人博客系统 - 分享技术与生活' }
  ]
})

// 状态
const posts = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)
const currentPage = ref(1)
const hasMore = ref(true)

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 加载文章
const loadPosts = async (page = 1, append = false) => {
  try {
    const data = await $fetch(`/api/articles?page=${page}&limit=10`)
    if (append) {
      posts.value = [...posts.value, ...(data.data || [])]
    } else {
      posts.value = data.data || []
    }
    hasMore.value = page < (data.pagination?.totalPages || 1)
  } catch (e) {
    console.error('Failed to load posts:', e)
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

// 加载标签
const loadTags = async () => {
  try {
    const data = await $fetch('/api/tags')
    tags.value = data.data || []
  } catch (e) {
    console.error('Failed to load tags:', e)
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  loadPosts(currentPage.value, true)
}

// 初始化加载
onMounted(async () => {
  loading.value = true
  await Promise.all([
    loadPosts(1),
    loadCategories(),
    loadTags()
  ])
  loading.value = false
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
