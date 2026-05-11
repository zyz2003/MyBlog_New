<script setup lang="ts">
import { computed } from 'vue'
import PluginMount from './PluginMount.vue'

interface EnabledPlugin {
  name: string
  mountPoints: string[]
  config: Record<string, unknown>
  scriptUrl?: string
  scriptContent?: string
  hasOnMount?: boolean
}

const props = defineProps<{
  mountPoint: string
  postId?: string
}>()

// Fetch enabled plugins from API
const { data } = await useFetch<{ code: number; data: EnabledPlugin[] }>('/api/plugins/enabled')

// Filter plugins for this mount point
const mountPlugins = computed(() => {
  const plugins = data.value?.data ?? []
  return plugins.filter((p) => p.mountPoints.includes(props.mountPoint))
})
</script>

<template>
  <div :data-mount-point="mountPoint" class="plugin-renderer">
    <PluginMount
      v-for="plugin in mountPlugins"
      :key="plugin.name"
      :plugin-name="plugin.name"
      :script-url="plugin.scriptUrl"
      :script-content="plugin.scriptContent"
      :config="plugin.config"
    />
  </div>
</template>
