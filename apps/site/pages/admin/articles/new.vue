<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})
</script>

<template>
  <AdminArticlesArticleEditor mode="create" @saved="navigateTo('/admin/articles')" />
</template>
