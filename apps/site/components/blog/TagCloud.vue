<script setup lang="ts">
const { getTags } = usePublicApi()
const { data } = await useAsyncData('tag-list', () => getTags())
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">标签</h3>
    <div v-if="data?.data?.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="tag in data.data"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="rounded px-2 py-0.5 text-sm transition-opacity hover:opacity-80"
        :style="{ background: (tag.color || '#E5E7EB') + '30', color: tag.color || '#6B7280' }"
      >
        {{ tag.name }}
      </NuxtLink>
    </div>
    <p v-else class="text-sm text-gray-400">暂无标签</p>
  </div>
</template>
