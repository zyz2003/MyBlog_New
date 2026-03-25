<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Input } from '#components'
import { Search, Puzzle } from 'lucide-vue-next'
import type { Plugin } from './PluginCard.vue'
import PluginCard from './PluginCard.vue'

const props = defineProps<{
  plugins: Plugin[]
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: [pluginId: string, enabled: boolean]
  configure: [plugin: Plugin]
  search: [query: string]
  categoryChange: [category: string]
  statusChange: [status: string]
}>()

const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')

const debouncedSearch = useDebounceFn((query: string) => {
  emit('search', query)
}, 300)

// 动态获取分类列表
const categories = computed(() => {
  const cats = new Set(props.plugins.map((p) => p.category))
  return ['all', ...Array.from(cats)]
})

const filteredPlugins = computed(() => {
  let result = props.plugins

  if (categoryFilter.value !== 'all') {
    result = result.filter((p) => p.category === categoryFilter.value)
  }

  if (statusFilter.value === 'enabled') {
    result = result.filter((p) => p.isEnabled)
  } else if (statusFilter.value === 'disabled') {
    result = result.filter((p) => !p.isEnabled)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    )
  }

  return result
})

const stats = computed(() => ({
  total: props.plugins.length,
  enabled: props.plugins.filter((p) => p.isEnabled).length,
  disabled: props.plugins.filter((p) => !p.isEnabled).length,
}))
</script>

<template>
  <div class="space-y-4">
    <!-- 筛选工具栏 -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="搜索插件..."
          class="pl-10"
          @input="debouncedSearch(searchQuery)"
        />
      </div>

      <Select v-model="categoryFilter" @update:model-value="emit('categoryChange', $event)">
        <option value="all">全部分类</option>
        <option v-for="cat in categories.filter((c) => c !== 'all')" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </Select>

      <Select v-model="statusFilter" @update:model-value="emit('statusChange', $event)">
        <option value="all">全部状态 ({{ stats.total }})</option>
        <option value="enabled">已启用 ({{ stats.enabled }})</option>
        <option value="disabled">已禁用 ({{ stats.disabled }})</option>
      </Select>
    </div>

    <!-- 插件列表 -->
    <div class="space-y-3">
      <PluginCard
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        :plugin="plugin"
        :loading="loading"
        @toggle="emit('toggle', $event, ($event as any) === 'toggle' ? false : $event)"
        @configure="emit('configure', $event)"
      />

      <!-- 空状态 -->
      <div
        v-if="filteredPlugins.length === 0"
        class="flex flex-col items-center justify-center py-12 text-muted-foreground"
      >
        <Puzzle class="w-12 h-12 mb-4 opacity-20" />
        <p>{{ searchQuery ? '未找到匹配的插件' : '暂无插件' }}</p>
        <p v-if="!searchQuery" class="text-sm">安装插件后，这里会显示插件列表</p>
      </div>
    </div>
  </div>
</template>
