<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits<{
  uploaded: []
}>()

const authStore = useAuthStore()
const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
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
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = `Unsupported file type: ${file.type}`
    return
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    errorMessage.value = `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`
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
    errorMessage.value = err?.data?.message || 'Upload failed'
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div>
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
      :class="[
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
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
        accept="image/*,.pdf"
        class="hidden"
        @change="onFileSelect"
      />

      <div v-if="isUploading" class="flex flex-col items-center gap-2">
        <span class="i-heroicons-arrow-up-tray w-8 h-8 text-primary animate-pulse" />
        <p class="text-sm text-gray-500">Uploading...</p>
      </div>

      <div v-else class="flex flex-col items-center gap-2">
        <span class="i-heroicons-cloud-arrow-up w-8 h-8 text-gray-400" />
        <p class="text-sm text-gray-600">
          Drop files here or <span class="text-primary font-medium">click to upload</span>
        </p>
        <p class="text-xs text-gray-400">Images and PDF, up to 10MB</p>
      </div>
    </div>

    <p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>
