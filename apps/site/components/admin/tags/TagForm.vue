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
    errors.name = 'Name is required'
    return false
  }

  if (!form.slug.trim()) {
    errors.slug = 'Slug is required'
    return false
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug = 'Slug must be URL-safe (lowercase, hyphens)'
    return false
  }

  return true
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    name: form.name.trim(),
    slug: form.slug.trim(),
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
          {{ tag ? 'Edit Tag' : 'New Tag' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              :class="errors.name ? 'border-red-300' : 'border-gray-300'"
              placeholder="Tag name"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              :class="errors.slug ? 'border-red-300' : 'border-gray-300'"
              placeholder="tag-slug"
            />
            <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
          </div>

          <!-- Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
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
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary px-4 py-2 text-sm"
            >
              {{ tag ? 'Save Changes' : 'Create Tag' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
