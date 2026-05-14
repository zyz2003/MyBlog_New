<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})
</script>

<template>
  <NuxtPage />
</template>