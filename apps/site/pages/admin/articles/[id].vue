<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const route = useRoute()
const api = useAdminApi()

const article = ref<ArticleWithRelations | null>(null)
const loading = ref(true)
const error = ref('')

async function fetchArticle() {
  loading.value = true
  error.value = ''
  try {
    const id = route.params.id
    article.value = await api.get<ArticleWithRelations>(`/api/articles/${id}`)
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载文章失败'
  }
  finally {
    loading.value = false
  }
}

async function handleSave(data: Record<string, unknown>) {
  const id = route.params.id
  const payload = { ...data }
  if (payload.categoryId !== undefined) {
    payload.categoryIds = payload.categoryId ? [Number(payload.categoryId)] : []
    payload.primaryCategoryId = payload.categoryId ? Number(payload.categoryId) : undefined
    delete payload.categoryId
  }
  await api.put(`/api/articles/${id}`, payload)
  navigateTo('/admin/articles')
}

// Map API response to editor's expected shape
const editorArticle = computed(() => {
  if (!article.value) return undefined
  const a = article.value
  return {
    id: a.id,
    title: a.title ?? '',
    slug: a.slug ?? '',
    content: a.content ?? '',
    excerpt: a.excerpt ?? '',
    coverImage: a.coverImage ?? '',
    status: a.status ?? 'draft',
    categoryId: a.categories?.find(c => c.isPrimary)?.id ?? a.categories?.[0]?.id ?? null,
    tagIds: a.tags?.map(t => t.id) ?? [],
    scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0, 16) : '',
    isTop: a.isTop ?? false,
    allowComment: a.allowComment ?? true,
    password: a.password ?? '',
    seoTitle: a.seoTitle ?? '',
    seoDescription: a.seoDescription ?? '',
    mainColor: a.mainColor ?? '',
    mathjax: a.mathjax ?? false,
    katex: a.katex ?? false,
    toc: a.toc ?? true,
    ai: a.ai ?? '',
    aside: a.aside ?? true,
    topImg: a.topImg ?? '',
    keywords: a.keywords ?? '',
    highlightShrink: a.highlightShrink ?? '',
    categories: a.categories,
    tags: a.tags,
  }
})

onMounted(() => {
  fetchArticle()
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-24">
      <span class="i-heroicons-arrow-path h-10 w-10 animate-spin text-primary" />
    </div>

    <div v-else-if="error" class="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
      <span class="i-heroicons-exclamation-triangle mx-auto mb-4 block h-12 w-12 text-rose-400" />
      <p class="text-sm font-medium text-rose-600">{{ error }}</p>
      <NuxtLink to="/admin/articles" class="mt-5 inline-flex rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
        返回文章列表
      </NuxtLink>
    </div>

    <AdminArticlesArticleEditor
      v-else-if="editorArticle"
      :article="editorArticle"
      @save="handleSave"
      @cancel="navigateTo('/admin/articles')"
    />
  </div>
</template>
