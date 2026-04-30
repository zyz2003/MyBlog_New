<script setup lang="ts">
import PluginRenderer from './PluginRenderer.vue'

defineProps<{ postId?: string }>()
</script>

<template>
  <PluginRenderer mount-point="post-end" :post-id="postId" />
</template>
