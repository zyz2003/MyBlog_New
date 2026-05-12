<script setup lang="ts">
interface Action {
  label: string
  icon: string
  path: string
  color: string
}

const actions: Action[] = [
  { label: '新建文章', icon: 'i-heroicons-document-plus', path: '/admin/articles/new', color: 'bg-primary hover:bg-primary/90' },
  { label: '新建页面', icon: 'i-heroicons-document-duplicate', path: '/admin/pages/new', color: 'bg-accent hover:bg-accent/90' },
  { label: '上传媒体', icon: 'i-heroicons-photo', path: '/admin/media', color: 'bg-secondary hover:bg-secondary/90' },
  { label: '系统设置', icon: 'i-heroicons-cog-6-tooth', path: '/admin/settings', color: 'bg-surface-2 hover:bg-border text-text' },
]
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <NuxtLink
      v-for="action in actions"
      :key="action.path"
      :to="action.path"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      :class="action.color"
    >
      <span :class="action.icon" class="w-5 h-5" />
      <span>{{ action.label }}</span>
    </NuxtLink>
  </div>
</template>