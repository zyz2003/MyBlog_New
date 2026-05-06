<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()

const navItems = [
  { label: '仪表盘', icon: 'i-heroicons-home', path: '/admin' },
  { label: '文章', icon: 'i-heroicons-document-text', path: '/admin/articles' },
  { label: '分类', icon: 'i-heroicons-folder', path: '/admin/categories' },
  { label: '标签', icon: 'i-heroicons-tag', path: '/admin/tags' },
  { label: '媒体', icon: 'i-heroicons-photo', path: '/admin/media' },
  { label: '主题', icon: 'i-heroicons-paint-brush', path: '/admin/themes' },
  { label: '插件', icon: 'i-heroicons-puzzle-piece', path: '/admin/plugins' },
  { label: '设置', icon: 'i-heroicons-cog-6-tooth', path: '/admin/settings' },
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
    class="flex flex-col bg-gray-900 text-white transition-all duration-300 h-screen"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo / Title -->
    <div class="flex items-center justify-between h-14 px-4 border-b border-gray-700">
      <span v-if="!collapsed" class="text-lg font-bold truncate">博客后台</span>
      <span v-else class="text-lg font-bold">博</span>
      <button
        class="p-1 rounded hover:bg-gray-700 transition-colors"
        @click="emit('toggle-collapse')"
      >
        <span class="i-heroicons-bars-3 w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-2">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            :class="isActive(item.path)
              ? 'bg-primary/20 text-primary'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
            :title="collapsed ? item.label : undefined"
          >
            <span :class="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
