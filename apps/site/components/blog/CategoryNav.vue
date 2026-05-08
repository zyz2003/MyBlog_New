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
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-amber-100 dark:border-gray-700">
    <h3 class="text-sm font-semibold text-amber-900 dark:text-white mb-4 flex items-center gap-2">
      <span class="i-heroicons-folder w-4 h-4 text-amber-500" />
      分类
    </h3>
    <ul v-if="data?.data?.length" class="space-y-1">
      <li v-for="cat in data.data" :key="cat.id">
        <NuxtLink
          :to="`/categories/${cat.slug}`"
          class="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-amber-700 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-white transition-colors"
          active-class="!bg-amber-100 dark:!bg-gray-700 !text-amber-900 dark:!text-white font-medium"
        >
          {{ cat.name }}
          <span class="text-xs text-amber-400 dark:text-gray-500">{{ cat.children?.length || '' }}</span>
        </NuxtLink>
        <ul v-if="cat.children?.length" class="ml-4 space-y-1 border-l-2 border-amber-100 dark:border-gray-700 pl-3">
          <li v-for="child in cat.children" :key="child.id">
            <NuxtLink
              :to="`/categories/${child.slug}`"
              class="flex items-center px-3 py-1.5 text-sm rounded-lg text-amber-600 dark:text-gray-500 hover:bg-amber-100 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-white transition-colors"
              active-class="!bg-amber-100 dark:!bg-gray-700 !text-amber-900 dark:!text-white font-medium"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
    <p v-else class="text-sm text-amber-400 dark:text-gray-500 text-center py-4">暂无分类</p>
  </div>
</template>