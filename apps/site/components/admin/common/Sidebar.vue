<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()

// Track expanded groups
const expandedGroups = ref<Set<string>>(new Set(['content', 'system']))

function toggleGroup(key: string) {
  if (expandedGroups.value.has(key)) {
    expandedGroups.value.delete(key)
  } else {
    expandedGroups.value.add(key)
  }
}

const navItems = [
  { label: '仪表盘', icon: 'i-heroicons-squares-2x2', path: '/admin', group: 'main' },
  { label: '内容管理', icon: 'i-heroicons-document-text', path: '', group: 'content', isGroup: true },
  { label: '文章', icon: 'i-heroicons-newspaper', path: '/admin/articles', group: 'content' },
  { label: '分类管理', icon: 'i-heroicons-folder-open', path: '/admin/categories', group: 'content' },
  { label: '标签管理', icon: 'i-heroicons-tag', path: '/admin/tags', group: 'content' },
  { label: '页面管理', icon: 'i-heroicons-document-duplicate', path: '/admin/pages', group: 'content' },
  { label: '草稿箱', icon: 'i-heroicons-archive-box', path: '/admin/drafts', group: 'content' },
  { label: '媒体库', icon: 'i-heroicons-photo', path: '/admin/media', group: 'content' },
  { label: '系统设置', icon: 'i-heroicons-cog-6-tooth', path: '', group: 'system', isGroup: true },
  { label: '主题管理', icon: 'i-heroicons-paint-brush', path: '/admin/themes', group: 'system' },
  { label: '插件中心', icon: 'i-heroicons-puzzle-piece', path: '/admin/plugins', group: 'system' },
  { label: '系统设置', icon: 'i-heroicons-cog-8-tooth', path: '/admin/settings', group: 'system' },
]

const groups = [
  { key: 'main', label: '概览', icon: 'i-heroicons-home' },
  { key: 'content', label: '内容管理', icon: 'i-heroicons-folder' },
  { key: 'system', label: '系统设置', icon: 'i-heroicons-cog-6-tooth' },
]

function isActive(path: string): boolean {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

function isGroupActive(groupKey: string): boolean {
  return navItems.some(item => !item.isGroup && item.group === groupKey && isActive(item.path))
}
</script>

<template>
  <aside
    class="flex flex-col bg-surface border-r border-border transition-all duration-300 h-screen"
    :class="collapsed ? 'w-20' : 'w-68'"
  >
    <!-- Logo / Title -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <span class="i-heroicons-command-line w-5 h-5 text-white" />
        </div>
        <span v-if="!collapsed" class="text-xl font-extrabold text-text tracking-tight">博客管理</span>
      </div>
      <button
        v-if="!collapsed"
        class="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer"
        @click="emit('toggle-collapse')"
      >
        <span class="i-heroicons-chevron-left w-4 h-4" />
      </button>
      <button
        v-else
        class="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer mx-auto"
        @click="emit('toggle-collapse')"
      >
        <span class="i-heroicons-chevron-right w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 overflow-y-auto scrollbar-thin">
      <template v-for="group in groups" :key="group.key">
        <!-- Group header with expand/collapse -->
        <div v-if="!collapsed" class="px-3 mb-2">
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200"
            :class="isGroupActive(group.key)
              ? 'bg-surface-2/80 text-text'
              : 'text-muted hover:bg-surface-2/50 hover:text-text'"
            @click="toggleGroup(group.key)"
          >
            <div class="flex items-center gap-2">
              <span :class="group.icon" class="w-4 h-4" />
              <span class="text-base font-semibold text-muted uppercase tracking-widest">{{ group.label }}</span>
            </div>
            <span
              :class="expandedGroups.has(group.key) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
              class="w-4 h-4 text-xs transition-transform duration-200"
            />
          </button>
        </div>

        <!-- Group items (collapsible) -->
        <ul v-show="!collapsed && expandedGroups.has(group.key)" class="space-y-1 px-2 mb-4">
          <template v-for="item in navItems.filter(i => i.group === group.key)" :key="item.path">
            <!-- Nav item -->
            <li v-if="!item.isGroup">
              <NuxtLink
                :to="item.path"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                :class="isActive(item.path)
                  ? 'bg-surface-2 text-primary shadow-sm border border-primary/20'
                  : 'text-text hover:bg-surface-2 hover:text-primary'"
                :title="collapsed ? item.label : undefined"
              >
                <span :class="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span class="font-light text-sm truncate">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </template>
        </ul>

        <!-- Collapsed view: show items directly -->
        <ul v-if="collapsed" class="space-y-1 px-2 mb-4">
          <template v-for="item in navItems.filter(i => i.group === group.key && !i.isGroup)" :key="item.path">
            <li>
              <NuxtLink
                :to="item.path"
                class="flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                :class="isActive(item.path)
                  ? 'bg-surface-2 text-primary shadow-sm border border-primary/20'
                  : 'text-text hover:bg-surface-2 hover:text-primary'"
                :title="item.label"
              >
                <span :class="item.icon" class="w-5 h-5" />
              </NuxtLink>
            </li>
          </template>
        </ul>
      </template>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-border">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-primary transition-colors rounded-xl hover:bg-surface-2"
        :title="collapsed ? '访问前台' : undefined"
      >
        <span class="i-heroicons-arrow-top-right-on-square w-5 h-5" />
        <span v-if="!collapsed">访问前台</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}
</style>
