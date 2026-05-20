<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})
</script>

<template>
  <AdminArticlesArticleEditor mode="create" @saved="navigateTo('/admin/articles')" />
</template>
