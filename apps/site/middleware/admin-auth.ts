import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for the login page itself
  if (to.path === '/admin/login') {
    return
  }

  const store = useAuthStore()

  if (!store.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
