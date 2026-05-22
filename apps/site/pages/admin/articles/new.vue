<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const api = useAdminApi()

async function handleSave(data: Record<string, unknown>) {
  const payload = { ...data }
  if (payload.categoryId !== undefined) {
    payload.categoryIds = payload.categoryId ? [Number(payload.categoryId)] : []
    payload.primaryCategoryId = payload.categoryId ? Number(payload.categoryId) : undefined
    delete payload.categoryId
  }
  await api.post('/api/articles', payload)
  navigateTo('/admin/articles')
}
</script>

<template>
  <AdminArticlesArticleEditor
    @save="handleSave"
    @cancel="navigateTo('/admin/articles')"
  />
</template>
