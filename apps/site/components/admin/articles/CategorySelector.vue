<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
}

defineProps<{
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
    class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
    :disabled="loading"
    @change="onChange"
  >
    <option value="" disabled>{{ loading ? '分类加载中...' : '选择主分类' }}</option>
    <option
      v-for="cat in categories"
      :key="cat.id"
      :value="cat.id"
    >
      {{ cat.name }}
    </option>
  </select>
</template>
