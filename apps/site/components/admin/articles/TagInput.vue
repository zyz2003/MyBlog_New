<script setup lang="ts">
interface Tag {
  id: number
  name: string
  slug: string
  color: string | null
}

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const api = useAdminApi()
const allTags = ref<Tag[]>([])
const loading = ref(true)
const searchQuery = ref('')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

async function fetchTags() {
  loading.value = true
  try {
    allTags.value = await api.get<Tag[]>('/api/tags')
  }
  catch (e) {
    console.error('Failed to fetch tags:', e)
  }
  finally {
    loading.value = false
  }
}

const selectedTags = computed(() => allTags.value.filter(tag => props.modelValue.includes(tag.id)))

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return allTags.value.filter(tag =>
    !props.modelValue.includes(tag.id) && tag.name.toLowerCase().includes(query),
  )
})

const showCreateOption = computed(() => {
  if (!searchQuery.value.trim()) {
    return false
  }
  const query = searchQuery.value.trim().toLowerCase()
  return !allTags.value.some(tag => tag.name.toLowerCase() === query)
})

function addTag(id: number) {
  if (!props.modelValue.includes(id)) {
    emit('update:modelValue', [...props.modelValue, id])
  }
  searchQuery.value = ''
  showDropdown.value = false
}

function removeTag(id: number) {
  emit('update:modelValue', props.modelValue.filter(tagId => tagId !== id))
}

async function createTag() {
  const name = searchQuery.value.trim()
  if (!name) {
    return
  }

  try {
    const slug = name.toLowerCase().replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-+|-+$/g, '')
    const newTag = await api.post<Tag>('/api/tags', { name, slug })
    allTags.value.push(newTag)
    addTag(newTag.id)
  }
  catch (e) {
    console.error('Failed to create tag:', e)
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  fetchTags()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <div v-if="selectedTags.length > 0" class="mb-3 flex flex-wrap gap-2">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
      >
        {{ tag.name }}
        <button class="rounded-full p-0.5 transition hover:bg-primary/10 hover:text-primary/70" @click="removeTag(tag.id)">
          <span class="i-heroicons-x-mark h-3.5 w-3.5" />
        </button>
      </span>
    </div>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="输入标签名称，支持搜索或直接创建"
      class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      @focus="showDropdown = true"
    >

    <div
      v-if="showDropdown && (filteredTags.length > 0 || showCreateOption)"
      class="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-3xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur"
    >
      <button
        v-for="tag in filteredTags"
        :key="tag.id"
        class="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-text transition hover:bg-primary/6"
        @click="addTag(tag.id)"
      >
        <span>{{ tag.name }}</span>
        <span class="text-xs text-muted">选择</span>
      </button>
      <button
        v-if="showCreateOption"
        class="mt-1 flex w-full items-center justify-between rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-left text-sm text-primary transition hover:bg-primary/10"
        @click="createTag"
      >
        <span>创建标签：{{ searchQuery }}</span>
        <span class="text-xs">新建</span>
      </button>
    </div>

    <p v-if="loading" class="mt-2 text-xs text-muted">标签加载中...</p>
  </div>
</template>
