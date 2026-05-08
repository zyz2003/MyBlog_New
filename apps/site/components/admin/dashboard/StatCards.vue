<script setup lang="ts">
interface StatItem {
  label: string
  value: number
  icon: string
  color: string
  bgColor: string
}

defineProps<{
  stats: StatItem[]
  loading?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {{ loading ? '—' : stat.value.toLocaleString() }}
          </p>
        </div>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :class="stat.bgColor"
        >
          <span :class="[stat.icon, stat.color]" class="w-6 h-6" />
        </div>
      </div>
    </div>
    <div v-if="stats.length === 0 && !loading" class="col-span-full text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
      暂无统计数据
    </div>
  </div>
</template>