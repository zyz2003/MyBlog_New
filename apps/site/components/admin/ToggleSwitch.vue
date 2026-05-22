<template>
  <button
    type="button"
    :class="modelValue ? 'border-primary/30 bg-primary/8' : 'border-border bg-background/70'"
    class="flex items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:border-primary/20"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span v-if="label" class="text-sm text-text">{{ label }}</span>
    <slot v-else />
    <span
      class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition"
      :class="modelValue ? 'bg-primary' : 'bg-surface-2'"
    >
      <span
        class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
