<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  pluginName: string
  scriptUrl?: string
  scriptContent?: string
  config: Record<string, unknown>
}>()

const container = ref<HTMLElement | null>(null)
let scriptElement: HTMLScriptElement | null = null

onMounted(() => {
  if (!container.value) return

  // Inject config into window for scripts to access
  if (typeof window !== 'undefined') {
    if (!window.__PLUGIN_CONFIG__) {
      window.__PLUGIN_CONFIG__ = {}
    }
    window.__PLUGIN_CONFIG__[props.pluginName] = props.config
  }

  // If script content is provided, inject it directly
  if (props.scriptContent) {
    const script = document.createElement('script')
    script.textContent = props.scriptContent
    // Use the container as the mount point
    container.value.appendChild(script)
    return
  }

  // If script URL is provided, load external script
  if (props.scriptUrl) {
    scriptElement = document.createElement('script')
    scriptElement.src = props.scriptUrl
    scriptElement.async = true
    container.value.appendChild(scriptElement)
  }
})

onUnmounted(() => {
  if (scriptElement && scriptElement.parentNode) {
    scriptElement.parentNode.removeChild(scriptElement)
    scriptElement = null
  }
})
</script>

<template>
  <div :data-plugin="pluginName" ref="container" class="plugin-mount" />
</template>