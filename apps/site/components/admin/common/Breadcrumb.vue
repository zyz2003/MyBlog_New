<script setup lang="ts">
const route = useRoute()

const labelMap: Record<string, string> = {
  admin: '概览',
  articles: '文章',
  categories: '分类',
  tags: '标签',
  media: '媒体库',
  pages: '页面',
  drafts: '草稿箱',
  themes: '主题',
  plugins: '插件',
  settings: '设置',
  new: '新建',
  edit: '编辑',
  trash: '回收站',
}

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items: Array<{ label: string; path: string; isLast: boolean }> = []

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const label = labelMap[segments[i]] || segments[i]
    items.push({
      label,
      path: currentPath,
      isLast: i === segments.length - 1,
    })
  }

  return items
})
</script>

<template>
  <nav class="flex items-center gap-2">
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
      <svg v-if="index > 0" class="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <NuxtLink
        v-if="!crumb.isLast"
        :to="crumb.path"
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        {{ crumb.label }}
      </NuxtLink>
      <span v-else class="text-sm font-medium text-gray-900 dark:text-white">{{ crumb.label }}</span>
    </template>
  </nav>
</template>