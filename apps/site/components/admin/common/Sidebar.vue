<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const { groups, currentGroup, getItemsByGroup, isActive } = useAdminNavigation()

const expandedGroups = ref<Set<string>>(new Set(groups.map(group => group.key)))

watch(currentGroup, (group) => {
  if (group?.key && !expandedGroups.value.has(group.key)) {
    expandedGroups.value.add(group.key)
  }
}, { immediate: true })

function toggleGroup(key: string) {
  if (expandedGroups.value.has(key)) {
    expandedGroups.value.delete(key)
  }
  else {
    expandedGroups.value.add(key)
  }
}

function isGroupActive(groupKey: string) {
  return getItemsByGroup(groupKey).some(item => isActive(item.path))
}
</script>

<template>
  <aside
    class="admin-sidebar flex h-screen flex-col border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,251,255,0.88))] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(13,18,30,0.92),rgba(11,15,24,0.88))]"
    :class="collapsed ? 'w-24' : 'w-80'"
  >
    <div class="border-b border-border/60 px-5 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-white shadow-lg shadow-sky-500/20">
          <span class="i-heroicons-command-line h-6 w-6" />
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-medium text-primary/90">AnZhiYu Admin</p>
          <h1 class="truncate text-xl font-black tracking-tight text-text">博客控制台</h1>
          <p class="mt-1 text-xs leading-5 text-muted">内容、站点体验与平台扩展的统一入口</p>
        </div>
      </div>
      <button
        class="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-surface/70 px-3 py-2 text-sm text-muted transition-colors hover:border-primary/30 hover:text-primary"
        :class="collapsed ? 'mx-auto mt-4 h-10 w-10 justify-center px-0' : ''"
        @click="emit('toggle-collapse')"
      >
        <span :class="collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" class="h-4 w-4" />
        <span v-if="!collapsed">{{ collapsed ? '展开' : '收起侧栏' }}</span>
      </button>
    </div>

    <div class="admin-scrollbar flex-1 overflow-y-auto px-3 py-4">
      <div v-for="group in groups" :key="group.key" class="mb-4">
        <button
          v-if="!collapsed"
          class="mb-2 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all"
          :class="isGroupActive(group.key)
            ? 'bg-primary/8 text-text ring-1 ring-primary/10'
            : 'text-muted hover:bg-surface-2/70 hover:text-text'"
          @click="toggleGroup(group.key)"
        >
          <div class="flex min-w-0 items-start gap-3">
            <span :class="group.icon" class="mt-0.5 h-5 w-5 flex-none" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ group.label }}</p>
              <p class="truncate text-xs text-muted">{{ group.description }}</p>
            </div>
          </div>
          <span
            :class="expandedGroups.has(group.key) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="h-4 w-4 flex-none"
          />
        </button>

        <div
          class="space-y-1"
          :class="collapsed ? '' : (expandedGroups.has(group.key) ? 'block' : 'hidden')"
        >
          <NuxtLink
            v-for="item in getItemsByGroup(group.key)"
            :key="item.path"
            :to="item.path"
            class="group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200"
            :class="[
              collapsed ? 'justify-center px-0' : '',
              isActive(item.path)
                ? 'border-primary/20 bg-[linear-gradient(135deg,rgba(75,141,248,0.12),rgba(34,184,207,0.05))] text-primary shadow-sm'
                : 'border-transparent text-text hover:border-border/70 hover:bg-surface/80 hover:text-primary',
            ]"
            :title="collapsed ? item.label : item.description"
          >
            <span
              :class="item.icon"
              class="h-5 w-5 flex-none transition-transform duration-200 group-hover:scale-110"
            />
            <div v-if="!collapsed" class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ item.label }}</p>
              <p class="truncate text-xs text-muted">{{ item.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="border-t border-border/60 p-4">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/75 px-4 py-3 text-sm text-muted transition-all hover:border-primary/30 hover:text-primary"
        :class="collapsed ? 'justify-center px-0' : ''"
        :title="collapsed ? '访问前台' : undefined"
      >
        <span class="i-heroicons-arrow-top-right-on-square h-5 w-5" />
        <span v-if="!collapsed">访问前台站点</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.admin-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.admin-scrollbar::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  border-radius: 999px;
}
</style>
