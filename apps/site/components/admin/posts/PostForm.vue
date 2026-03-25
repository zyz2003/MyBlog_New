<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import SimpleEditor from './SimpleEditor.vue'
import CategoryTagSelector from './CategoryTagSelector.vue'
import CoverImageUploader from './CoverImageUploader.vue'

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

interface PostForm {
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  status: 'draft' | 'published' | 'archived' | 'reviewing'
  categoryId: string | null
  tagIds: string[]
}

interface Props {
  modelValue: PostForm
  categories?: Category[]
  tags?: Tag[]
  readonly?: boolean
  errors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  tags: () => [],
  readonly: false,
  errors: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: PostForm]
  'create-tag': [name: string]
}>()

// Local form state
const form = ref<PostForm>({ ...props.modelValue })

// Sync with parent
watch(
  () => props.modelValue,
  (newVal) => {
    form.value = { ...newVal }
  },
  { deep: true }
)

// Update parent on local changes
watch(
  form,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

// Generate slug from title
function generateSlug() {
  if (!form.value.title) return
  const slug = form.value.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  form.value.slug = slug
}

// Handle category/tag change
function handleCategoryTagChange(value: { categoryId?: string | null; tagIds?: string[] }) {
  if (value.categoryId !== undefined) {
    form.value.categoryId = value.categoryId
  }
  if (value.tagIds !== undefined) {
    form.value.tagIds = value.tagIds
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Main Content Card -->
    <Card class="overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader class="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-slate-100/50">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <div>
            <CardTitle class="text-lg font-semibold text-slate-800">基本信息</CardTitle>
            <CardDescription class="text-sm text-slate-500">填写文章的标题、Slug 和正文内容</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-5 p-5">
        <!-- Title -->
        <div class="group space-y-2">
          <Label for="title" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-400 to-violet-600 text-xs text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="MM5 13l4 4L19 7" />
              </svg>
            </span>
            标题
            <span class="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="输入文章标题"
            :readonly="readonly"
            class="h-11 border-slate-200 bg-white transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
            :class="{ 'border-red-500 focus:ring-red-500/20': errors.title }"
          />
          <p v-if="errors.title" class="flex items-center gap-1.5 text-sm text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.title }}
          </p>
        </div>

        <!-- Slug -->
        <div class="group space-y-2">
          <div class="flex items-center justify-between">
            <Label for="slug" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-xs text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              Slug
              <span class="text-red-500">*</span>
            </Label>
            <Button
              v-if="!readonly"
              type="button"
              variant="outline"
              size="sm"
              class="h-8 border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-500"
              @click="generateSlug"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              从标题生成
            </Button>
          </div>
          <Input
            id="slug"
            v-model="form.slug"
            placeholder="article-url-slug"
            :readonly="readonly"
            class="h-11 border-slate-200 bg-white font-mono text-sm transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
            :class="{ 'border-red-500 focus:ring-red-500/20': errors.slug }"
          />
          <p v-if="errors.slug" class="flex items-center gap-1.5 text-sm text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.slug }}
          </p>
        </div>

        <!-- Excerpt -->
        <div class="group space-y-2">
          <Label for="excerpt" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </span>
            摘要
          </Label>
          <Textarea
            id="excerpt"
            v-model="form.excerpt"
            placeholder="文章摘要，用于列表页显示"
            :readonly="readonly"
            rows="3"
            class="border-slate-200 bg-white transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
          />
        </div>

        <!-- Content -->
        <div class="group space-y-2">
          <Label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-indigo-600 text-xs text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            正文内容
            <span class="text-red-500">*</span>
          </Label>
          <SimpleEditor
            v-model="form.content"
            placeholder="使用 Markdown 语法编写文章内容"
            :readonly="readonly"
          />
          <p v-if="errors.content" class="flex items-center gap-1.5 text-sm text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.content }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Settings Card -->
    <Card class="overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader class="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-slate-100/50">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <CardTitle class="text-lg font-semibold text-slate-800">文章设置</CardTitle>
            <CardDescription class="text-sm text-slate-500">配置文章的分类、标签、状态等属性</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6 p-5">
        <!-- Category & Tags -->
        <CategoryTagSelector
          :model-value="{
            categoryId: form.categoryId,
            tagIds: form.tagIds,
          }"
          :categories="categories"
          :tags="tags"
          :readonly="readonly"
          @update:model-value="handleCategoryTagChange"
          @create-tag="$emit('create-tag', $event)"
        />

        <Separator class="bg-slate-200" />

        <!-- Status -->
        <div class="group space-y-2">
          <Label for="status" class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-rose-400 to-rose-600 text-xs text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            状态
          </Label>
          <Select v-model="form.status" :disabled="readonly">
            <SelectTrigger class="h-11 border-slate-200 bg-white transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="border-slate-200 shadow-lg">
              <SelectItem value="draft" class="hover:bg-slate-50">草稿</SelectItem>
              <SelectItem value="published" class="hover:bg-emerald-50">已发布</SelectItem>
              <SelectItem value="reviewing" class="hover:bg-amber-50">审核中</SelectItem>
              <SelectItem value="archived" class="hover:bg-slate-50">已归档</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator class="bg-slate-200" />

        <!-- Cover Image -->
        <CoverImageUploader
          v-model="form.coverImage"
          :readonly="readonly"
        />

        <Separator class="bg-slate-200" />

        <!-- SEO Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200 p-4">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-semibold text-sky-900">
                SEO 设置
              </h3>
              <p class="text-xs text-sky-600">
                优化搜索引擎显示的标题和描述
              </p>
            </div>
          </div>

          <div class="group space-y-2">
            <Label for="seoTitle" class="text-sm font-semibold text-slate-700">SEO 标题</Label>
            <Input
              id="seoTitle"
              v-model="form.seoTitle"
              placeholder="搜索引擎显示的标题（可选）"
              :readonly="readonly"
              class="h-11 border-slate-200 bg-white transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
            />
          </div>

          <div class="group space-y-2">
            <Label for="seoDescription" class="text-sm font-semibold text-slate-700">SEO 描述</Label>
            <Textarea
              id="seoDescription"
              v-model="form.seoDescription"
              placeholder="搜索引擎显示的描述（可选）"
              :readonly="readonly"
              rows="3"
              class="border-slate-200 bg-white transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-0 hover:border-slate-300 hover:shadow-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
