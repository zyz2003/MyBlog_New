<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Media } from '@my-blog/database'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import {
  Image,
  File,
  Video,
  Grid,
  List,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Check,
  FileText,
} from 'lucide-vue-next'

interface Props {
  media: Media[]
  loading?: boolean
  viewMode?: 'grid' | 'list'
  selectable?: boolean
  modelValue?: string[]
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  viewMode: 'grid',
  selectable: false,
  modelValue: () => [],
  showActions: true,
})

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  'preview': [media: Media]
  'delete': [id: string]
  'select': [media: Media]
}>()

const selectedIds = computed({
  get: () => props.modelValue,
  set: (ids) => emit('update:modelValue', ids),
})

const isSelected = (id: string) => selectedIds.value.includes(id)

const toggleSelect = (id: string) => {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const handlePreview = (mediaItem: Media) => {
  emit('preview', mediaItem)
}

const handleDelete = (id: string) => {
  emit('delete', id)
}

const handleCopyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    // Could emit event for toast notification
  } catch {
    // Fallback for non-clipboard environments
  }
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  return FileText
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date: Date | number | null | undefined): string => {
  if (!date) return '-'
  const d = typeof date === 'number' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>

<template>
  <div class="media-grid">
    <!-- Toolbar -->
    <div v-if="showActions" class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Button
          :variant="viewMode === 'grid' ? 'default' : 'ghost'"
          size="sm"
          @click="$emit('update:viewMode', 'grid')"
        >
          <Grid class="w-4 h-4" />
        </Button>
        <Button
          :variant="viewMode === 'list' ? 'default' : 'ghost'"
          size="sm"
          @click="$emit('update:viewMode', 'list')"
        >
          <List class="w-4 h-4" />
        </Button>
      </div>
      <div v-if="selectable && selectedIds.length > 0" class="text-sm text-muted-foreground">
        已选择 {{ selectedIds.length }} 项
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="media.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
        <Image class="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold mb-1">暂无媒体文件</h3>
      <p class="text-sm text-muted-foreground mb-4">上传您的第一张图片、视频或文档</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <Card
        v-for="mediaItem in media"
        :key="mediaItem.id"
        :class="[
          'group relative cursor-pointer transition-all hover:shadow-md',
          isSelected(mediaItem.id) ? 'ring-2 ring-primary' : '',
        ]"
        @click="selectable ? toggleSelect(mediaItem.id) : handlePreview(mediaItem)"
      >
        <!-- Selection checkbox -->
        <div
          v-if="selectable"
          class="absolute top-2 left-2 z-10"
          @click.stop="toggleSelect(mediaItem.id)"
        >
          <div
            :class="[
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isSelected(mediaItem.id)
                ? 'bg-primary border-primary'
                : 'bg-background border-border',
            ]"
          >
            <Check v-if="isSelected(mediaItem.id)" class="w-3 h-3 text-primary-foreground" />
          </div>
        </div>

        <!-- Actions dropdown -->
        <div
          v-if="showActions"
          class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" class="h-8 w-8">
                <MoreVertical class="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="handlePreview(mediaItem)">
                <Eye class="w-4 h-4 mr-2" />
                预览
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleCopyLink(mediaItem.url)">
                <Copy class="w-4 h-4 mr-2" />
                复制链接
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="handleDelete(mediaItem.id)"
              >
                <Trash2 class="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent class="p-0">
          <!-- Thumbnail -->
          <div class="aspect-square relative overflow-hidden bg-muted">
            <img
              v-if="mediaItem.mimeType.startsWith('image/')"
              :src="mediaItem.url"
              :alt="mediaItem.altText || mediaItem.originalName || mediaItem.filename"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <component
                :is="getFileIcon(mediaItem.mimeType)"
                class="w-12 h-12 text-muted-foreground"
              />
            </div>

            <!-- File type badge -->
            <Badge
              variant="secondary"
              class="absolute bottom-2 right-2 text-xs"
            >
              {{ mediaItem.mimeType.split('/')[0] }}
            </Badge>
          </div>

          <!-- Info -->
          <div class="p-3">
            <p class="text-sm font-medium truncate mb-1" :title="mediaItem.originalName || mediaItem.filename">
              {{ mediaItem.originalName || mediaItem.filename }}
            </p>
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>{{ formatFileSize(mediaItem.size) }}</span>
              <span>{{ formatDate(mediaItem.uploadedAt) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- List View -->
    <div v-else class="border rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-muted">
          <tr>
            <th v-if="selectable" class="w-12 p-3 text-left"></th>
            <th class="p-3 text-left text-sm font-medium">预览</th>
            <th class="p-3 text-left text-sm font-medium">文件名</th>
            <th class="p-3 text-left text-sm font-medium">类型</th>
            <th class="p-3 text-left text-sm font-medium">大小</th>
            <th class="p-3 text-left text-sm font-medium">上传日期</th>
            <th v-if="showActions" class="p-3 text-right text-sm font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mediaItem in media"
            :key="mediaItem.id"
            :class="[
              'border-t hover:bg-muted/50 transition-colors cursor-pointer',
              isSelected(mediaItem.id) ? 'bg-muted' : '',
            ]"
            @click="selectable ? toggleSelect(mediaItem.id) : handlePreview(mediaItem)"
          >
            <td v-if="selectable" class="p-3" @click.stop="toggleSelect(mediaItem.id)">
              <div
                :class="[
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected(mediaItem.id)
                    ? 'bg-primary border-primary'
                    : 'bg-background border-border',
                ]"
              >
                <Check v-if="isSelected(mediaItem.id)" class="w-3 h-3 text-primary-foreground" />
              </div>
            </td>
            <td class="p-3">
              <div class="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                <img
                  v-if="mediaItem.mimeType.startsWith('image/')"
                  :src="mediaItem.url"
                  :alt="mediaItem.altText || mediaItem.originalName || mediaItem.filename"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <component
                  v-else
                  :is="getFileIcon(mediaItem.mimeType)"
                  class="w-6 h-6 text-muted-foreground"
                />
              </div>
            </td>
            <td class="p-3">
              <div class="max-w-xs truncate" :title="mediaItem.originalName || mediaItem.filename">
                <p class="text-sm font-medium">{{ mediaItem.originalName || mediaItem.filename }}</p>
              </div>
            </td>
            <td class="p-3">
              <Badge variant="secondary" class="text-xs">
                {{ mediaItem.mimeType.split('/')[0] }}
              </Badge>
            </td>
            <td class="p-3 text-sm text-muted-foreground">
              {{ formatFileSize(mediaItem.size) }}
            </td>
            <td class="p-3 text-sm text-muted-foreground">
              {{ formatDate(mediaItem.uploadedAt) }}
            </td>
            <td v-if="showActions" class="p-3 text-right" @click.stop>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="handlePreview(mediaItem)">
                    <Eye class="w-4 h-4 mr-2" />
                    预览
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleCopyLink(mediaItem.url)">
                    <Copy class="w-4 h-4 mr-2" />
                    复制链接
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="handleDelete(mediaItem.id)"
                  >
                    <Trash2 class="w-4 h-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.media-grid {
  @apply w-full;
}
</style>
