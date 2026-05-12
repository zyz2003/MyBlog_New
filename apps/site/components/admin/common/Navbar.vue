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
  <header class="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
    <div class="flex items-center">
      <slot />
    </div>

    <div class="flex items-center gap-3">
      <!-- Search button -->
      <button
        class="flex items-center gap-2 px-3 py-2 text-sm text-text bg-background rounded-lg hover:bg-surface-2 transition-colors cursor-pointer shadow-sm border border-border"
        @click="$emit('search')"
      >
        <span class="i-heroicons-magnifying-glass w-4 h-4" />
        <span class="hidden sm:inline">搜索</span>
        <kbd class="hidden sm:inline text-xs bg-surface-2 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
      </button>

      <!-- User dropdown -->
      <div ref="dropdownRef" class="relative">
        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
          @click="toggleDropdown"
        >
          <div
            v-if="user?.avatar"
            class="w-8 h-8 rounded-full bg-surface-2 overflow-hidden ring-2 ring-background"
          >
            <img :src="user.avatar" :alt="user.displayName || user.username" class="w-full h-full object-cover">
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
            <span class="i-heroicons-user w-4 h-4 text-white" />
          </div>
          <span class="hidden sm:block text-sm font-medium text-text">{{ user?.displayName || user?.username || '管理员' }}</span>
          <span class="i-heroicons-chevron-down w-4 h-4 text-muted" />
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
            class="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border py-2 z-50"
          >
            <div class="px-4 py-2 border-b border-border">
              <p class="text-sm font-medium text-text">{{ user?.displayName || user?.username }}</p>
              <p class="text-xs text-muted">{{ user?.email || 'admin@example.com' }}</p>
            </div>
            <div class="py-1">
              <button
                class="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-surface-2 flex items-center gap-2 transition-colors"
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