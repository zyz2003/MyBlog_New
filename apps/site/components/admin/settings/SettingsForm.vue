<script setup lang="ts">
interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean'
  placeholder?: string
  min?: number
  max?: number
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
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>

      <!-- Text input -->
      <input
        v-if="field.type === 'text'"
        type="text"
        :value="(modelValue[field.key] as string) || ''"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :value="(modelValue[field.key] as string) || ''"
        :placeholder="field.placeholder"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        @input="updateField(field.key, ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- Number input -->
      <input
        v-else-if="field.type === 'number'"
        type="number"
        :value="(modelValue[field.key] as number) ?? 0"
        :min="field.min"
        :max="field.max"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        @input="updateField(field.key, Number(($event.target as HTMLInputElement).value))"
      />

      <!-- Boolean toggle -->
      <div v-else-if="field.type === 'boolean'" class="flex items-center gap-3">
        <button
          type="button"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="modelValue[field.key] ? 'bg-primary' : 'bg-gray-300'"
          @click="updateField(field.key, !modelValue[field.key])"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="modelValue[field.key] ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
        <span class="text-sm text-gray-500">{{ modelValue[field.key] ? 'Enabled' : 'Disabled' }}</span>
      </div>
    </div>
  </div>
</template>
