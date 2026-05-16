<script setup lang="ts">
const { data } = await useFetch<{ code: number; data: Array<{ id: number; name: string; slug: string; count: number }> }>('/api/tags')
const tags = computed(() => (data.value as any)?.data ?? [])
</script>

<template>
  <div class="card-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] mb-3 uppercase tracking-wide">标签</div>
    <div v-if="!tags.length" class="text-xs text-[var(--anzhiyu-secondtext)] text-center py-2">暂无标签</div>
    <div v-else class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="tag in tags" :key="tag.id" :to="`/tags/${tag.slug}`"
        class="no-underline text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] transition-colors px-2 py-0.5 rounded-lg bg-[var(--anzhiyu-main)]/5 text-xs"
      >
        {{ tag.name }}
      </NuxtLink>
    </div>
  </div>
</template>
