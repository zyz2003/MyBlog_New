<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

// Theme management is under development
const isUnderDevelopment = true
</script>

<template>
  <div>
    <!-- Under Development Notice -->
    <div v-if="isUnderDevelopment" class="flex flex-col items-center justify-center py-24">
      <div class="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-6">
        <span class="i-heroicons-cog-6-tooth w-12 h-12 text-muted" />
      </div>
      <h2 class="text-2xl font-bold text-text mb-2">主题管理</h2>
      <p class="text-muted mb-8">主题切换功能正在开发中，敬请期待</p>
      <div class="px-4 py-2 bg-surface border border-border rounded-lg text-muted text-sm">
        <span class="i-heroicons-clock w-4 h-4 inline-block mr-1" />
        预计在后续版本中开放
      </div>
    </div>
  </div>
</template>
