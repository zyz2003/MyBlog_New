<script setup lang="ts">
import { ref, computed } from 'vue'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import type { Category } from '@my-blog/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Folder } from 'lucide-vue-next'
import CategoryTreeRow from './CategoryTreeRow.vue'

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
  depth: number
  articleCount: number
}

defineProps<{
  categories: CategoryTreeNode[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'edit': [category: CategoryTreeNode]
  'delete': [category: CategoryTreeNode]
  'addSubCategory': [parent: CategoryTreeNode]
  'reorder': [fromId: string, toId: string, dropPosition: 'before' | 'after' | 'inside']
}>()

// 展开状态管理
const expandedIds = ref<Set<string>>(new Set())

const toggleExpand = (id: string) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// 拖拽处理
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (!over || active.id === over.id) return

  // 简单处理：拖拽到目标之后
  emit('reorder', active.id as string, over.id as string, 'after')
}

// 批量选择
const selectedIds = ref<Set<string>>(new Set())

const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const clearSelection = () => {
  selectedIds.value.clear()
}

const hasSelected = computed(() => selectedIds.value.size > 0)
</script>

<template>
  <div class="space-y-4">
    <!-- 批量操作栏 -->
    <div v-if="hasSelected" class="flex items-center gap-2 p-2 bg-muted rounded-md">
      <span class="text-sm text-muted-foreground">已选择 {{ selectedIds.size }} 项</span>
      <Button variant="ghost" size="sm" @click="clearSelection">
        取消选择
      </Button>
    </div>

    <!-- 表格 -->
    <DndContext @drag-end="handleDragEnd">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]"></TableHead>
            <TableHead>名称</TableHead>
            <TableHead>别名</TableHead>
            <TableHead>描述</TableHead>
            <TableHead class="w-[100px]">文章数</TableHead>
            <TableHead class="w-[120px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="categories.length === 0">
            <TableRow>
              <TableCell :colspan="6" class="h-[200px] text-center">
                <div class="flex flex-col items-center justify-center text-muted-foreground">
                  <Folder class="w-12 h-12 mb-4 opacity-20" />
                  <p>暂无分类</p>
                  <p class="text-sm">点击右上角按钮创建第一个分类</p>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <CategoryTreeRow
              v-for="category in categories"
              :key="category.id"
              :category="category"
              :expanded="expandedIds.has(category.id)"
              :selected="selectedIds.has(category.id)"
              @toggle-expand="toggleExpand(category.id)"
              @toggle-select="toggleSelect(category.id)"
              @edit="emit('edit', category)"
              @delete="emit('delete', category)"
              @add-sub="emit('addSubCategory', category)"
            />
          </template>
        </TableBody>
      </Table>
    </DndContext>
  </div>
</template>
