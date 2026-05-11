<script setup lang="ts">
import PluginRenderer from '~/components/plugins/PluginRenderer.vue'

defineProps<{ postId?: string }>()
</script>

<template>
  <PluginRenderer mount-point="post-end" :post-id="postId" />
</template>
