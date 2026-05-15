<script setup lang="ts">
const { data } = await useFetch<{ code: number; data: { years: Array<{ year: number; count: number }> } }>('/api/articles/archive')

const years = computed(() => data.value?.data?.years ?? [])
const totalCount = computed(() => years.value.reduce((s, y) => s + y.count, 0))
</script>

<template>
  <div class="card-widget archive-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] uppercase tracking-wide">归档</div>
      <span class="text-xs text-[var(--anzhiyu-secondtext)]">{{ totalCount }} 篇</span>
    </div>

    <div v-if="years.length === 0" class="text-xs text-[var(--anzhiyu-secondtext)] text-center py-2">
      暂无文章
    </div>

    <div v-else class="space-y-1">
      <NuxtLink
        v-for="yearItem in years"
        :key="yearItem.year"
        :to="`/archive`"
        class="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm no-underline hover:bg-[var(--anzhiyu-main)]/5 transition-colors group"
      >
        <span class="text-[var(--anzhiyu-fontcolor)] group-hover:text-[var(--anzhiyu-main)]">{{ yearItem.year }}</span>
        <span class="text-xs text-[var(--anzhiyu-secondtext)] bg-[var(--anzhiyu-main)]/5 px-2 py-0.5 rounded-full">{{ yearItem.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
