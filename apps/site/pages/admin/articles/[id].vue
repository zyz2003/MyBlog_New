<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

definePageMeta({
  layout: 'admin',
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
    error.value = e instanceof Error ? e.message : 'Failed to load article'
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
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="i-heroicons-arrow-path w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-20">
      <span class="i-heroicons-exclamation-triangle w-16 h-16 mx-auto text-red-400 block mb-4" />
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <NuxtLink to="/admin/articles" class="btn-primary">
        Back to Articles
      </NuxtLink>
    </div>

    <!-- Editor -->
    <AdminArticlesArticleEditor
      v-else-if="article"
      mode="edit"
      :initial-data="article"
      @saved="navigateTo('/admin/articles')"
    />
  </div>
</template>
