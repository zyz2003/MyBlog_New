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
const inputRef = ref<HTMLInputElement | null>(null)
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

const selectedTags = computed(() => {
  return allTags.value.filter(t => props.modelValue.includes(t.id))
})

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return allTags.value.filter(t =>
    !props.modelValue.includes(t.id) &&
    t.name.toLowerCase().includes(query),
  )
})

const showCreateOption = computed(() => {
  if (!searchQuery.value) return false
  const query = searchQuery.value.toLowerCase()
  return !allTags.value.some(t => t.name.toLowerCase() === query)
})

function addTag(id: number) {
  if (!props.modelValue.includes(id)) {
    emit('update:modelValue', [...props.modelValue, id])
  }
  searchQuery.value = ''
  showDropdown.value = false
}

function removeTag(id: number) {
  emit('update:modelValue', props.modelValue.filter(tid => tid !== id))
}

async function createTag() {
  const name = searchQuery.value.trim()
  if (!name) return

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '')
    const newTag = await api.post<Tag>('/api/tags', { name, slug })
    allTags.value.push(newTag)
    addTag(newTag.id)
  }
  catch (e) {
    console.error('Failed to create tag:', e)
  }
}

function onInputFocus() {
  showDropdown.value = true
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
    <!-- Selected tags -->
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-1.5 mb-2">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-sm"
      >
        {{ tag.name }}
        <button
          class="hover:text-primary/70"
          @click="removeTag(tag.id)"
        >
          <span class="i-heroicons-x-mark w-3.5 h-3.5" />
        </button>
      </span>
    </div>

    <!-- Input -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        placeholder="输入以搜索或创建标签..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        @focus="onInputFocus"
      >
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown && (filteredTags.length > 0 || showCreateOption)"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
    >
      <div
        v-for="tag in filteredTags"
        :key="tag.id"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
        @click="addTag(tag.id)"
      >
        {{ tag.name }}
      </div>
      <div
        v-if="showCreateOption"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-primary/5 text-primary border-t border-gray-100"
        @click="createTag"
      >
        创建标签: "{{ searchQuery }}"
      </div>
    </div>

    <!-- Loading state -->
    <p v-if="loading" class="text-xs text-gray-400 mt-1">加载标签中...</p>
  </div>
</template>
