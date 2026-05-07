<script setup lang="ts">
interface FontOption {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const fontOptions: FontOption[] = [
  { label: '系统默认', value: 'system-ui, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Noto Sans SC', value: '"Noto Sans SC", sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
]

function updateFont(key: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <label class="text-sm text-gray-600 w-16">标题</label>
      <select
        :value="modelValue.heading"
        class="flex-1 px-3 py-2 text-sm border rounded"
        @change="updateFont('heading', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="f in fontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
      </select>
    </div>
    <div class="flex items-center gap-3">
      <label class="text-sm text-gray-600 w-16">正文</label>
      <select
        :value="modelValue.body"
        class="flex-1 px-3 py-2 text-sm border rounded"
        @change="updateFont('body', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="f in fontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
      </select>
    </div>
    <div class="flex items-center gap-3">
      <label class="text-sm text-gray-600 w-16">代码</label>
      <select
        :value="modelValue.mono"
        class="flex-1 px-3 py-2 text-sm border rounded"
        @change="updateFont('mono', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="f in fontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
      </select>
    </div>
  </div>
</template>
