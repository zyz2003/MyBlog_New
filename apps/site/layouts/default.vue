<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ siteConfig.siteName }}
          </NuxtLink>

          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-6">
            <NuxtLink to="/" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              首页
            </NuxtLink>
            <NuxtLink to="/categories" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              分类
            </NuxtLink>
            <NuxtLink to="/tags" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              标签
            </NuxtLink>
            <NuxtLink to="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              关于
            </NuxtLink>
          </div>

          <!-- 右侧按钮 -->
          <div class="flex items-center space-x-4">
            <!-- 搜索按钮 -->
            <button class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- 后台入口 -->
            <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              管理
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- 主要内容区 -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 博客信息 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">{{ siteConfig.siteName }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{{ siteConfig.siteDescription }}</p>
          </div>

          <!-- 快速链接 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">快速链接</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">首页</NuxtLink></li>
              <li><NuxtLink to="/categories" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">分类</NuxtLink></li>
              <li><NuxtLink to="/tags" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">标签</NuxtLink></li>
            </ul>
          </div>

          <!-- 统计信息 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">统计</h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>文章数：<span id="post-count">加载中...</span></li>
              <li>分类数：<span id="category-count">加载中...</span></li>
              <li>标签数：<span id="tag-count">加载中...</span></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} {{ siteConfig.siteName }}. Powered by Nuxt 3</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const siteConfig = ref({
  siteName: config.public.siteName || 'My Blog',
  siteDescription: config.public.siteDescription || '个人博客系统'
})

// 获取统计数据
onMounted(async () => {
  try {
    const [posts, categories, tags] = await Promise.all([
      $fetch('/api/posts'),
      $fetch('/api/categories'),
      $fetch('/api/tags')
    ])

    document.getElementById('post-count').textContent = posts.data?.length || 0
    document.getElementById('category-count').textContent = categories.data?.length || 0
    document.getElementById('tag-count').textContent = tags.data?.length || 0
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
})
</script>
