<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: 'var(--anzhiyu-main)',
})

const spinnerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderTopColor: props.color,
}))
</script>

<template>
  <div class="spinner-icon" :style="spinnerStyle" />
</template>

<style scoped>
.spinner-icon {
  border-width: 2px;
  border-style: solid;
  border-top-color: var(--anzhiyu-main);
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-icon {
    animation-duration: 2s;
  }
}
</style>
