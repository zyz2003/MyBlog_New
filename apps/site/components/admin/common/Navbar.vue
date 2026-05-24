<script setup lang="ts">
import type { AuthUser } from '~/stores/admin/auth'

defineProps<{
  user: AuthUser | null
}>()

const emit = defineEmits<{
  logout: []
  search: []
}>()

const { currentGroup, currentMeta } = useAdminNavigation()

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
  <header class="border-b border-border/70 bg-[rgba(255,255,255,0.72)] px-6 py-4 backdrop-blur-xl dark:bg-[rgba(10,14,22,0.72)]">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="mb-2 flex items-center gap-3">
          <slot />
        </div>
        <div class="flex items-center gap-3">
          <span
            v-if="currentGroup"
            class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            {{ currentGroup.label }}
          </span>
          <div class="min-w-0">
            <h2 class="truncate text-2xl font-black tracking-tight text-text">{{ currentMeta.title }}</h2>
            <p class="truncate text-sm text-muted">{{ currentMeta.description }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="hidden items-center gap-2 rounded-2xl border border-border/70 bg-surface/80 px-4 py-2.5 text-sm text-text shadow-sm transition-colors hover:border-primary/25 hover:text-primary md:flex"
          @click="$emit('search')"
        >
          <span class="i-heroicons-magnifying-glass h-4 w-4" />
          <span>搜索后台</span>
          <kbd class="rounded-lg border border-border bg-surface-2 px-1.5 py-0.5 text-xs text-muted">Ctrl K</kbd>
        </button>

        <div ref="dropdownRef" class="relative">
          <button
            class="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/80 px-3 py-2 shadow-sm transition-colors hover:border-primary/25"
            @click="toggleDropdown"
          >
            <div
              v-if="user?.avatar"
              class="h-10 w-10 overflow-hidden rounded-2xl bg-surface-2 ring-2 ring-white/70 dark:ring-white/10"
            >
              <img :src="user.avatar" :alt="user.displayName || user.username" class="h-full w-full object-cover">
            </div>
            <div v-else class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white ring-2 ring-white/70 dark:ring-white/10">
              <span class="i-heroicons-user h-5 w-5" />
            </div>
            <div class="hidden text-left md:block">
              <p class="max-w-[12rem] truncate text-sm font-semibold text-text">{{ user?.displayName || user?.username || '管理员' }}</p>
              <p class="max-w-[12rem] truncate text-xs text-muted">{{ user?.email || 'admin@example.com' }}</p>
            </div>
            <span class="i-heroicons-chevron-down h-4 w-4 text-muted" />
          </button>

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
              class="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl"
            >
              <div class="rounded-xl bg-surface-2/80 px-4 py-3">
                <p class="text-sm font-semibold text-text">{{ user?.displayName || user?.username || '管理员' }}</p>
                <p class="mt-1 text-xs text-muted">{{ user?.email || 'admin@example.com' }}</p>
              </div>
              <div class="mt-2">
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-text transition-colors hover:bg-surface-2 hover:text-primary"
                  @click="handleLogout"
                >
                  <span class="i-heroicons-arrow-right-on-rectangle h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>
