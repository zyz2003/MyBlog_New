import { useAuthStore } from '~/stores/admin/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for the login page itself
  if (to.path === '/admin/login') {
    return
  }

  // On server-side, allow rendering — client-side plugin will restore auth from localStorage
  // This prevents SSR redirect loops since localStorage is not available during SSR
  if (import.meta.server) {
    return
  }

  const store = useAuthStore()

  if (!store.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
