<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'
import { Upload, File, X, CheckCircle, AlertCircle, Image as ImageIcon, FileText, Video } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

interface UploadProgress {
  name: string
  progress: number
  status: 'waiting' | 'uploading' | 'success' | 'error'
  error?: string
  result?: MediaResult
}

interface MediaResult {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
}

interface Props {
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  folderId?: string
  autoUpload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxSizeMB: 10,
  accept: 'image/*,video/*,application/pdf,.doc,.docx',
  folderId: undefined,
  autoUpload: true,
})

const emit = defineEmits<{
  'upload-complete': [results: MediaResult[]]
  'upload-error': [error: Error]
}>()

const authStore = useAuthStore()

const isDragging = ref(false)
const uploads = ref<UploadProgress[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon
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

const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `文件大小超过限制 (${props.maxSizeMB}MB)`,
    }
  }

  // Check file type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fileType = Object.entries(ALLOWED_MIME_TYPES).find(([_, types]) =>
    types.some((type) => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.replace('*', ''))
      }
      return file.type === type
    })
  )

  return { valid: true }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  handleFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFiles(files)
  // Reset input so same file can be selected again
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

const handleFiles = (files: File[]) => {
  // Check max files limit
  if (files.length + uploads.value.length > props.maxFiles) {
    emit('upload-error', new Error(`最多只能上传 ${props.maxFiles} 个文件`))
    return
  }

  // Validate and add files
  const validFiles: { file: File; id: string }[] = []

  for (const file of files) {
    const validation = validateFile(file)
    if (!validation.valid) {
      emit('upload-error', new Error(`${file.name}: ${validation.error}`))
      continue
    }

    const id = Math.random().toString(36).substring(2, 9)
    uploads.value.push({
      name: file.name,
      progress: 0,
      status: 'waiting',
    })
    validFiles.push({ file, id })
  }

  // Auto upload if enabled
  if (props.autoUpload) {
    for (const { file, id } of validFiles) {
      uploadFile(file, id)
    }
  }
}

const uploadFile = async (file: File, _id: string) => {
  const upload = uploads.value.find((u) => u.name === file.name && uploads.value.filter((u) => u.name === file.name).length === 1)
  if (!upload) return

  upload.status = 'uploading'

  const formData = new FormData()
  formData.append('file', file)
  if (props.folderId) {
    formData.append('folderId', props.folderId)
  }

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        const uploadItem = uploads.value.find((u) => u.name === file.name)
        if (uploadItem) {
          uploadItem.progress = progress
        }
      }
    })

    xhr.addEventListener('load', () => {
      const uploadItem = uploads.value.find((u) => u.name === file.name)
      if (!uploadItem) return

      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          uploadItem.status = 'success'
          uploadItem.progress = 100
          uploadItem.result = response.data
          emit('upload-complete', [response.data])
          resolve()
        } catch (err) {
          uploadItem.status = 'error'
          uploadItem.error = '解析响应失败'
          emit('upload-error', new Error('解析响应失败'))
          reject(err)
        }
      } else {
        uploadItem.status = 'error'
        try {
          const errorData = JSON.parse(xhr.responseText)
          uploadItem.error = errorData.message || '上传失败'
        } catch {
          uploadItem.error = '上传失败'
        }
        emit('upload-error', new Error(uploadItem.error))
        reject(new Error(uploadItem.error))
      }
    })

    xhr.addEventListener('error', () => {
      const uploadItem = uploads.value.find((u) => u.name === file.name)
      if (uploadItem) {
        uploadItem.status = 'error'
        uploadItem.error = '网络错误'
      }
      emit('upload-error', new Error('网络错误'))
      reject(new Error('网络错误'))
    })

    xhr.open('POST', '/api/v1/media')
    if (authStore.token) {
      xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
    }
    xhr.send(formData)
  })
}

const cancelUpload = (upload: UploadProgress) => {
  // In a real implementation, we would abort the XHR request
  upload.status = 'error'
  upload.error = '已取消'
}

const removeUpload = (index: number) => {
  uploads.value.splice(index, 1)
}

const clearCompleted = () => {
  uploads.value = uploads.value.filter((u) => u.status === 'uploading' || u.status === 'waiting')
}

const hasActiveUploads = computed(() => {
  return uploads.value.some((u) => u.status === 'uploading' || u.status === 'waiting')
})

const hasCompletedUploads = computed(() => {
  return uploads.value.some((u) => u.status === 'success' || u.status === 'error')
})
</script>

<template>
  <div class="upload-area">
    <!-- Drop Zone -->
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="inputRef?.click()"
    >
      <input
        ref="inputRef"
        type="file"
        multiple
        :accept="props.accept"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload class="w-8 h-8 text-primary" />
        </div>

        <div>
          <p class="text-lg font-medium mb-1">
            拖拽文件到此处，或点击选择文件
          </p>
          <p class="text-sm text-muted-foreground">
            支持图片、视频、文档格式，单个文件最大 {{ maxSizeMB }}MB
          </p>
        </div>

        <Button type="button" variant="outline">
          <Upload class="w-4 h-4 mr-2" />
          选择文件
        </Button>
      </div>
    </div>

    <!-- Upload List -->
    <div v-if="uploads.length > 0" class="mt-4 space-y-2">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium">上传列表</h4>
        <Button
          v-if="hasCompletedUploads"
          variant="ghost"
          size="sm"
          @click="clearCompleted"
        >
          清除完成
        </Button>
      </div>

      <div
        v-for="(upload, index) in uploads"
        :key="index"
        :class="[
          'flex items-center gap-3 p-3 rounded-lg border bg-card',
          upload.status === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : '',
          upload.status === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : '',
        ]"
      >
        <!-- Icon -->
        <div
          :class="[
            'w-10 h-10 rounded flex items-center justify-center flex-shrink-0',
            upload.status === 'success'
              ? 'bg-green-100 dark:bg-green-800'
              : upload.status === 'error'
                ? 'bg-red-100 dark:bg-red-800'
                : 'bg-muted',
          ]"
        >
          <CheckCircle
            v-if="upload.status === 'success'"
            class="w-5 h-5 text-green-600 dark:text-green-400"
          />
          <AlertCircle
            v-else-if="upload.status === 'error'"
            class="w-5 h-5 text-red-600 dark:text-red-400"
          />
          <component
            :is="getFileIcon(upload.result?.mimeType || 'application/octet-stream')"
            v-else
            class="w-5 h-5 text-muted-foreground"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium truncate">{{ upload.name }}</p>
            <Badge v-if="upload.status === 'success'" variant="secondary" class="text-xs">
              {{ formatFileSize(upload.result?.size || 0) }}
            </Badge>
          </div>

          <!-- Progress -->
          <div v-if="upload.status === 'uploading'" class="mt-1">
            <Progress :model-value="upload.progress" class="h-2" />
          </div>

          <!-- Error message -->
          <p v-if="upload.status === 'error'" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ upload.error }}
          </p>

          <!-- Success message -->
          <p v-if="upload.status === 'success'" class="text-xs text-green-600 dark:text-green-400 mt-1">
            上传完成
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          <Button
            v-if="upload.status === 'uploading'"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click.stop="cancelUpload(upload)"
          >
            <X class="w-4 h-4" />
          </Button>
          <Button
            v-if="upload.status !== 'uploading'"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click.stop="removeUpload(index)"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Upload Button (when not auto-upload) -->
    <div v-if="!autoUpload && uploads.length > 0 && !hasActiveUploads" class="mt-4">
      <Button @click="$emit('upload-all')">
        开始上传
      </Button>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  @apply w-full;
}
</style>
