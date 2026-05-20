<script setup lang="ts">
const route = useRoute()
const { currentGroup, currentItem, currentMeta } = useAdminNavigation()

const breadcrumbs = computed(() => {
  const items: Array<{ label: string, path?: string }> = [
    { label: '后台', path: '/admin' },
  ]

  if (currentGroup.value && route.path !== '/admin') {
    items.push({ label: currentGroup.value.label, path: currentItem.value?.path })
  }

  if (route.path.startsWith('/admin/articles/new')) {
    items.push({ label: '新建文章' })
  }
  else if (route.path.startsWith('/admin/pages/new')) {
    items.push({ label: '新建页面' })
  }
  else if (route.path.startsWith('/admin/articles/') && route.path !== '/admin/articles') {
    items.push({ label: '编辑文章' })
  }
  else if (route.path.startsWith('/admin/pages/') && route.path !== '/admin/pages') {
    items.push({ label: '编辑页面' })
  }
  else if (currentItem.value && route.path !== '/admin') {
    items.push({ label: currentMeta.value.title })
  }

  return items
})
</script>

<template>
  <nav class="flex items-center gap-2 text-sm">
    <template v-for="(item, index) in breadcrumbs" :key="`${item.label}-${index}`">
      <span v-if="index > 0" class="i-heroicons-chevron-right h-4 w-4 text-muted/60" />
      <NuxtLink
        v-if="item.path && index < breadcrumbs.length - 1"
        :to="item.path"
        class="text-muted transition-colors hover:text-primary"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else class="font-medium text-text">{{ item.label }}</span>
    </template>
  </nav>
</template>
