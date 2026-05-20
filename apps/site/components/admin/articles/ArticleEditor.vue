<script setup lang="ts">
import type { ArticleCreateInput, ArticleUpdateInput, ArticleWithRelations } from '~/server/services/article.service'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: ArticleWithRelations
}>()

const emit = defineEmits<{
  saved: [article: ArticleWithRelations]
}>()

const api = useAdminApi()

const title = ref(props.initialData?.title || '')
const slug = ref(props.initialData?.slug || '')
const content = ref(props.initialData?.content || '')
const excerpt = ref(props.initialData?.excerpt || '')
const status = ref<'draft' | 'published' | 'scheduled'>(props.initialData?.status as 'draft' | 'published' | 'scheduled' || 'draft')
const categoryId = ref<number | null>(
  props.initialData?.categories?.find(category => category.isPrimary)?.id
    || props.initialData?.categories?.[0]?.id
    || null,
)
const tagIds = ref<number[]>(props.initialData?.tags?.map(tag => tag.id) || [])
const scheduledAt = ref(
  props.initialData?.scheduledAt
    ? new Date(props.initialData.scheduledAt).toISOString().slice(0, 16)
    : '',
)
const saving = ref(false)
const error = ref('')

const vditorInstance = ref<any>(null)
const editorContainerId = 'vditor-editor'

const currentStatusLabel = computed(() => {
  if (status.value === 'published') return '已发布'
  if (status.value === 'scheduled') return '定时发布'
  return '草稿'
})

function generateSlugFromDateId(id: number, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}/${month}/${id}`
}

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
      minHeight: 560,
      after: () => {
        if (props.initialData?.content)
          vditorInstance.value?.setValue(props.initialData.content)
      },
    })
  }
  catch (e) {
    console.error('Failed to initialize Vditor:', e)
  }
})

onUnmounted(() => {
  vditorInstance.value?.destroy()
})

async function saveArticle(publishStatus?: 'draft' | 'published' | 'scheduled') {
  const finalStatus = publishStatus || status.value
  saving.value = true
  error.value = ''

  try {
    const vditorContent = vditorInstance.value?.getValue() || content.value

    if (props.mode === 'create') {
      const input: ArticleCreateInput = {
        title: title.value,
        slug: slug.value || title.value.trim() || `${Date.now()}`,
        content: vditorContent,
        status: finalStatus,
        ...(excerpt.value ? { excerpt: excerpt.value } : {}),
        ...(categoryId.value ? { categoryIds: [categoryId.value], primaryCategoryId: categoryId.value } : {}),
        ...(tagIds.value.length > 0 ? { tagIds: tagIds.value } : {}),
        ...(finalStatus === 'scheduled' && scheduledAt.value ? { scheduledAt: new Date(scheduledAt.value) } : {}),
      }

      const article = await api.post<ArticleWithRelations>('/api/articles', input)

      if (!slug.value && article.id) {
        const autoSlug = generateSlugFromDateId(article.id, new Date())
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
        status: finalStatus,
        tagIds: tagIds.value,
        scheduledAt: finalStatus === 'scheduled' && scheduledAt.value ? new Date(scheduledAt.value) : null,
        ...(excerpt.value ? { excerpt: excerpt.value } : {}),
        ...(categoryId.value ? { categoryIds: [categoryId.value], primaryCategoryId: categoryId.value } : { categoryIds: [] }),
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
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-3">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Articles</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-text">
              {{ mode === 'create' ? '新建文章' : '编辑文章' }}
            </h2>
          </div>
          <p class="max-w-3xl text-sm leading-7 text-muted">
            这个页面只保留实际写作和发布需要的内容：标题、正文、发布状态、分类标签和摘要。减少无关展示，让写作流程更稳定直接。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <span class="inline-flex rounded-full bg-background/80 px-3 py-2 text-xs font-semibold text-muted">
            当前状态：{{ currentStatusLabel }}
          </span>
          <button
            class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary disabled:opacity-50"
            :disabled="saving"
            @click="saveArticle('draft')"
          >
            {{ saving && status === 'draft' ? '保存中...' : '保存草稿' }}
          </button>
          <button
            v-if="status !== 'scheduled'"
            class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            :disabled="saving"
            @click="saveArticle('published')"
          >
            {{ saving ? '发布中...' : '发布文章' }}
          </button>
          <button
            v-else
            class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            :disabled="saving"
            @click="saveArticle('scheduled')"
          >
            {{ saving ? '提交中...' : '定时发布' }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ error }}
    </div>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
      <div class="space-y-5">
        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <label class="mb-3 block text-sm font-semibold text-text">文章标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="输入文章标题"
            class="w-full rounded-3xl border border-border bg-background/80 px-5 py-4 text-2xl font-black tracking-tight text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-4 shadow-sm">
          <div :id="editorContainerId" class="min-h-[560px]" />
        </section>
      </div>

      <div class="space-y-5">
        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h3 class="text-lg font-black text-text">发布设置</h3>
          <div class="mt-5 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-text">Slug</label>
              <input
                v-model="slug"
                type="text"
                placeholder="可留空，创建后自动生成"
                class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-text">发布状态</label>
              <select
                v-model="status"
                class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="scheduled">定时发布</option>
              </select>
            </div>

            <div v-if="status === 'scheduled'">
              <label class="mb-2 block text-sm font-medium text-text">发布时间</label>
              <input
                v-model="scheduledAt"
                type="datetime-local"
                class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h3 class="text-lg font-black text-text">归档信息</h3>
          <div class="mt-5 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-text">主分类</label>
              <AdminArticlesCategorySelector v-model="categoryId" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-text">标签</label>
              <AdminArticlesTagInput v-model="tagIds" />
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h3 class="text-lg font-black text-text">摘要</h3>
          <textarea
            v-model="excerpt"
            rows="6"
            placeholder="用于列表摘要、SEO 描述或首页简介"
            class="mt-5 w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </section>
      </div>
    </section>
  </div>
</template>
