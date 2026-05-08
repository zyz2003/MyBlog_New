<script setup lang="ts">
const { data } = await useFetch('/api/tags')
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-amber-100 dark:border-gray-700">
    <h3 class="text-sm font-semibold text-amber-900 dark:text-white mb-4 flex items-center gap-2">
      <span class="i-heroicons-tag w-4 h-4 text-amber-500" />
      标签
    </h3>
    <div v-if="data?.data?.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="tag in data.data"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="px-3 py-1 text-sm rounded-full bg-amber-100 dark:bg-gray-700 text-amber-700 dark:text-gray-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
      >
        {{ tag.name }}
      </NuxtLink>
    </div>
    <p v-else class="text-sm text-amber-400 dark:text-gray-500 text-center py-4">暂无标签</p>
  </div>
</template>