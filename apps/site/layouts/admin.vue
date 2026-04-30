<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { user, logout } = useAuth()

const sidebarCollapsed = ref(false)

// Persist sidebar state in localStorage
onMounted(() => {
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved === 'true') {
    sidebarCollapsed.value = true
  }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value))
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <AdminCommonSidebar
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleSidebar"
    />

    <!-- Main content area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top navbar -->
      <AdminCommonNavbar :user="user" @logout="logout">
        <AdminCommonBreadcrumb />
      </AdminCommonNavbar>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
