<script setup lang="ts"

interface Action {
  label: string
  icon: string
  path: string
  color: string
  bgColor: string
}

const actions: Action[] = [
  { label: '新建文章', icon: 'i-heroicons-document-plus', path: '/admin/articles/new', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: '新建页面', icon: 'i-heroicons-document-duplicate', path: '/admin/pages/new', color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: '上传媒体', icon: 'i-heroicons-photo', path: '/admin/media', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: '系统设置', icon: 'i-heroicons-cog-6-tooth', path: '/admin/settings', color: 'text-gray-600', bgColor: 'bg-gray-50' },
]
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <NuxtLink
      v-for="action in actions"
      :key="action.path"
      :to="action.path"
      class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      :class="action.bgColor"
    >
      <span :class="action.icon" :class="action.color" class="w-5 h-5" />
      <span class="text-sm font-medium" :class="action.color">{{ action.label }}</span>
    </NuxtLink>
  </div>
</template>
