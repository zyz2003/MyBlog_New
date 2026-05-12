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
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="group bg-surface rounded-2xl p-5 border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-text mt-1">
            {{ loading ? '—' : stat.value.toLocaleString() }}
          </p>
        </div>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
          :class="stat.bgColor"
        >
          <span :class="[stat.icon, stat.color]" class="w-6 h-6" />
        </div>
      </div>
    </div>
    <div v-if="stats.length === 0 && !loading" class="col-span-full text-center py-8 text-muted text-sm">
      暂无统计数据
    </div>
  </div>
</template>