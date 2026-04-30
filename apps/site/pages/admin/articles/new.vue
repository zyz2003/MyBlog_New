<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <AdminArticlesArticleEditor mode="create" @saved="navigateTo('/admin/articles')" />
</template>
