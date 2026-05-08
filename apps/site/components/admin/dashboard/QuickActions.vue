<script setup lang="ts">
interface Action {
  label: string
  icon: string
  path: string
  gradient: string
  hoverGradient: string
}

const actions: Action[] = [
  { label: '新建文章', icon: 'i-heroicons-document-plus', path: '/admin/articles/new', gradient: 'from-amber-500 to-yellow-500', hoverGradient: 'hover:from-amber-600 hover:to-yellow-600' },
  { label: '新建页面', icon: 'i-heroicons-document-duplicate', path: '/admin/pages/new', gradient: 'from-orange-500 to-amber-500', hoverGradient: 'hover:from-orange-600 hover:to-amber-600' },
  { label: '上传媒体', icon: 'i-heroicons-photo', path: '/admin/media', gradient: 'from-yellow-500 to-orange-500', hoverGradient: 'hover:from-yellow-600 hover:to-orange-600' },
  { label: '系统设置', icon: 'i-heroicons-cog-6-tooth', path: '/admin/settings', gradient: 'from-amber-600 to-orange-600', hoverGradient: 'hover:from-amber-700 hover:to-orange-700' },
]
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <NuxtLink
      v-for="action in actions"
      :key="action.path"
      :to="action.path"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all duration-200 bg-gradient-to-r cursor-pointer"
      :class="[action.gradient, action.hoverGradient]"
    >
      <span :class="action.icon" class="w-5 h-5" />
      <span>{{ action.label }}</span>
    </NuxtLink>
  </div>
</template>