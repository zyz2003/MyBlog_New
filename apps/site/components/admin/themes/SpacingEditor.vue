<script setup lang="ts">
const props = defineProps<{
  spacing: Record<string, number>
  borderRadius: Record<string, number>
}>()

const emit = defineEmits<{
  'update:spacing': [value: Record<string, number>]
  'update:border-radius': [value: Record<string, number>]
}>()

const spacingOptions = [
  { key: 'unit', label: '基础间距', min: 4, max: 32 },
  { key: 'containerMax', label: '容器宽度', min: 640, max: 1440 },
  { key: 'contentPadding', label: '内容内边距', min: 8, max: 64 },
]

const radiusOptions = [
  { key: 'small', label: '小圆角', min: 0, max: 12 },
  { key: 'medium', label: '中圆角', min: 0, max: 24 },
  { key: 'large', label: '大圆角', min: 0, max: 48 },
]

function updateSpacing(key: string, value: number) {
  emit('update:spacing', {
    ...props.spacing,
    [key]: value,
  })
}

function updateRadius(key: string, value: number) {
  emit('update:border-radius', {
    ...props.borderRadius,
    [key]: value,
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Spacing -->
    <div v-for="opt in spacingOptions" :key="opt.key" class="flex items-center gap-3">
      <label class="text-sm text-gray-600 w-20">{{ opt.label }}</label>
      <input
        type="range"
        :min="opt.min"
        :max="opt.max"
        :value="spacing[opt.key]"
        class="flex-1"
        @input="updateSpacing(opt.key, Number(($event.target as HTMLInputElement).value))"
      >
      <input
        type="number"
        :value="spacing[opt.key]"
        class="w-16 px-2 py-1 text-xs border rounded text-center"
        @input="updateSpacing(opt.key, Number(($event.target as HTMLInputElement).value))"
      >
      <span class="text-xs text-gray-400 w-6">px</span>
    </div>

    <!-- Border Radius -->
    <div v-for="opt in radiusOptions" :key="opt.key" class="flex items-center gap-3">
      <label class="text-sm text-gray-600 w-20">{{ opt.label }}</label>
      <input
        type="range"
        :min="opt.min"
        :max="opt.max"
        :value="borderRadius[opt.key]"
        class="flex-1"
        @input="updateRadius(opt.key, Number(($event.target as HTMLInputElement).value))"
      >
      <input
        type="number"
        :value="borderRadius[opt.key]"
        class="w-16 px-2 py-1 text-xs border rounded text-center"
        @input="updateRadius(opt.key, Number(($event.target as HTMLInputElement).value))"
      >
      <span class="text-xs text-gray-400 w-6">px</span>
    </div>
  </div>
</template>
