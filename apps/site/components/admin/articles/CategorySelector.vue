<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
}

const props = defineProps<{
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const api = useAdminApi()
const categories = ref<Category[]>([])
const loading = ref(true)

async function fetchCategories() {
  loading.value = true
  try {
    categories.value = await api.get<Category[]>('/api/categories')
  }
  catch (e) {
    console.error('Failed to fetch categories:', e)
  }
  finally {
    loading.value = false
  }
}

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value ? Number(target.value) : null
  emit('update:modelValue', value)
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <select
    :value="modelValue ?? ''"
    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
    :disabled="loading"
    @change="onChange"
  >
    <option value="" disabled>{{ loading ? 'Loading...' : 'Select category...' }}</option>
    <option
      v-for="cat in categories"
      :key="cat.id"
      :value="cat.id"
    >
      {{ cat.name }}
    </option>
  </select>
</template>
