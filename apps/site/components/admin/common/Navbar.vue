<script setup lang="ts">
import type { AuthUser } from '~/stores/auth'

defineProps<{
  user: AuthUser | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  showDropdown.value = false
  emit('logout')
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
    <!-- Left: Breadcrumb slot -->
    <div class="flex items-center">
      <slot />
    </div>

    <!-- Right: User menu -->
    <div ref="dropdownRef" class="relative">
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        @click="toggleDropdown"
      >
        <div
          v-if="user?.avatar"
          class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"
        >
          <img :src="user.avatar" :alt="user.displayName || user.username" class="w-full h-full object-cover">
        </div>
        <div v-else class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="i-heroicons-user w-5 h-5 text-primary" />
        </div>
        <span class="text-sm font-medium text-gray-700">{{ user?.displayName || user?.username || '管理员' }}</span>
        <span class="i-heroicons-chevron-down w-4 h-4 text-gray-400" />
      </button>

      <!-- Dropdown -->
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
      >
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          @click="handleLogout"
        >
          <span class="i-heroicons-arrow-right-on-rectangle w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  </header>
</template>
