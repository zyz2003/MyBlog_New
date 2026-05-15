<script setup lang="ts">
const config = useRuntimeConfig()
const visible = ref(true)

onMounted(() => {
  if (document.readyState === 'complete') {
    fadeOut()
  } else {
    window.addEventListener('load', fadeOut)
  }
})

onUnmounted(() => {
  window.removeEventListener('load', fadeOut)
})

function fadeOut() {
  setTimeout(() => { visible.value = false }, 400)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      id="loading-box"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--anzhiyu-background,#fff)] transition-opacity duration-500"
      :class="visible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <div class="loading-content text-center">
        <!-- SVG spinner -->
        <div class="loading-image mb-6">
          <svg class="loading-spinner w-16 h-16 mx-auto" viewBox="0 0 50 50">
            <circle
              class="ring"
              cx="25" cy="25" r="20"
              fill="none"
              stroke="var(--anzhiyu-main, #425AEF)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="90 150"
              stroke-dashoffset="0"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <div class="loading-text text-lg font-bold text-[var(--anzhiyu-fontcolor)]">
          {{ config.public.siteName }}
        </div>
        <div class="text-sm text-[var(--anzhiyu-secondtext)] mt-2">
          加载中...
        </div>
      </div>
    </div>
  </Teleport>
</template>
