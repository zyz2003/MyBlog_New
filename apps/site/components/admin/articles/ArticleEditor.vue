<script setup lang="ts">
import type { ArticleWithRelations, ArticleCreateInput, ArticleUpdateInput } from '~/server/services/article.service'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: ArticleWithRelations
}>()

const emit = defineEmits<{
  saved: [article: ArticleWithRelations]
}>()

const api = useAdminApi()

// Form state
const title = ref(props.initialData?.title || '')
const slug = ref(props.initialData?.slug || '')
const content = ref(props.initialData?.content || '')
const excerpt = ref(props.initialData?.excerpt || '')
const status = ref<'draft' | 'published' | 'scheduled'>(props.initialData?.status as 'draft' | 'published' | 'scheduled' || 'draft')
const categoryId = ref<number | null>(
  props.initialData?.categories?.find(c => c.isPrimary)?.id
    || props.initialData?.categories?.[0]?.id
    || null,
)
const tagIds = ref<number[]>(
  props.initialData?.tags?.map(t => t.id) || [],
)
const scheduledAt = ref(
  props.initialData?.scheduledAt
    ? new Date(props.initialData.scheduledAt).toISOString().slice(0, 16)
    : '',
)
const saving = ref(false)
const error = ref('')

// Vditor instance
const vditorInstance = ref<any>(null)
const editorContainerId = 'vditor-editor'

// Auto-generate slug from date+ID (called after save)
function generateSlugFromDateId(id: number, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}/${month}/${id}`
}

// Initialize Vditor on client side
onMounted(async () => {
  if (!import.meta.client) return

  try {
    const Vditor = (await import('vditor')).default
    await import('vditor/dist/index.css')

    vditorInstance.value = new Vditor(editorContainerId, {
      mode: 'ir',
      theme: 'classic',
      toolbar: [
        'emoji', 'headings', 'bold', 'italic', 'strike', '|',
        'line', 'quote', 'list', 'ordered-list', 'check', '|',
        'code', 'inline-code', 'table', '|',
        'link', 'upload', '|',
        'undo', 'redo', '|',
        'edit-mode', 'fullscreen', 'preview',
      ],
      cache: { enable: false },
      minHeight: 500,
      after: () => {
        if (props.initialData?.content) {
          vditorInstance.value?.setValue(props.initialData.content)
        }
      },
    })
  }
  catch (e) {
    console.error('Failed to initialize Vditor:', e)
  }
})

// Destroy Vditor on unmount
onUnmounted(() => {
  vditorInstance.value?.destroy()
})

// Save article
async function save(publishStatus?: 'draft' | 'published' | 'scheduled') {
  const finalStatus = publishStatus || status.value
  saving.value = true
  error.value = ''

  try {
    const vditorContent = vditorInstance.value?.getValue() || content.value

    if (props.mode === 'create') {
      const input: ArticleCreateInput = {
        title: title.value,
        slug: slug.value || undefined, // Will be auto-generated if empty
        content: vditorContent,
        excerpt: excerpt.value || undefined,
        status: finalStatus,
        categoryIds: categoryId.value ? [categoryId.value] : undefined,
        primaryCategoryId: categoryId.value || undefined,
        tagIds: tagIds.value.length > 0 ? tagIds.value : undefined,
        scheduledAt: finalStatus === 'scheduled' && scheduledAt.value ? new Date(scheduledAt.value) : undefined,
      }

      const article = await api.post<ArticleWithRelations>('/api/articles', input)

      // Auto-generate slug if empty (date+ID format)
      if (!slug.value && article.id) {
        const now = new Date()
        const autoSlug = generateSlugFromDateId(article.id, now)
        await api.put(`/api/articles/${article.id}`, { slug: autoSlug })
        article.slug = autoSlug
      }

      emit('saved', article)
    }
    else {
      const input: ArticleUpdateInput = {
        title: title.value,
        slug: slug.value,
        content: vditorContent,
        excerpt: excerpt.value || undefined,
        status: finalStatus,
        categoryIds: categoryId.value ? [categoryId.value] : [],
        primaryCategoryId: categoryId.value || undefined,
        tagIds: tagIds.value,
        scheduledAt: finalStatus === 'scheduled' && scheduledAt.value ? new Date(scheduledAt.value) : null,
      }

      const article = await api.put<ArticleWithRelations>(`/api/articles/${props.initialData?.id}`, input)
      emit('saved', article)
    }

    await navigateTo('/admin/articles')
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '保存文章失败'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header with save buttons -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ mode === 'create' ? '新建文章' : '编辑文章' }}
      </h1>
      <div class="flex items-center gap-3">
        <button
          class="btn-secondary"
          :disabled="saving"
          @click="save('draft')"
        >
          保存草稿
        </button>
        <button
          v-if="status !== 'scheduled'"
          class="btn-primary"
          :disabled="saving"
          @click="save('published')"
        >
          {{ saving ? '发布中...' : '发布' }}
        </button>
        <button
          v-else
          class="btn-primary"
          :disabled="saving"
          @click="save('scheduled')"
        >
          {{ saving ? '定时中...' : '定时发布' }}
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- Split layout: editor + metadata -->
    <div class="flex gap-6">
      <!-- Left: Vditor editor (70%) -->
      <div class="flex-[7] min-w-0">
        <div class="card p-0 overflow-hidden">
          <div :id="editorContainerId" class="min-h-[500px]" />
        </div>
      </div>

      <!-- Right: Metadata panel (30%) -->
      <div class="flex-[3] space-y-4">
        <!-- Title -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="请输入文章标题"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
        </div>

        <!-- Category -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <AdminArticlesCategorySelector v-model="categoryId" />
        </div>

        <!-- Tags -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">标签</label>
          <AdminArticlesTagInput v-model="tagIds" />
        </div>

        <!-- Status -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            v-model="status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="scheduled">定时发布</option>
          </select>
        </div>

        <!-- Scheduled date (only when status = scheduled) -->
        <div v-if="status === 'scheduled'" class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">定时日期</label>
          <input
            v-model="scheduledAt"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
        </div>

        <!-- Excerpt -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-1">摘要</label>
          <textarea
            v-model="excerpt"
            rows="3"
            placeholder="请输入文章摘要..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
