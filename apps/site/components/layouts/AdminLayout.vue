<script setup lang="ts">
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar'
import { useAuthStore } from '~/stores/auth'
import AdminSidebar from '~/components/admin/Sidebar.vue'
import AdminHeader from '~/components/admin/Header.vue'

const authStore = useAuthStore()

// Check if user is authenticated on mount
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await navigateTo('/admin/login')
  }
})

// Responsive sidebar state - desktop defaults to open
const sidebarOpen = ref(true)
</script>

<template>
  <SidebarProvider v-model:open="sidebarOpen" style="--sidebar-width: 17rem;">
    <AdminSidebar />

    <SidebarInset class="flex min-h-screen flex-col bg-slate-50">
      <AdminHeader :user="authStore.user" />
      <main class="flex-1 overflow-auto p-4 md:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
/* Ensure full height layout */
:deep(.sidebar-provider) {
  display: flex;
  min-height: 100vh;
}
</style>
