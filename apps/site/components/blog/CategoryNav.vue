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
  <div class="rounded-lg border border-gray-200 bg-white p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">分类</h3>
    <ul v-if="data?.data?.length" class="space-y-1">
      <li v-for="cat in data.data" :key="cat.id">
        <NuxtLink
          :to="`/categories/${cat.slug}`"
          class="block px-2 py-1 text-sm text-gray-600 rounded hover:bg-gray-50 hover:text-blue-600"
        >
          {{ cat.name }}
        </NuxtLink>
        <ul v-if="cat.children?.length" class="ml-4 space-y-1">
          <li v-for="child in cat.children" :key="child.id">
            <NuxtLink
              :to="`/categories/${child.slug}`"
              class="block px-2 py-1 text-sm text-gray-500 rounded hover:bg-gray-50 hover:text-blue-600"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
    <p v-else class="text-sm text-gray-400">暂无分类</p>
  </div>
</template>
