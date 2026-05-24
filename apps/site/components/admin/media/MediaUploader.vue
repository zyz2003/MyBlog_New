<script setup lang="ts">
import { useAuthStore } from '~/stores/admin/auth'

const emit = defineEmits<{
  uploaded: []
}>()

const authStore = useAuthStore()
const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const ALLOWED_TYPES = [
  // 图片
  { mime: 'image/jpeg', label: 'JPG', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/png', label: 'PNG', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/gif', label: 'GIF', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/webp', label: 'WebP', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/svg+xml', label: 'SVG', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/bmp', label: 'BMP', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/x-icon', label: 'ICO', icon: 'i-heroicons-photo', category: 'image' },
  { mime: 'image/tiff', label: 'TIFF', icon: 'i-heroicons-photo', category: 'image' },
  // 文档
  { mime: 'application/pdf', label: 'PDF', icon: 'i-heroicons-document-text', category: 'doc' },
  { mime: 'application/msword', label: 'DOC', icon: 'i-heroicons-document', category: 'doc' },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX', icon: 'i-heroicons-document', category: 'doc' },
  { mime: 'application/vnd.ms-excel', label: 'XLS', icon: 'i-heroicons-table-cells', category: 'doc' },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'XLSX', icon: 'i-heroicons-table-cells', category: 'doc' },
  { mime: 'application/vnd.ms-powerpoint', label: 'PPT', icon: 'i-heroicons-document', category: 'doc' },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PPTX', icon: 'i-heroicons-document', category: 'doc' },
  { mime: 'text/plain', label: 'TXT', icon: 'i-heroicons-document', category: 'doc' },
  { mime: 'text/markdown', label: 'MD', icon: 'i-heroicons-document', category: 'doc' },
  // 音视频
  { mime: 'audio/mpeg', label: 'MP3', icon: 'i-heroicons-musical-note', category: 'media' },
  { mime: 'audio/wav', label: 'WAV', icon: 'i-heroicons-musical-note', category: 'media' },
  { mime: 'audio/ogg', label: 'OGG', icon: 'i-heroicons-musical-note', category: 'media' },
  { mime: 'video/mp4', label: 'MP4', icon: 'i-heroicons-film', category: 'media' },
  { mime: 'video/webm', label: 'WebM', icon: 'i-heroicons-film', category: 'media' },
  { mime: 'video/x-msvideo', label: 'AVI', icon: 'i-heroicons-film', category: 'media' },
  // 压缩包
  { mime: 'application/zip', label: 'ZIP', icon: 'i-heroicons-archive-box', category: 'archive' },
  { mime: 'application/x-rar-compressed', label: 'RAR', icon: 'i-heroicons-archive-box', category: 'archive' },
  { mime: 'application/x-7z-compressed', label: '7Z', icon: 'i-heroicons-archive-box', category: 'archive' },
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFile(input.files[0])
    input.value = ''
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFile(file: File) {
  errorMessage.value = ''

  // Validate type
  const allowedMimes = ALLOWED_TYPES.map(t => t.mime)
  if (!allowedMimes.includes(file.type)) {
    errorMessage.value = `不支持的文件类型: ${file.type}`
    return
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    errorMessage.value = `文件过大，最大支持: ${MAX_SIZE / 1024 / 1024}MB`
    return
  }

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    await $fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    emit('uploaded')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    errorMessage.value = err?.data?.message || '上传失败'
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer"
    :class="[
      isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-surface',
      isUploading ? 'opacity-50 pointer-events-none' : '',
    ]"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.mp3,.wav,.ogg,.mp4,.webm,.avi,.zip,.rar,.7z"
      class="hidden"
      @change="onFileSelect"
    />

    <div v-if="isUploading" class="flex flex-col items-center gap-3">
      <div class="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      <p class="text-sm text-secondary">上传中...</p>
    </div>

    <div v-else class="flex flex-col items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center">
        <span class="i-heroicons-cloud-arrow-up w-6 h-6 text-secondary" />
      </div>
      <div>
        <p class="text-sm text-text">
          拖拽文件到此处或 <span class="text-primary font-medium">点击上传</span>
        </p>
        <div class="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          <span
            v-for="(types, category) in {图片: ['JPG','PNG','GIF','WebP','SVG','BMP','ICO'], 文档: ['PDF','DOC','DOCX','XLS','XLSX','PPT','PPTX','TXT','MD'], 音视频: ['MP3','WAV','OGG','MP4','WebM','AVI'], 压缩包: ['ZIP','RAR','7Z']}"
            :key="category"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-muted"
          >
            {{ category }}: {{ types.join('/') }}
          </span>
        </div>
        <p class="text-xs text-muted mt-1.5">最大 10MB</p>
      </div>
    </div>
  </div>

  <p v-if="errorMessage" class="mt-3 text-sm text-red-500 flex items-center gap-1">
    <span class="i-heroicons-exclamation-circle w-4 h-4" />
    {{ errorMessage }}
  </p>
</template>
