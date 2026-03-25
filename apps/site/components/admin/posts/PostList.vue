<script setup lang="ts">
import { ref, computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'

interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: 'draft' | 'published' | 'archived' | 'reviewing'
  categoryId: string | null
  category?: { name: string; slug: string } | null
  tags: { name: string; slug: string }[]
  authorId: string
  author?: { username: string } | null
  viewCount: number
  likeCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface Props {
  posts: PostListItem[]
  selectedPostIds: Set<string>
  selectAll: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:selectedPostIds': [value: Set<string>]
  'update:selectAll': [value: boolean]
  'edit': [id: string]
  'delete': [id: string]
  'view': [id: string]
}>()

// Status badge mapping
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  published: { label: '已发布', variant: 'default' },
  draft: { label: '草稿', variant: 'secondary' },
  reviewing: { label: '审核中', variant: 'outline' },
  archived: { label: '已归档', variant: 'secondary' },
}

// Handle select all
function handleSelectAll(checked: boolean) {
  emit('update:selectAll', checked)
  if (checked) {
    emit('update:selectedPostIds', new Set(props.posts.map(p => p.id)))
  } else {
    emit('update:selectedPostIds', new Set())
  }
}

// Handle select single post
function handleSelectPost(id: string, checked: boolean) {
  const newSelected = new Set(props.selectedPostIds)
  if (checked) {
    newSelected.add(id)
  } else {
    newSelected.delete(id)
  }
  emit('update:selectedPostIds', newSelected)

  // Update select all state
  const allSelected = newSelected.size === props.posts.length && props.posts.length > 0
  emit('update:selectAll', allSelected)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
    <Table>
      <TableHeader>
        <TableRow class="bg-gradient-to-r from-slate-50/80 to-slate-100/50 border-b-slate-200">
          <TableHead class="w-12">
            <div class="flex items-center justify-center">
              <Checkbox
                :checked="selectAll"
                @update:checked="handleSelectAll"
                class="border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
              />
            </div>
          </TableHead>
          <TableHead class="font-semibold text-slate-700">标题</TableHead>
          <TableHead class="w-24 font-semibold text-slate-700">状态</TableHead>
          <TableHead class="w-32 font-semibold text-slate-700">分类</TableHead>
          <TableHead class="w-32 font-semibold text-slate-700">标签</TableHead>
          <TableHead class="w-24 font-semibold text-slate-700">浏览</TableHead>
          <TableHead class="w-32 font-semibold text-slate-700">发布时间</TableHead>
          <TableHead class="w-24 font-semibold text-slate-700">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- Loading State -->
        <TableRow v-if="loading" class="hover:bg-transparent">
          <TableCell :colspan="8" class="text-center py-12">
            <div class="flex flex-col items-center justify-center gap-3">
              <div class="relative">
                <div class="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="h-5 w-5 animate-pulse rounded-full bg-sky-400/30"></div>
                </div>
              </div>
              <span class="text-sm font-medium text-slate-500">加载中...</span>
            </div>
          </TableCell>
        </TableRow>

        <!-- Empty State -->
        <TableRow v-else-if="posts.length === 0" class="hover:bg-transparent">
          <TableCell :colspan="8" class="text-center py-12">
            <div class="flex flex-col items-center justify-center gap-3">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-slate-600">暂无文章</p>
                <p class="text-xs text-slate-400 mt-1">点击"新建文章"开始创作</p>
              </div>
            </div>
          </TableCell>
        </TableRow>

        <!-- Posts -->
        <TableRow
          v-for="post in posts"
          :key="post.id"
          class="group transition-colors hover:bg-gradient-to-r hover:from-sky-50/30 hover:to-transparent"
        >
          <TableCell>
            <div class="flex items-center justify-center">
              <Checkbox
                :checked="selectedPostIds.has(post.id)"
                @update:checked="(checked) => handleSelectPost(post.id, checked)"
                class="border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 transition-all"
              />
            </div>
          </TableCell>
          <TableCell>
            <div class="space-y-1.5">
              <div class="font-semibold text-slate-900 transition-colors group-hover:text-sky-700">{{ post.title }}</div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 font-mono">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {{ post.slug }}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge
              :variant="statusConfig[post.status]?.variant"
              class="px-2.5 py-1 text-xs font-medium shadow-sm"
              :class="{
                'bg-emerald-500 hover:bg-emerald-600': post.status === 'published',
                'bg-slate-200 hover:bg-slate-300 text-slate-700': post.status === 'draft',
                'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100': post.status === 'reviewing',
                'bg-slate-100 hover:bg-slate-200 text-slate-600': post.status === 'archived',
              }"
            >
              <span v-if="post.status === 'published'" class="flex items-center gap-1">
                <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                {{ statusConfig[post.status]?.label }}
              </span>
              <span v-else>{{ statusConfig[post.status]?.label }}</span>
            </Badge>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-sm text-slate-600 border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ post.category?.name || '-' }}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5">
              <Badge
                v-for="tag in post.tags"
                :key="tag.slug"
                variant="outline"
                class="px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors"
              >
                <span class="flex items-center gap-1">
                  <span class="h-1 w-1 rounded-full bg-violet-400"></span>
                  {{ tag.name }}
                </span>
              </Badge>
            </div>
            <span v-else class="text-slate-400">-</span>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-1.5 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ post.viewCount }}
            </div>
          </TableCell>
          <TableCell class="text-sm">
            <div class="flex items-center gap-1.5 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('zh-CN') : '-' }}
            </div>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm"
                @click="$emit('view', post.id)"
                title="查看"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg text-slate-500 transition-all hover:bg-sky-50 hover:text-sky-600 hover:shadow-sm"
                @click="$emit('edit', post.id)"
                title="编辑"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm"
                @click="$emit('delete', post.id)"
                title="删除"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
