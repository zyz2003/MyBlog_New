<script setup lang="ts">
interface SelectOption {
  label: string
  value: string
}

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multi-select'
  placeholder?: string
  min?: number
  max?: number
  options?: SelectOption[]
}

const props = defineProps<{
  fields: FieldDef[]
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

function updateField(key: string, value: unknown) {
  const updated = { ...props.modelValue, [key]: value }
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="space-y-5">
    <div
      v-for="field in fields"
      :key="field.key"
    >
      <label class="block text-sm font-medium text-text mb-1">{{ field.label }}</label>

      <!-- Text input -->
      <input
        v-if="field.type === 'text'"
        type="text"
        :value="(modelValue[field.key] as string) || ''"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text"
        @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :value="(modelValue[field.key] as string) || ''"
        :placeholder="field.placeholder"
        rows="3"
        class="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text"
        @input="updateField(field.key, ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- Number input -->
      <input
        v-else-if="field.type === 'number'"
        type="number"
        :value="(modelValue[field.key] as number) ?? 0"
        :min="field.min"
        :max="field.max"
        class="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text"
        @input="updateField(field.key, Number(($event.target as HTMLInputElement).value))"
      />

      <!-- Boolean toggle -->
      <AdminToggleSwitch
        v-else-if="field.type === 'boolean'"
        :model-value="Boolean(modelValue[field.key])"
        @update:model-value="updateField(field.key, $event)"
        :label="field.label"
      />

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :value="(modelValue[field.key] as string) || ''"
        class="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text cursor-pointer"
        @change="updateField(field.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>请选择</option>
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Multi-select -->
      <div v-else-if="field.type === 'multi-select'" class="flex flex-wrap gap-2">
        <button
          v-for="opt in field.options"
          :key="opt.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="(modelValue[field.key] as string[])?.includes(opt.value)
            ? 'bg-primary text-white'
            : 'bg-surface-2 text-muted hover:bg-surface'"
          @click="
            updateField(field.key, (modelValue[field.key] as string[])?.includes(opt.value)
              ? (modelValue[field.key] as string[]).filter(v => v !== opt.value)
              : [...((modelValue[field.key] as string[]) || []), opt.value])
          "
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>
