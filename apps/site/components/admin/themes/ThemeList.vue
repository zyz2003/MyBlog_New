<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Theme } from './ThemeCard.vue'
import ThemeCard from './ThemeCard.vue'
import { Search, Grid, List, Palette } from 'lucide-vue-next'
import { Input, Button } from '#components'

const props = defineProps<{
  themes: Theme[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'activate': [themeId: string]
  'preview': [theme: Theme]
  'configure': [theme: Theme]
  'search': [query: string]
  'filterChange': [filter: string]
}>()

const viewMode = ref<'grid' | 'list'>(() => {
  return localStorage.getItem('themeViewMode') as 'grid' | 'list' || 'grid'
})

const filter = ref('all')
const searchQuery = ref('')

const debouncedSearch = useDebounceFn((query: string) => {
  emit('search', query)
}, 300)

const filteredThemes = computed(() => {
  let result = props.themes

  if (filter.value === 'active') {
    result = result.filter(t => t.isActive)
  } else if (filter.value === 'inactive') {
    result = result.filter(t => !t.isActive)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q)
    )
  }

  return result
})

const stats = computed(() => ({
  total: props.themes.length,
  active: props.themes.filter(t => t.isActive).length,
}))

const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode
  localStorage.setItem('themeViewMode', mode)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 头部工具栏 -->
    <div class="flex justify-between items-center gap-4">
      <!-- 搜索和筛选 -->
      <div class="flex items-center gap-2 flex-1">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="搜索主题..."
            class="pl-10"
            @input="debouncedSearch(searchQuery)"
          />
        </div>
        <Select v-model="filter" @update:model-value="emit('filterChange', $event)">
          <option value="all">全部 ({{ stats.total }})</option>
          <option value="active">已激活 ({{ stats.active }})</option>
          <option value="inactive">未激活 ({{ stats.total - stats.active }})</option>
        </Select>
      </div>

      <!-- 视图切换 -->
      <div class="flex items-center gap-1 border rounded-md p-1">
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'grid' }"
          @click="setViewMode('grid')"
        >
          <Grid class="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'list' }"
          @click="setViewMode('list')"
        >
          <List class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- 主题网格 -->
    <div
      v-if="filteredThemes.length > 0"
      :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'"
    >
      <ThemeCard
        v-for="theme in filteredThemes"
        :key="theme.id"
        :theme="theme"
        :loading="loading"
        @activate="emit('activate', $event)"
        @preview="emit('preview', $event)"
        @configure="emit('configure', $event)"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Palette class="w-12 h-12 mb-4 opacity-20" />
      <p>{{ searchQuery ? '未找到匹配的主题' : '暂无主题' }}</p>
      <p v-if="!searchQuery" class="text-sm">上传主题包后，这里会显示主题列表</p>
    </div>
  </div>
</template>
