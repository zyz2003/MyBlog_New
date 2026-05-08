<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()

const navItems = [
  { label: '仪表盘', icon: 'i-heroicons-squares-2x2', path: '/admin', group: 'main' },
  { label: '内容管理', icon: '', path: '', group: 'content', isGroup: true },
  { label: '文章', icon: 'i-heroicons-document-text', path: '/admin/articles', group: 'content' },
  { label: '分类', icon: 'i-heroicons-folder', path: '/admin/categories', group: 'content' },
  { label: '标签', icon: 'i-heroicons-tag', path: '/admin/tags', group: 'content' },
  { label: '页面', icon: 'i-heroicons-document-duplicate', path: '/admin/pages', group: 'content' },
  { label: '草稿箱', icon: 'i-heroicons-archive-box', path: '/admin/drafts', group: 'content' },
  { label: '媒体库', icon: 'i-heroicons-photo', path: '/admin/media', group: 'content' },
  { label: '系统', icon: '', path: '', group: 'system', isGroup: true },
  { label: '主题', icon: 'i-heroicons-paint-brush', path: '/admin/themes', group: 'system' },
  { label: '插件', icon: 'i-heroicons-puzzle-piece', path: '/admin/plugins', group: 'system' },
  { label: '设置', icon: 'i-heroicons-cog-6-tooth', path: '/admin/settings', group: 'system' },
]

const groups = [
  { key: 'main', label: '概览' },
  { key: 'content', label: '内容管理' },
  { key: 'system', label: '系统' },
]

function isActive(path: string): boolean {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="flex flex-col bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-r border-amber-100 dark:border-gray-700 transition-all duration-300 h-screen"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <!-- Logo / Title -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-amber-100 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <span class="i-heroicons-command-line w-4 h-4 text-white" />
        </div>
        <span v-if="!collapsed" class="text-lg font-bold text-amber-900 dark:text-white">博客管理</span>
      </div>
      <button
        v-if="!collapsed"
        class="p-1.5 rounded-lg text-amber-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        @click="emit('toggle-collapse')"
      >
        <span class="i-heroicons-chevron-left w-4 h-4" />
      </button>
      <button
        v-else
        class="p-1.5 rounded-lg text-amber-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors cursor-pointer mx-auto"
        @click="emit('toggle-collapse')"
      >
        <span class="i-heroicons-chevron-right w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 overflow-y-auto scrollbar-thin">
      <template v-for="group in groups" :key="group.key">
        <!-- Group label -->
        <div v-if="!collapsed" class="px-4 mb-2">
          <span class="text-xs font-semibold text-amber-600 dark:text-gray-500 uppercase tracking-wider">{{ group.label }}</span>
        </div>

        <ul class="space-y-1 px-2 mb-4">
          <template v-for="item in navItems.filter(i => i.group === group.key)" :key="item.path">
            <!-- Group header (no path) -->
            <li v-if="item.isGroup && !collapsed" class="px-3 py-2">
              <span class="text-xs font-semibold text-amber-600 dark:text-gray-500 uppercase tracking-wider">{{ item.label }}</span>
            </li>
            <!-- Nav item -->
            <li v-else-if="!item.isGroup">
              <NuxtLink
                :to="item.path"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                :class="isActive(item.path)
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'text-amber-700 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-white'"
                :title="collapsed ? item.label : undefined"
              >
                <span :class="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="!collapsed" class="font-medium truncate">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </template>
        </ul>
      </template>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-amber-100 dark:border-gray-700">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center justify-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-100 dark:hover:bg-gray-700"
        :title="collapsed ? '访问前台' : undefined"
      >
        <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" />
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
  background: #d1d5db;
  border-radius: 2px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>