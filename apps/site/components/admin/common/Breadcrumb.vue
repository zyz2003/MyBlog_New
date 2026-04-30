<script setup lang="ts">
const route = useRoute()

const labelMap: Record<string, string> = {
  admin: 'Admin',
  articles: 'Articles',
  categories: 'Categories',
  tags: 'Tags',
  media: 'Media',
  themes: 'Themes',
  plugins: 'Plugins',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
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
  <nav class="flex items-center gap-1 text-sm">
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
      <span v-if="index > 0" class="text-gray-400 mx-1">/</span>
      <NuxtLink
        v-if="!crumb.isLast"
        :to="crumb.path"
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        {{ crumb.label }}
      </NuxtLink>
      <span v-else class="text-gray-900 font-medium">{{ crumb.label }}</span>
    </template>
  </nav>
</template>
