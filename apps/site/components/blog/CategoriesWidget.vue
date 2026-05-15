<script setup lang="ts">
const { data } = await useFetch<{ code: number; data: Array<{ id: number; name: string; slug: string; count: number }> }>('/api/categories')

const categories = computed(() => data.value?.data ?? [])
</script>

<template>
  <div class="card-widget categories-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] mb-3 uppercase tracking-wide">分类</div>

    <div v-if="categories.length === 0" class="text-xs text-[var(--anzhiyu-secondtext)] text-center py-2">
      暂无分类
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.slug}`"
        class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs no-underline bg-[var(--anzhiyu-main)]/5 text-[var(--anzhiyu-fontcolor)] hover:bg-[var(--anzhiyu-main)] hover:text-[var(--anzhiyu-white)] transition-colors"
      >
        {{ cat.name }}
        <span class="text-[10px] opacity-70">{{ cat.count || 0 }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
