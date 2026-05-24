<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
  children?: Category[]
}

const { data } = await useFetch('/api/categories/tree')
</script>

<template>
  <div class="bg-surface/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-border">
    <h3 class="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
      <span class="i-heroicons-folder w-4 h-4 text-accent" />
      分类
    </h3>
    <ul v-if="data?.data?.length" class="space-y-1">
      <li v-for="cat in data.data" :key="cat.id">
        <NuxtLink
          :to="`/categories/${cat.slug}`"
          class="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-secondary hover:bg-surface-2 hover:text-primary transition-colors"
          active-class="!bg-surface-2 !text-primary font-medium"
        >
          {{ cat.name }}
          <span class="text-xs text-muted">{{ cat.children?.length || '' }}</span>
        </NuxtLink>
        <ul v-if="cat.children?.length" class="ml-4 space-y-1 border-l-2 border-border pl-3">
          <li v-for="child in cat.children" :key="child.id">
            <NuxtLink
              :to="`/categories/${child.slug}`"
              class="flex items-center px-3 py-1.5 text-sm rounded-lg text-muted hover:bg-surface-2 hover:text-primary transition-colors"
              active-class="!bg-surface-2 !text-primary font-medium"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
    <p v-else class="text-sm text-muted text-center py-4">暂无分类</p>
  </div>
</template>
