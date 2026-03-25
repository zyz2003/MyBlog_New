<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  X,
  Copy,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  Download,
  Trash2,
} from 'lucide-vue-next'
import type { Media } from '@my-blog/database'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  media: Media | null
  showInsert?: boolean
  allMedia?: Media[]
}

const props = withDefaults(defineProps<Props>(), {
  showInsert: false,
  allMedia: () => [],
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'insert': [url: string]
  'delete': [id: string]
}>()

const currentMedia = ref<Media | null>(null)
const isEditingAlt = ref(false)
const altText = ref('')
const copied = ref(false)

// Watch for media changes
watch(
  () => props.media,
  (newMedia) => {
    if (newMedia) {
      currentMedia.value = newMedia
      altText.value = newMedia.altText || ''
    }
  },
  { immediate: true }
)

// Watch for dialog close
watch(
  () => props.open,
  (newOpen) => {
    if (!newOpen) {
      isEditingAlt.value = false
      copied.value = false
    }
  }
)

const isImage = computed(() => {
  return currentMedia.value?.mimeType?.startsWith('image/')
})

const isVideo = computed(() => {
  return currentMedia.value?.mimeType?.startsWith('video/')
})

const getFileIcon = () => {
  if (isImage.value) return ImageIcon
  if (isVideo.value) return Video
  return FileText
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes || bytes === 0) return '0 B'
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

const copyLink = async () => {
  if (currentMedia.value?.url) {
    try {
      await navigator.clipboard.writeText(currentMedia.value.url)
      copied.value = true
      toast.success('链接已复制')
      setTimeout(() => (copied.value = false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }
}

const insertIntoPost = () => {
  if (currentMedia.value?.url) {
    emit('insert', currentMedia.value.url)
    emit('update:open', false)
  }
}

const downloadFile = () => {
  if (currentMedia.value?.url) {
    const a = document.createElement('a')
    a.href = currentMedia.value.url
    a.download = currentMedia.value.originalName || currentMedia.value.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

const handleDelete = () => {
  if (currentMedia.value?.id) {
    emit('delete', currentMedia.value.id)
    emit('update:open', false)
  }
}

const saveAltText = async () => {
  if (currentMedia.value) {
    currentMedia.value.altText = altText.value
    isEditingAlt.value = false
    toast.success('替代文本已保存')
  }
}

const goToPrevious = () => {
  if (props.allMedia.length === 0 || !currentMedia.value) return

  const currentIndex = props.allMedia.findIndex((m) => m.id === currentMedia.value!.id)
  if (currentIndex > 0) {
    currentMedia.value = props.allMedia[currentIndex - 1]
    altText.value = currentMedia.value.altText || ''
  }
}

const goToNext = () => {
  if (props.allMedia.length === 0 || !currentMedia.value) return

  const currentIndex = props.allMedia.findIndex((m) => m.id === currentMedia.value!.id)
  if (currentIndex < props.allMedia.length - 1) {
    currentMedia.value = props.allMedia[currentIndex + 1]
    altText.value = currentMedia.value.altText || ''
  }
}

const hasPrevious = computed(() => {
  if (props.allMedia.length === 0 || !currentMedia.value) return false
  const currentIndex = props.allMedia.findIndex((m) => m.id === currentMedia.value!.id)
  return currentIndex > 0
})

const hasNext = computed(() => {
  if (props.allMedia.length === 0 || !currentMedia.value) return false
  const currentIndex = props.allMedia.findIndex((m) => m.id === currentMedia.value!.id)
  return currentIndex < props.allMedia.length - 1
})

// Handle keyboard events
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.open) return

  if (e.key === 'Escape') {
    emit('update:open', false)
  } else if (e.key === 'ArrowLeft' && hasPrevious.value) {
    goToPrevious()
  } else if (e.key === 'ArrowRight' && hasNext.value) {
    goToNext()
  }
}

// Attach keyboard listener when dialog is open
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-auto p-0">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">媒体预览</h2>
        <Button variant="ghost" size="icon" @click="emit('update:open', false)">
          <X class="w-5 h-5" />
        </Button>
      </div>

      <div v-if="currentMedia" class="flex flex-col md:flex-row">
        <!-- Media Display -->
        <div class="flex-1 p-4 bg-muted/50 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
          <!-- Navigation arrows -->
          <Button
            v-if="hasPrevious"
            variant="secondary"
            size="icon"
            class="absolute left-2"
            @click="goToPrevious"
          >
            <ChevronLeft class="w-5 h-5" />
          </Button>
          <Button
            v-if="hasNext"
            variant="secondary"
            size="icon"
            class="absolute right-2"
            @click="goToNext"
          >
            <ChevronRight class="w-5 h-5" />
          </Button>

          <!-- Image -->
          <img
            v-if="isImage"
            :src="currentMedia.url"
            :alt="currentMedia.altText || currentMedia.originalName || currentMedia.filename"
            class="max-w-full max-h-[70vh] object-contain"
          />

          <!-- Video -->
          <video
            v-else-if="isVideo"
            :src="currentMedia.url"
            controls
            class="max-w-full max-h-[70vh]"
          />

          <!-- Document -->
          <div
            v-else
            class="flex flex-col items-center gap-4"
          >
            <component
              :is="getFileIcon()"
              class="w-24 h-24 text-muted-foreground"
            />
            <p class="text-sm text-muted-foreground">
              此文件类型不支持预览
            </p>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="w-full md:w-72 border-l p-4 space-y-4">
          <!-- Filename -->
          <div>
            <h3 class="font-medium truncate" :title="currentMedia.originalName || currentMedia.filename">
              {{ currentMedia.originalName || currentMedia.filename }}
            </h3>
          </div>

          <!-- Alt Text -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <Label class="text-sm">替代文本</Label>
              <Button
                v-if="!isEditingAlt"
                variant="ghost"
                size="sm"
                @click="isEditingAlt = true"
              >
                编辑
              </Button>
            </div>
            <div v-if="isEditingAlt" class="space-y-2">
              <Input v-model="altText" placeholder="描述图片内容..." />
              <div class="flex gap-2">
                <Button size="sm" @click="saveAltText">保存</Button>
                <Button size="sm" variant="ghost" @click="isEditingAlt = false">取消</Button>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground min-h-[20px]">
              {{ currentMedia.altText || '未设置' }}
            </p>
          </div>

          <!-- Media Info -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">类型</span>
              <span>{{ currentMedia.mimeType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">大小</span>
              <span>{{ formatFileSize(currentMedia.size) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">上传日期</span>
              <span>{{ formatDate(currentMedia.uploadedAt) }}</span>
            </div>
            <div v-if="currentMedia.width && currentMedia.height" class="flex justify-between">
              <span class="text-muted-foreground">尺寸</span>
              <span>{{ currentMedia.width }} x {{ currentMedia.height }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-4 border-t">
            <Button variant="outline" class="w-full justify-start" @click="copyLink">
              <Copy class="w-4 h-4 mr-2" />
              {{ copied ? '已复制' : '复制链接' }}
            </Button>
            <Button v-if="showInsert" class="w-full justify-start" @click="insertIntoPost">
              <LinkIcon class="w-4 h-4 mr-2" />
              插入文章
            </Button>
            <Button variant="outline" class="w-full justify-start" @click="downloadFile">
              <Download class="w-4 h-4 mr-2" />
              下载
            </Button>
            <Button
              variant="destructive"
              class="w-full justify-start"
              @click="handleDelete"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              删除
            </Button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="p-8 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Navigation arrows positioning for overlay */
:deep(.relative) {
  position: relative;
}
</style>
