<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 侧边栏导航 -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-transform" :class="{ '-translate-x-full': !sidebarOpen }">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <NuxtLink to="/admin/dashboard" class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-gray-800 dark:text-white">博客管理</span>
        </NuxtLink>
      </div>

      <!-- 导航菜单 -->
      <nav class="p-4 space-y-1 overflow-y-auto">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">主菜单</p>

        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': route.path.startsWith('/admin/dashboard') }"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          仪表盘
        </NuxtLink>

        <NuxtLink
          to="/admin/articles"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': route.path.startsWith('/admin/articles') }"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          文章管理
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          分类管理
        </NuxtLink>

        <NuxtLink
          to="/admin/tags"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          标签管理
        </NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">系统</p>

        <NuxtLink
          to="/admin/media"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          媒体库
        </NuxtLink>

        <NuxtLink
          to="/admin/themes"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          主题管理
        </NuxtLink>

        <NuxtLink
          to="/admin/plugins"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h1a2 2 0 110 4h-1a1 1 0 00-1 1v1a2 2 0 11-4 0v-1a1 1 0 00-1-1H7a2 2 0 110-4h1a1 1 0 001-1V4z" />
          </svg>
          插件管理
        </NuxtLink>

        <NuxtLink
          to="/admin/settings"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          系统设置
        </NuxtLink>
      </nav>

      <!-- 底部用户信息 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {{ user?.username?.charAt(0).toUpperCase() || 'A' }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ user?.username || '管理员' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.role || 'Admin' }}</p>
            </div>
          </div>
          <button @click="handleLogout" class="text-gray-400 hover:text-red-500 transition-colors" title="退出登录">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="transition-all" :class="{ 'ml-64': sidebarOpen, 'ml-0': !sidebarOpen }">
      <!-- 顶部栏 -->
      <header class="sticky top-0 z-20 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div class="flex items-center space-x-4">
          <!-- 侧边栏切换按钮 -->
          <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 面包屑 -->
          <div class="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/admin/dashboard" class="hover:text-gray-700 dark:hover:text-gray-200">管理后台</NuxtLink>
            <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-gray-700 dark:text-gray-200">{{ currentPageTitle }}</span>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center space-x-3">
          <!-- 查看站点 -->
          <NuxtLink
            to="/"
            target="_blank"
            class="hidden sm:flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M15 9l6 6m-6-6V3" />
            </svg>
            查看站点
          </NuxtLink>

          <!-- 新建文章 -->
          <NuxtLink
            to="/admin/articles/create"
            class="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            新建文章
          </NuxtLink>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-20 lg:hidden"></div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// 侧边栏状态
const sidebarOpen = ref(true)

// 当前用户
const user = ref(null)

// 当前页面标题
const currentPageTitle = computed(() => {
  const pathMap = {
    '/admin/dashboard': '仪表盘',
    '/admin/articles': '文章管理',
    '/admin/categories': '分类管理',
    '/admin/tags': '标签管理',
    '/admin/media': '媒体库',
    '/admin/themes': '主题管理',
    '/admin/plugins': '插件管理',
    '/admin/settings': '系统设置',
  }
  return pathMap[route.path.split('/').slice(0, 3).join('/')] || '管理后台'
})

// 获取当前用户信息
const fetchUser = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    user.value = await $fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (e) {
    console.error('Failed to fetch user:', e)
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin/login')
}

// 初始化
onMounted(() => {
  fetchUser()

  // 移动端默认关闭侧边栏
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
})

// 监听窗口大小变化
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
