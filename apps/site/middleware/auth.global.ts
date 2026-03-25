export default defineNuxtRouteMiddleware(async (to) => {
  // 只保护 /admin 路由
  if (!to.path.startsWith('/admin')) {
    return
  }

  // 跳过登录页
  if (to.path === '/admin/login') {
    return
  }

  const authStore = useAuthStore()

  // 未登录时重定向到登录页
  if (!authStore.token) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.path as string)}`)
  }

  // 验证 token 有效性
  try {
    await $fetch('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
  } catch {
    // Token 失效，清除认证状态并重定向
    authStore.clearAuth()
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.path as string)}`)
  }
})
