<script setup lang="ts">
const { data } = await useFetch('/api/tags')
</script>

<template>
  <div class="bg-surface/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-border">
    <h3 class="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
      <span class="i-heroicons-tag w-4 h-4 text-accent" />
      标签
    </h3>
    <div v-if="data?.data?.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="tag in data.data"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="px-3 py-1 text-sm rounded-full bg-surface-2 text-secondary hover:bg-accent/20 hover:text-accent transition-colors"
      >
        {{ tag.name }}
      </NuxtLink>
    </div>
    <p v-else class="text-sm text-muted text-center py-4">暂无标签</p>
  </div>
</template>
