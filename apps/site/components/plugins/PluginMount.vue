<script setup lang="ts">
import { defineAsyncComponent, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  pluginName: string
  componentPath?: string
  scriptUrl?: string
  config: Record<string, unknown>
}>()

const scriptContainer = ref<HTMLElement | null>(null)
let scriptElement: HTMLScriptElement | null = null

// Lazy-load Vue component if componentPath is provided
const PluginComponent = props.componentPath
  ? defineAsyncComponent(() => import(/* @vite-ignore */ props.componentPath!))
  : null

// Handle script injection for non-component plugins
onMounted(() => {
  if (props.scriptUrl && scriptContainer.value) {
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
    <!-- Component-based plugin (SSR safe) -->
    <Suspense v-if="PluginComponent">
      <component :is="PluginComponent" :config="config" />
      <template #fallback>
        <div class="plugin-loading" />
      </template>
    </Suspense>

    <!-- Script-injection plugin (client only) -->
    <ClientOnly v-else-if="scriptUrl">
      <div ref="scriptContainer" class="plugin-script-container" />
    </ClientOnly>
  </div>
</template>
