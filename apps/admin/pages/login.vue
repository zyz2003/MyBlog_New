<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- 登录卡片 -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">博客管理系统</h1>
          <p class="text-gray-500 text-sm">请登录您的管理员账号</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名输入 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <!-- 记住我 -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="formData.remember"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="remember" class="ml-2 text-sm text-gray-600">
              记住我
            </label>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 返回首页 -->
        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回博客首页
          </NuxtLink>
        </div>
      </div>

      <!-- 默认账号提示 -->
      <div class="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center text-white/90 text-sm">
        <p class="font-medium mb-2">默认管理员账号</p>
        <p>用户名：<code class="bg-white/20 px-2 py-1 rounded">admin</code></p>
        <p>密码：<code class="bg-white/20 px-2 py-1 rounded">admin123</code></p>
        <p class="mt-2 text-xs text-white/60">首次登录后请及时修改密码</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
useHead({
  title: '登录 - 博客管理系统',
})

// 路由
const router = useRouter()
const route = useRoute()

// 状态
const formData = ref({
  username: '',
  password: '',
  remember: false,
})
const loading = ref(false)
const error = ref('')

// 处理登录
const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: formData.value.username,
        password: formData.value.password,
      },
    })

    // 保存 token
    if (response.token) {
      localStorage.setItem('admin_token', response.token)

      // 保存到本地存储（如果选择记住我）
      if (formData.value.remember) {
        localStorage.setItem('admin_user', JSON.stringify(response.user))
      }

      // 跳转到仪表盘或之前访问的页面
      const redirect = route.query.redirect || '/admin/dashboard'
      await router.push(redirect)
    }
  } catch (err) {
    console.error('Login failed:', err)
    error.value = err.data?.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}

// 检查是否已登录
onMounted(async () => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    try {
      // 验证 token 是否有效
      await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // token 有效，跳转到仪表盘
      router.push('/admin/dashboard')
    } catch (e) {
      // token 无效，清除
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
  }
})
</script>

<style scoped>
/* 输入框聚焦动画 */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 按钮悬停效果 */
button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
