<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, FormControl } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'file'
  | 'email'
  | 'password'

export interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    modelValue: unknown
    label: string
    type?: FieldType
    description?: string
    placeholder?: string
    options?: SelectOption[]
    accept?: string
    previewUrl?: string
    error?: string
    disabled?: boolean
    required?: boolean
    showRemove?: boolean
    rows?: number
  }>(),
  {
    type: 'text',
    rows: 3,
    description: undefined,
    placeholder: undefined,
    options: undefined,
    accept: undefined,
    previewUrl: undefined,
    error: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  remove: []
  fileChange: [file: File]
}>()

const showPreview = computed(() => {
  return props.type === 'file' && props.previewUrl
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileChange', file)
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <Label :class="{ 'text-destructive': required && !modelValue }">
        {{ label }}
      </Label>
      <span v-if="required" class="text-destructive">*</span>
    </div>

    <!-- 文件上传 -->
    <template v-if="type === 'file'">
      <div class="flex items-start gap-4">
        <div v-if="showPreview" class="relative group">
          <img :src="previewUrl" :alt="label" class="w-20 h-20 object-cover rounded-lg border" />
          <Button
            v-if="showRemove"
            variant="destructive"
            size="icon"
            class="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            @click="emit('remove')"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>

        <div class="flex-1">
          <Input type="file" :accept="accept" :disabled="disabled" @change="handleFileChange" />
          <p class="text-xs text-muted-foreground mt-1">支持 JPG, PNG 格式，最大 2MB</p>
        </div>
      </div>
    </template>

    <!-- Switch -->
    <template v-else-if="type === 'boolean'">
      <Switch
        :model-value="modelValue"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>

    <!-- Textarea -->
    <template v-else-if="type === 'textarea'">
      <Textarea
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="{ 'border-destructive': error }"
        :rows="rows"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>

    <!-- Select -->
    <template v-else-if="type === 'select'">
      <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <FormControl>
          <select class="w-full rounded-md border p-2" :disabled="disabled">
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </FormControl>
      </Select>
    </template>

    <!-- 其他输入类型 -->
    <template v-else>
      <Input
        :type="type"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="{ 'border-destructive': error }"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>

    <!-- 帮助文本 -->
    <p v-if="description && !error" class="text-sm text-muted-foreground">
      {{ description }}
    </p>

    <!-- 错误信息 -->
    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>
