<script setup lang="ts">
import { ref, watch } from 'vue'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { X, Plus } from 'lucide-vue-next'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Props {
  modelValue: {
    categoryId?: string | null
    tagIds?: string[]
  }
  categories?: Category[]
  tags?: Tag[]
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  tags: () => [],
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: { categoryId?: string | null; tagIds?: string[] }]
  'create-tag': [name: string]
}>()

const selectedTagInput = ref('')
const isCreatingTag = ref(false)

// Handle category change
function handleCategoryChange(value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    categoryId: value === '' ? null : value,
  })
}

// Handle tag selection
function handleTagSelect(tagId: string) {
  if (!tagId) return

  const currentTags = props.modelValue.tagIds || []
  if (!currentTags.includes(tagId)) {
    emit('update:modelValue', {
      ...props.modelValue,
      tagIds: [...currentTags, tagId],
    })
  }
  selectedTagInput.value = ''
}

// Remove tag
function removeTag(tagId: string) {
  const currentTags = props.modelValue.tagIds || []
  emit('update:modelValue', {
    ...props.modelValue,
    tagIds: currentTags.filter(id => id !== tagId),
  })
}

// Create new tag
function handleCreateTag() {
  if (!selectedTagInput.value.trim()) return
  emit('create-tag', selectedTagInput.value.trim())
  selectedTagInput.value = ''
  isCreatingTag.value = false
}

// Check if tag is already selected
function isTagSelected(tagId: string): boolean {
  return (props.modelValue.tagIds || []).includes(tagId)
}

// Get selected tags
const selectedTags = computed(() => {
  const selectedIds = props.modelValue.tagIds || []
  return props.tags.filter(tag => selectedIds.includes(tag.id))
})
</script>

<template>
  <div class="space-y-5">
    <!-- Category Selection -->
    <div class="group space-y-2.5">
      <Label for="category" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-sky-400 to-sky-600 text-xs text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </span>
        分类
      </Label>
      <Select
        :model-value="modelValue.categoryId || ''"
        :disabled="readonly"
        @update:model-value="handleCategoryChange"
      >
        <SelectTrigger class="h-11 border-slate-200 bg-white transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm">
          <SelectValue placeholder="选择分类" />
        </SelectTrigger>
        <SelectContent class="border-slate-200 shadow-lg">
          <SelectItem value="" class="text-slate-500">无分类</SelectItem>
          <SelectItem
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            class="font-medium text-slate-700 transition-colors hover:bg-sky-50"
          >
            {{ category.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Tag Selection -->
    <div class="group space-y-2.5">
      <Label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-400 to-violet-600 text-xs text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </span>
        标签
      </Label>

      <!-- Selected Tags Display -->
      <div class="flex min-h-[60px] flex-wrap gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-slate-100/50 p-3 shadow-inner transition-all focus-within:border-violet-300 focus-within:shadow-md">
        <Badge
          v-for="tag in selectedTags"
          :key="tag.id"
          variant="secondary"
          class="group/badge inline-flex cursor-pointer items-center gap-1.5 bg-gradient-to-r from-violet-100 to-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 transition-all hover:from-violet-200 hover:to-violet-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          :class="{ 'opacity-60': readonly }"
          @click="!readonly && removeTag(tag.id)"
        >
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-violet-400"></span>
          {{ tag.name }}
          <X v-if="!readonly" class="ml-0.5 h-3.5 w-3.5 opacity-60 transition-opacity group-hover/badge:opacity-100" />
        </Badge>
        <span v-if="selectedTags.length === 0" class="flex items-center text-sm text-slate-400">
          <span class="mr-2 text-lg">🏷️</span>
          暂无标签，请添加
        </span>
      </div>

      <!-- Tag Input -->
      <div class="flex gap-2">
        <Select
          v-if="!isCreatingTag"
          :disabled="readonly"
          @update:model-value="handleTagSelect"
        >
          <SelectTrigger class="h-11 flex-1 border-slate-200 bg-white transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm">
            <SelectValue placeholder="选择标签" />
          </SelectTrigger>
          <SelectContent class="border-slate-200 shadow-lg">
            <SelectItem
              v-for="tag in tags"
              :key="tag.id"
              :value="tag.id"
              :disabled="isTagSelected(tag.id)"
              class="transition-colors hover:bg-violet-50"
            >
              {{ tag.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          v-else
          ref="tagInputRef"
          v-model="selectedTagInput"
          placeholder="输入标签名称"
          class="h-11 flex-1 border-slate-200 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
          @keyup.enter="handleCreateTag"
          @keydown.escape="isCreatingTag = false"
        />

        <Button
          v-if="!isCreatingTag && !readonly"
          type="button"
          variant="outline"
          size="icon"
          class="h-11 w-11 border-slate-200 bg-white transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-500"
          @click="isCreatingTag = true"
          title="创建新标签"
        >
          <Plus class="h-5 w-5" />
        </Button>
        <Button
          v-else-if="isCreatingTag"
          type="button"
          size="default"
          class="h-11 bg-gradient-to-r from-violet-500 to-violet-600 font-medium text-white shadow-md transition-all hover:from-violet-600 hover:to-violet-700 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-violet-500"
          @click="handleCreateTag"
        >
          添加
        </Button>
      </div>

      <p class="flex items-center gap-1.5 text-xs text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        点击已添加的标签可移除，或点击 + 号创建新标签
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'

const tagInputRef = ref<HTMLInputElement>()
</script>
