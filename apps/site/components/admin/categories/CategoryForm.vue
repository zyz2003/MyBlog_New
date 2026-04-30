<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const props = defineProps<{
  category?: CategoryTreeNode | null
  allCategories?: CategoryTreeNode[]
}>()

const emit = defineEmits<{
  submit: [data: { name: string; slug: string; description: string; parentId: number | null; sortOrder: number }]
  close: []
}>()

const form = reactive({
  name: props.category?.name || '',
  slug: props.category?.slug || '',
  description: props.category?.description || '',
  parentId: props.category?.parentId ?? null as number | null,
  sortOrder: props.category?.sortOrder ?? 0,
})

const errors = reactive({
  name: '',
  slug: '',
})

// Auto-generate slug from name
watch(() => form.name, (val) => {
  if (!props.category || form.slug === slugify(props.category.name)) {
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

// Flatten categories for parent select, excluding self and descendants
const flatParents = computed(() => {
  if (!props.allCategories) return []

  const result: Array<{ id: number; name: string; level: number }> = []

  function flatten(nodes: CategoryTreeNode[], level: number) {
    for (const node of nodes) {
      // Skip self when editing
      if (props.category && node.id === props.category.id) continue

      result.push({ id: node.id, name: node.name, level })

      if (node.children) {
        flatten(node.children, level + 1)
      }
    }
  }

  flatten(props.allCategories, 0)
  return result
})

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
    description: form.description.trim(),
    parentId: form.parentId,
    sortOrder: form.sortOrder,
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
          {{ category ? 'Edit Category' : 'New Category' }}
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
              placeholder="Category name"
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
              placeholder="category-slug"
            />
            <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Optional description"
            />
          </div>

          <!-- Parent -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select
              v-model="form.parentId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option :value="null">None (root level)</option>
              <option
                v-for="parent in flatParents"
                :key="parent.id"
                :value="parent.id"
              >
                {{ '  '.repeat(parent.level) }}{{ parent.name }}
              </option>
            </select>
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
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
              {{ category ? 'Save Changes' : 'Create Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
