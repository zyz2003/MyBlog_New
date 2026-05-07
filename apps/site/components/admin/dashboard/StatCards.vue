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
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white rounded-lg border border-gray-200 p-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">
            {{ loading ? '—' : stat.value }}
          </p>
        </div>
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="stat.bgColor"
        >
          <span :class="stat.icon" :class="stat.color" class="w-5 h-5" />
        </div>
      </div>
    </div>
    <div v-if="stats.length === 0 && !loading" class="col-span-full text-center py-8 text-gray-400 text-sm">
      暂无统计数据
    </div>
  </div>
</template>
