<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

// Generate breadcrumbs from route if not provided
const breadcrumbs = computed(() => {
  if (props.items) {
    return props.items
  }

  const paths = route.path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  paths.forEach((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    const title = path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    items.push({ title, href })
  })

  return items
})

const separator = computed(() => props.separator || 'chevron')
const normalizedBreadcrumbs = computed(() => {
  const generated = breadcrumbs.value
  if (generated.length === 0) {
    return [{ title: '控制台', href: '/admin' }]
  }

  return generated.map((item, index) => {
    if (index === 0 && item.title.toLowerCase() === 'admin') {
      return { ...item, title: '控制台', href: '/admin' }
    }
    return item
  })
})
</script>

<template>
  <nav class="flex items-center space-x-2 text-sm text-slate-500">
    <template v-for="(item, index) in normalizedBreadcrumbs" :key="index">
      <NuxtLink
        v-if="index < normalizedBreadcrumbs.length - 1"
        :to="item.href || '/admin'"
        class="transition-colors hover:text-slate-900"
      >
        {{ item.title }}
      </NuxtLink>
      <span v-else class="font-medium text-slate-900">
        {{ item.title }}
      </span>
      <template v-if="index < normalizedBreadcrumbs.length - 1">
        <ChevronRight
          v-if="separator === 'chevron'"
          class="h-4 w-4 text-slate-300"
        />
        <span v-else-if="separator === 'slash'" class="mx-2">/</span>
      </template>
    </template>
  </nav>
</template>
