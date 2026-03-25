<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tag } from '@my-blog/database'
import { Button } from '~/components/ui/button'
import { Tag as TagIcon, TrendingUp } from 'lucide-vue-next'

export interface TagCloudItem extends Tag {
  usageCount: number
}

const props = defineProps<{
  tags: TagCloudItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  tagClick: [tag: TagCloudItem]
}>()

const sortBy = ref<'frequency' | 'name'>('frequency')

// 预设随机旋转角度（用于视觉变化）
const rotations = ref<Map<string, number>>(new Map())

// 获取或创建随机旋转角度
const getRotation = (tagId: string): number => {
  if (!rotations.value.has(tagId)) {
    rotations.value.set(tagId, Math.floor(Math.random() * 21) - 10)
  }
  return rotations.value.get(tagId)!
}

// 计算标签大小
const getFontSize = (count: number, maxCount: number, minCount: number): string => {
  const minSize = 12
  const maxSize = 32
  const range = maxCount - minCount || 1
  const ratio = (count - minCount) / range
  const size = minSize + ratio * (maxSize - minSize)
  return `${Math.round(size)}px`
}

const sortedTags = computed(() => {
  const tags = [...props.tags]
  if (sortBy.value === 'frequency') {
    return tags.sort((a, b) => b.usageCount - a.usageCount)
  }
  return tags.sort((a, b) => a.name.localeCompare(b.name))
})

const stats = computed(() => {
  const counts = props.tags.map((t) => t.usageCount)
  return {
    max: Math.max(...counts, 0),
    min: Math.min(...counts, 0),
    total: props.tags.reduce((sum, t) => sum + t.usageCount, 0),
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- 头部统计和排序 -->
    <div class="flex justify-between items-center">
      <div class="flex gap-4 text-sm text-muted-foreground">
        <span
          >标签总数：<strong>{{ tags.length }}</strong></span
        >
        <span
          >总使用次数：<strong>{{ stats.total }}</strong></span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">排序：</span>
        <Button
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': sortBy === 'frequency' }"
          @click="sortBy = 'frequency'"
        >
          <TrendingUp class="w-3 h-3 mr-1" />
          频次
        </Button>
        <Button
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': sortBy === 'name' }"
          @click="sortBy = 'name'"
        >
          名称
        </Button>
      </div>
    </div>

    <!-- 标签云 -->
    <div v-if="tags.length > 0" class="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
      <span
        v-for="tag in sortedTags"
        :key="tag.id"
        class="inline-flex items-center cursor-pointer transition-transform hover:scale-110"
        :style="{
          fontSize: getFontSize(tag.usageCount, stats.max, stats.min),
          color: tag.color || '#64748b',
          transform: `rotate(${getRotation(tag.id)}deg)`,
        }"
        @click="emit('tagClick', tag)"
      >
        {{ tag.name }}
        <span class="ml-1 text-xs opacity-60" :style="{ fontSize: '0.5em' }">
          ({{ tag.usageCount }})
        </span>
      </span>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <TagIcon class="w-12 h-12 mb-4 opacity-20" />
      <p>暂无标签数据</p>
      <p class="text-sm">创建文章并添加标签后，这里会显示标签云</p>
    </div>
  </div>
</template>
