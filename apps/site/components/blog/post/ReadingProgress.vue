<script setup lang="ts">
/**
 * ReadingProgress - Fixed progress bar below navbar showing scroll progress.
 * Uses requestAnimationFrame for smooth, performant scroll tracking.
 */
const progress = ref(0)
let rafId: number | null = null

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0
  rafId = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  rafId = requestAnimationFrame(updateProgress)
})

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})
</script>

<template>
  <div
    class="reading-progress"
    :style="{ width: `${progress}%` }"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Reading progress"
  />
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 60px;
  left: 0;
  height: 3px;
  background: var(--anzhiyu-reading-progress-color, var(--anzhiyu-main));
  z-index: 999;
  transition: width 0.1s linear;
  will-change: width;
  border-radius: 0 2px 2px 0;
}
</style>
