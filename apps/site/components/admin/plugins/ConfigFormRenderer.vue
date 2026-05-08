<script setup lang="ts">
interface ConfigFieldOption {
  label: string
  value: string | number
}

interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'code' | 'textarea' | 'color' | 'image'
  label: string
  description?: string
  required?: boolean
  default?: unknown
  options?: ConfigFieldOption[]
  placeholder?: string
  language?: string
}

type ConfigSchema = Record<string, ConfigField>

const props = defineProps<{
  schema: ConfigSchema
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function updateField(key: string, value: unknown) {
  localValue.value = {
    ...localValue.value,
    [key]: value,
  }
}

const fieldTypes = {
  string: 'text',
  number: 'number',
  color: 'color',
  image: 'url',
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="(field, key) in schema"
      :key="key"
      class="space-y-2"
    >
      <!-- Label -->
      <label class="block">
        <span class="text-sm font-medium text-gray-700">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </span>
        <span v-if="field.description" class="block text-xs text-gray-500 mt-0.5">
          {{ field.description }}
        </span>
      </label>

      <!-- String input -->
      <input
        v-if="field.type === 'string'"
        type="text"
        :value="localValue[key] ?? field.default ?? ''"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        @input="updateField(key, ($event.target as HTMLInputElement).value)"
      >

      <!-- Number input -->
      <input
        v-else-if="field.type === 'number'"
        type="number"
        :value="localValue[key] ?? field.default ?? 0"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        @input="updateField(key, Number(($event.target as HTMLInputElement).value))"
      >

      <!-- Boolean toggle -->
      <label v-else-if="field.type === 'boolean'" class="flex items-center gap-3 cursor-pointer">
        <div class="relative">
          <input
            type="checkbox"
            :checked="Boolean(localValue[key] ?? field.default ?? false)"
            class="sr-only peer"
            @change="updateField(key, ($event.target as HTMLInputElement).checked)"
          >
          <div class="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
          <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow" />
        </div>
        <span class="text-sm text-gray-600">{{ localValue[key] ? '是' : '否' }}</span>
      </label>

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :value="localValue[key] ?? field.default ?? ''"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        @change="updateField(key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">请选择...</option>
        <option
          v-for="opt in field.options"
          :key="String(opt.value)"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Multi-select -->
      <div v-else-if="field.type === 'multi-select'" class="space-y-2">
        <label
          v-for="opt in field.options"
          :key="String(opt.value)"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="((localValue[key] as string[]) ?? (field.default as string[]) ?? []).includes(String(opt.value))"
            class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            @change="(e) => {
              const checked = (e.target as HTMLInputElement).checked
              const current = ((localValue[key] as string[]) ?? (field.default as string[]) ?? [])
              if (checked) {
                updateField(key, [...current, opt.value])
              } else {
                updateField(key, current.filter(v => v !== opt.value))
              }
            }"
          >
          <span class="text-sm text-gray-700">{{ opt.label }}</span>
        </label>
      </div>

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :value="String(localValue[key] ?? field.default ?? '')"
        :placeholder="field.placeholder"
        rows="4"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
        @input="updateField(key, ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- Code editor -->
      <div v-else-if="field.type === 'code'" class="space-y-2">
        <textarea
          :value="String(localValue[key] ?? field.default ?? '')"
          :placeholder="field.placeholder"
          :data-language="field.language"
          rows="8"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          @input="updateField(key, ($event.target as HTMLTextAreaElement).value)"
        />
        <p class="text-xs text-gray-400">
          语言: {{ field.language || 'javascript' }}
        </p>
      </div>

      <!-- Color picker -->
      <div v-else-if="field.type === 'color'" class="flex items-center gap-3">
        <input
          type="color"
          :value="localValue[key] ?? field.default ?? '#3B82F6'"
          class="w-10 h-10 rounded cursor-pointer border-0"
          @input="updateField(key, ($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          :value="localValue[key] ?? field.default ?? '#3B82F6'"
          class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          @input="updateField(key, ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Image URL -->
      <div v-else-if="field.type === 'image'" class="space-y-2">
        <input
          type="url"
          :value="localValue[key] ?? field.default ?? ''"
          placeholder="https://example.com/image.png"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          @input="updateField(key, ($event.target as HTMLInputElement).value)"
        >
        <div
          v-if="localValue[key]"
          class="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
        >
          <img
            :src="localValue[key] as string"
            alt="Preview"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
        </div>
      </div>
    </div>
  </div>
</template>
