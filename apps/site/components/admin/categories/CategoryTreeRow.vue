<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryTreeNode } from './CategoryTreeTable.vue'
import { TableRow, TableCell } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-vue-next'

const props = defineProps<{
  category: CategoryTreeNode
  expanded?: boolean
  depth?: number
  selected?: boolean
}>()

const emit = defineEmits<{
  'toggleExpand': []
  'toggleSelect': []
  'edit': []
  'delete': []
  'addSub': []
}>()

const indent = computed(() => (props.depth || 0) * 24)
</script>

<template>
  <TableRow
    class="group hover:bg-muted/50"
    :class="{ 'bg-muted/30': selected }"
  >
    <TableCell :style="{ paddingLeft: `${indent + 16}px` }">
      <div class="flex items-center gap-2">
        <!-- 选择框 -->
        <input
          type="checkbox"
          :checked="selected"
          @change="emit('toggleSelect')"
          class="w-4 h-4 rounded border-gray-300"
        />
        <!-- 展开/收起按钮 -->
        <button
          v-if="category.children?.length > 0"
          @click="emit('toggleExpand')"
          class="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronRight
            v-if="!expanded"
            class="w-4 h-4"
          />
          <ChevronDown
            v-else
            class="w-4 h-4"
          />
        </button>
        <span
          v-else
          class="w-6"
        ></span>
        <!-- 拖拽手柄 -->
        <GripVertical class="w-4 h-4 text-muted-foreground drag-handle cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        <!-- 颜色指示器 -->
        <span
          v-if="category.color"
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: category.color }"
        ></span>
        <!-- 文件夹图标 -->
        <Folder
          v-if="category.children?.length > 0"
          class="w-4 h-4 text-primary"
        />
        <!-- 分类名称 -->
        <span class="text-sm font-medium">{{ category.name }}</span>
      </div>
    </TableCell>
    <TableCell>
      <code class="text-xs text-muted-foreground">{{ category.slug }}</code>
    </TableCell>
    <TableCell class="max-w-[200px] truncate text-muted-foreground">
      {{ category.description || '-' }}
    </TableCell>
    <TableCell>
      <Badge variant="secondary">{{ category.articleCount || 0 }}</Badge>
    </TableCell>
    <TableCell>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          @click="emit('addSub')"
          title="添加子分类"
        >
          <Plus class="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          @click="emit('edit')"
          title="编辑"
        >
          <Pencil class="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          @click="emit('delete')"
          title="删除"
          :disabled="category.children?.length > 0"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
  <!-- 递归渲染子分类 -->
  <template v-if="expanded && category.children?.length > 0">
    <CategoryTreeRow
      v-for="child in category.children"
      :key="child.id"
      :category="child"
      :depth="(depth || 0) + 1"
      :selected="selected"
      @toggle-expand="emit('toggleExpand')"
      @toggle-select="emit('toggleSelect')"
      @edit="emit('edit')"
      @delete="emit('delete')"
      @add-sub="emit('addSub')"
    />
  </template>
</template>
