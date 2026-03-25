<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  rows?: number
  delay?: number
  skeleton?: boolean
  containerClass?: string
}>()
</script>

<template>
  <div :class="cn('animate-fade-in', containerClass)">
    <div
      v-for="i in rows || 1"
      :key="i"
      class="mb-2 h-4 w-full rounded bg-muted"
      :style="{
        animationDelay: `${(i - 1) * (delay || 100)}ms`,
        height: skeleton ? '120px' : '16px',
      }"
      :class="cn('animate-pulse', skeleton ? 'rounded-lg' : '')"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
