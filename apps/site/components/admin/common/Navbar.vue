<script setup lang="ts">
import type { AuthUser } from '~/stores/auth'

defineProps<{
  user: AuthUser | null
}>()

const emit = defineEmits<{
  logout: []
  search: []
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
  <header class="h-16 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-b border-amber-100 dark:border-gray-700 flex items-center justify-between px-6">
    <div class="flex items-center">
      <slot />
    </div>

    <div class="flex items-center gap-3">
      <!-- Search button -->
      <button
        class="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors cursor-pointer shadow-sm"
        @click="$emit('search')"
      >
        <span class="i-heroicons-magnifying-glass w-4 h-4" />
        <span class="hidden sm:inline">搜索</span>
        <kbd class="hidden sm:inline text-xs bg-amber-100 dark:bg-gray-600 px-1.5 py-0.5 rounded border border-amber-200 dark:border-gray-600">⌘K</kbd>
      </button>

      <!-- User dropdown -->
      <div ref="dropdownRef" class="relative">
        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          @click="toggleDropdown"
        >
          <div
            v-if="user?.avatar"
            class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white dark:ring-gray-700"
          >
            <img :src="user.avatar" :alt="user.displayName || user.username" class="w-full h-full object-cover">
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-700">
            <span class="i-heroicons-user w-4 h-4 text-white" />
          </div>
          <span class="hidden sm:block text-sm font-medium text-amber-800 dark:text-gray-300">{{ user?.displayName || user?.username || '管理员' }}</span>
          <span class="i-heroicons-chevron-down w-4 h-4 text-amber-600 dark:text-gray-400" />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 py-2 z-50"
          >
            <div class="px-4 py-2 border-b border-amber-100 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.displayName || user?.username }}</p>
              <p class="text-xs text-amber-600 dark:text-gray-400">{{ user?.email || 'admin@example.com' }}</p>
            </div>
            <div class="py-1">
              <button
                class="w-full text-left px-4 py-2.5 text-sm text-amber-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                @click="handleLogout"
              >
                <span class="i-heroicons-arrow-right-on-rectangle w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>