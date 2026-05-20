<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})
</script>

<template>
  <AdminPagesPageEditor mode="create" @saved="navigateTo('/admin/pages')" />
</template>
