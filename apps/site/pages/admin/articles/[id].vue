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
      v-else-if="article"
      mode="edit"
      :initial-data="article"
      @saved="navigateTo('/admin/articles')"
    />
  </div>
</template>
