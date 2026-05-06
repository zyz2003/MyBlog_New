<script setup lang="ts">
const props = defineProps<{
  tag?: {
    id: number
    name: string
    slug: string
    color: string | null
  } | null
}>()

const emit = defineEmits<{
  submit: [data: { name: string; slug: string; color: string }]
  close: []
}>()

const form = reactive({
  name: props.tag?.name || '',
  slug: props.tag?.slug || '',
  color: props.tag?.color || '#3B82F6',
})

const errors = reactive({
  name: '',
  slug: '',
})

// Auto-generate slug from name
watch(() => form.name, (val) => {
  if (!props.tag || form.slug === slugify(props.tag.name)) {
    form.slug = slugify(val)
  }
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function validate(): boolean {
  errors.name = ''
  errors.slug = ''

  if (!form.name.trim()) {
    errors.name = '请输入标签名称'
    return false
  }

  // Slug is optional - only validate if provided
  if (form.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug = '别名必须是URL安全格式（小写字母、连字符）'
    return false
  }

  return true
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined, // Let API auto-generate if empty
    color: form.color,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click="emit('close')" />

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ tag ? '编辑标签' : '新建标签' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              :class="errors.name ? 'border-red-300' : 'border-gray-300'"
              placeholder="请输入标签名称"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">别名（可选）</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="自动生成（如：JavaScript → javascript）"
            />
            <p class="mt-1 text-xs text-gray-400">留空将自动生成，用于 URL 如 /tags/javascript</p>
          </div>

          <!-- Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">颜色</label>
            <div class="flex items-center gap-3">
              <input
                v-model="form.color"
                type="color"
                class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <span class="text-sm text-gray-500 font-mono">{{ form.color }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn-primary px-4 py-2 text-sm"
            >
              {{ tag ? '保存修改' : '创建标签' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
