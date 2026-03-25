<script setup lang="ts">
import { computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Tag } from '@my-blog/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Pencil, Trash2, Search, Tag } from 'lucide-vue-next'

export interface TagWithCount extends Tag {
  usageCount: number
}

const props = defineProps<{
  tags: TagWithCount[]
  loading?: boolean
  pagination: {
    total: number
    current: number
    pageSize: number
  }
}>()

const emit = defineEmits<{
  'edit': [tag: TagWithCount]
  'delete': [tag: TagWithCount]
  'pageChange': [page: number]
  'search': [query: string]
}>()

const debouncedSearch = useDebounceFn((query: string) => {
  emit('search', query)
}, 300)
</script>

<template>
  <div class="space-y-4">
    <!-- 搜索栏 -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索标签..."
          class="pl-10"
          @input="debouncedSearch(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- 表格 -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标签</TableHead>
          <TableHead>别名</TableHead>
          <TableHead>描述</TableHead>
          <TableHead class="w-[100px]">使用次数</TableHead>
          <TableHead class="w-[120px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="tag in tags"
          :key="tag.id"
          class="group"
        >
          <TableCell>
            <Badge
              :style="{ backgroundColor: tag.color || '#64748b', color: 'white' }"
              class="text-sm px-3 py-1"
            >
              <Tag class="w-3 h-3 mr-1" />
              {{ tag.name }}
            </Badge>
          </TableCell>
          <TableCell>
            <code class="text-xs text-muted-foreground">{{ tag.slug }}</code>
          </TableCell>
          <TableCell class="max-w-[200px] truncate text-muted-foreground">
            {{ tag.description || '-' }}
          </TableCell>
          <TableCell>
            <Badge variant="outline">{{ tag.usageCount || 0 }}</Badge>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                @click="emit('edit', tag)"
                title="编辑"
              >
                <Pencil class="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="emit('delete', tag)"
                title="删除"
                :disabled="tag.usageCount > 0"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="tags.length === 0">
          <TableCell :colspan="5" class="h-[200px] text-center">
            <div class="flex flex-col items-center justify-center text-muted-foreground">
              <Tag class="w-12 h-12 mb-4 opacity-20" />
              <p>暂无标签</p>
              <p class="text-sm">点击右上角按钮创建第一个标签</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- 分页 -->
    <div class="flex justify-between items-center">
      <p class="text-sm text-muted-foreground">
        共 {{ pagination.total }} 条
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current === 1"
          @click="emit('pageChange', pagination.current - 1)"
        >
          上一页
        </Button>
        <span class="text-sm">
          第 {{ pagination.current }} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current * pagination.pageSize >= pagination.total"
          @click="emit('pageChange', pagination.current + 1)"
        >
          下一页
        </Button>
      </div>
    </div>
  </div>
</template>
