<script setup lang="ts">
interface ColorOption {
  key: string
  label: string
}

const props = defineProps<{
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const colorOptions: ColorOption[] = [
  { key: 'primary', label: '主色' },
  { key: 'secondary', label: '次要' },
  { key: 'accent', label: '强调' },
  { key: 'background', label: '背景' },
  { key: 'surface', label: '卡片' },
  { key: 'text', label: '文字' },
  { key: 'textMuted', label: '辅助文字' },
]

function updateColor(key: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="option in colorOptions"
      :key="option.key"
      class="flex items-center gap-3"
    >
      <label class="text-sm text-gray-600 w-16">{{ option.label }}</label>
      <div class="relative">
        <input
          type="color"
          :value="modelValue[option.key] || '#000000'"
          class="w-8 h-8 rounded cursor-pointer border-0"
          @input="updateColor(option.key, ($event.target as HTMLInputElement).value)"
        >
      </div>
      <input
        type="text"
        :value="modelValue[option.key] || '#000000'"
        class="w-24 px-2 py-1 text-xs font-mono border rounded text-center"
        @input="updateColor(option.key, ($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>
