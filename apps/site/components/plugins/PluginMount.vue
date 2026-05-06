<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  pluginName: string
  scriptUrl?: string
  config: Record<string, unknown>
}>()

const scriptContainer = ref<HTMLElement | null>(null)
let scriptElement: HTMLScriptElement | null = null

onMounted(() => {
  if (props.scriptUrl && scriptContainer.value) {
    // Inject config before script loads
    ;(window as Record<string, unknown>).__PLUGIN_CONFIG__ = props.config

    scriptElement = document.createElement('script')
    scriptElement.src = props.scriptUrl
    scriptElement.async = true
    scriptContainer.value.appendChild(scriptElement)
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
  <div :data-plugin="pluginName" class="plugin-mount">
    <ClientOnly>
      <div ref="scriptContainer" class="plugin-script-container" />
    </ClientOnly>
  </div>
</template>
