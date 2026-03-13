<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- 文章内容区 -->
    <article class="lg:col-span-2">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <!-- 封面图 -->
        <img
          v-if="post.coverImage"
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-64 object-cover"
        />

        <div class="p-8">
          <!-- 文章标题 -->
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            {{ post.title }}
          </h1>

          <!-- 文章元信息 -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
              <!-- 作者 -->
              <span class="flex items-center">
                <div class="w-8 h-8 mr-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {{ post.author?.username?.charAt(0) || 'A' }}
                </div>
                {{ post.author?.username || '匿名' }}
              </span>

              <!-- 发布时间 -->
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(post.publishedAt) }}
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

            <!-- 分类 -->
            <div class="flex items-center space-x-2">
              <NuxtLink
                v-for="category in post.categories"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {{ category.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <div v-html="renderedContent" class="article-content"></div>
          </div>

          <!-- 标签 -->
          <div v-if="post.tags && post.tags.length > 0" class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in post.tags"
                :key="tag.id"
                :to="`/tags/${tag.slug}`"
                class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                #{{ tag.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- 分享按钮 -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">分享这篇文章：</span>
            <div class="flex items-center space-x-3">
              <button class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" title="分享到微信">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
              </button>
              <button class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="分享到微博">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.098 20.323c-.794.389-1.584.654-2.266.736-1.904.229-5.394-.429-5.929-3.307-.139-.751.162-1.593.659-2.132.528-.57 1.432-1.023 2.654-1.338 2.327-.6 4.864-.174 6.424.75 1.56.925 2.023 2.555 1.452 3.926-.362.869-1.112 1.52-1.994 1.965zM7.5 7.5c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm0 4.5c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm9 1.5c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm0 4.5c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mt-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6">评论</h3>
        <div class="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>评论区正在加载中...</p>
          <p class="text-sm mt-2">（未来将集成 Twikoo 或其他评论系统）</p>
        </div>
      </div>
    </article>

    <!-- 右侧边栏 -->
    <aside class="space-y-6">
      <!-- 目录 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">目录</h3>
        <nav class="space-y-2 text-sm">
          <a href="#heading-1" class="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors pl-0 border-l-2 border-transparent hover:border-blue-600">
            文章目录
          </a>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup>
const route = useRoute()

// 状态
const post = ref(null)
const loading = ref(true)
const error = ref(null)

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

// 渲染内容（简单 Markdown 转 HTML）
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  // TODO: 使用 markdown-it 或其他库进行完整的 Markdown 渲染
  return post.value.content
})

// 获取文章详情
const fetchPost = async () => {
  try {
    loading.value = true
    post.value = await $fetch(`/api/posts/${route.params.slug}`)
  } catch (e) {
    error.value = e
    console.error('Failed to load post:', e)
  } finally {
    loading.value = false
  }
}

// 页面元数据
useHead(() => ({
  title: post.value ? `${post.value.title} - My Blog` : '加载中...',
  meta: [
    { name: 'description', content: post.value?.summary || post.value?.content?.substring(0, 200) },
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.summary },
    { property: 'og:image', content: post.value?.coverImage },
  ]
}))

// 初始化加载
onMounted(() => {
  fetchPost()
})

// SEO
useSeoMeta({
  title: () => post.value ? `${post.value.title} - My Blog` : '加载中...',
  description: () => post.value?.summary || '',
  ogTitle: () => post.value?.title || '',
  ogDescription: () => post.value?.summary || '',
  ogImage: () => post.value?.coverImage || '',
})
</script>

<style scoped>
.article-content :deep(h1) {
  font-size: 1.75rem;
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.article-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.article-content :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.article-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #6b7280;
}

.article-content :deep(ul), .article-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
}
</style>
