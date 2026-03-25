<script setup lang="ts">
import { ref, watch } from 'vue'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Upload, X, Image as ImageIcon, ExternalLink } from 'lucide-vue-next'

interface Props {
  modelValue: string | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const imageUrl = ref(props.modelValue || '')
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// Watch for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    imageUrl.value = newVal || ''
  }
)

// Handle URL input change
function handleUrlChange() {
  emit('update:modelValue', imageUrl.value || null)
}

// Remove image
function removeImage() {
  imageUrl.value = ''
  emit('update:modelValue', null)
}

// Trigger file input
function triggerFileInput() {
  fileInputRef.value?.click()
}

// Handle file upload (placeholder - integrate with media service)
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }

  isUploading.value = true

  try {
    // TODO: Integrate with media upload API
    // For now, create a local preview URL
    const localUrl = URL.createObjectURL(file)
    emit('update:modelValue', localUrl)
    imageUrl.value = localUrl

    // In production, upload to server:
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await $fetch('/api/v1/media', {
    //   method: 'POST',
    //   body: formData,
    // })
    // emit('update:modelValue', response.url)
  } catch (error) {
    console.error('Upload failed:', error)
    alert('上传失败，请稍后重试')
  } finally {
    isUploading.value = false
    // Reset file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// Open media library (placeholder)
function openMediaLibrary() {
  // TODO: Open media library modal
  alert('媒体库功能开发中...')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Label for="coverImage" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        封面图
      </Label>
      <div v-if="!readonly" class="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          :disabled="isUploading"
          @click="triggerFileInput"
        >
          <Upload class="mr-1.5 h-3.5 w-3.5" />
          {{ isUploading ? '上传中...' : '上传' }}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="openMediaLibrary"
        >
          <ImageIcon class="mr-1.5 h-3.5 w-3.5" />
          媒体库
        </Button>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- Image Preview or Upload Placeholder -->
    <Card class="overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardContent class="p-0">
        <div
          v-if="modelValue"
          class="group relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200"
        >
          <img
            :src="modelValue"
            alt="封面图"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            @error="$event.target.style.display='none'"
          />
          <!-- Overlay with actions -->
          <div
            v-if="!readonly"
            class="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/70 via-black/40 to-black/30 opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            <Button
              v-if="modelValue"
              type="button"
              variant="secondary"
              size="sm"
              class="backdrop-blur-sm transition-transform hover:scale-105"
              @click="removeImage"
            >
              <X class="mr-1.5 h-4 w-4" />
              移除
            </Button>
            <a
              v-if="modelValue.startsWith('http')"
              :href="modelValue"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="secondary" size="sm" class="backdrop-blur-sm transition-transform hover:scale-105">
                <ExternalLink class="h-4 w-4" />
              </Button>
            </a>
          </div>
          <!-- Success indicator -->
          <div class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/90 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div
          v-else
          class="group flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-16 text-center transition-all hover:from-slate-100 hover:to-slate-150"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner transition-transform group-hover:scale-110 group-hover:shadow-lg">
            <ImageIcon class="h-8 w-8 text-slate-400" />
          </div>
          <p class="mb-1 text-sm font-medium text-slate-600">
            暂无封面图
          </p>
          <p class="text-xs text-slate-400">
            上传图片或输入 URL
          </p>
          <div v-if="!readonly" class="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="h-8 border-slate-200 bg-white text-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              @click="triggerFileInput"
            >
              <Upload class="mr-1 h-3.5 w-3.5" />
              选择图片
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- URL Input -->
    <div class="relative space-y-1.5">
      <div class="relative">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </span>
        <Input
          id="coverImage"
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          :readonly="readonly"
          class="h-11 border-slate-200 bg-white pl-10 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
          @blur="handleUrlChange"
          @keyup.enter="handleUrlChange"
        />
      </div>
      <p class="flex items-center gap-1.5 text-xs text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        支持 JPG、PNG、GIF 格式，建议尺寸 1200x630
      </p>
    </div>
  </div>
</template>
