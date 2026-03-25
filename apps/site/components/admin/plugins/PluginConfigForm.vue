<script setup lang="ts">
import { watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Switch,
  Button,
} from '#components'
import { Settings } from 'lucide-vue-next'

export interface PluginConfigField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color'
  required?: boolean
  options?: { label: string; value: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
}

export interface Plugin {
  id: string
  name: string
  configSchema?: PluginConfigField[]
}

const props = defineProps<{
  open: boolean
  plugin: Plugin | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any> | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save: [pluginId: string, config: Record<string, any>]
}>()

// 动态生成 schema
const buildSchema = (fields: PluginConfigField[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaObj: Record<string, any> = {}
  fields.forEach((field) => {
    let validator = z.any()
    if (field.required) {
      if (field.type === 'text' || field.type === 'textarea') {
        validator = z.string().min(1, `${field.label}不能为空`)
      } else if (field.type === 'number') {
        validator = z.number()
      } else if (field.type === 'boolean') {
        validator = z.boolean()
      }
    } else {
      validator = z.any().optional()
    }
    schemaObj[field.key] = validator
  })
  return toTypedSchema(z.object(schemaObj))
}

const schema = computed(() => {
  const fields = props.plugin?.configSchema || []
  return buildSchema(fields)
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: props.config || {},
})

watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      resetForm({
        values: { ...newConfig },
      })
    }
  },
  { immediate: true }
)

const onSubmit = handleSubmit((data) => {
  if (props.plugin) {
    emit('save', props.plugin.id, data)
    emit('update:open', false)
  }
})

const renderField = (field: PluginConfigField) => {
  switch (field.type) {
    case 'textarea':
      return h(Textarea, { ...field })
    case 'boolean':
      return h(Switch, { ...field })
    case 'select':
      return h(
        'select',
        { class: 'w-full rounded-md border p-2' },
        field.options?.map((opt) => h('option', { value: opt.value }, opt.label))
      )
    case 'color':
      return h('input', { type: 'color', class: 'w-12 h-10 rounded cursor-pointer' })
    default:
      return h(Input, { ...field })
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>配置插件：{{ plugin?.name }}</DialogTitle>
      </DialogHeader>

      <form class="mt-4 space-y-4" @submit="onSubmit">
        <template v-if="plugin?.configSchema">
          <FormField
            v-for="field in plugin.configSchema"
            :key="field.key"
            v-slot="{ componentField }"
            :name="field.key"
          >
            <FormItem>
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <component
                  :is="renderField(field)"
                  v-bind="componentField"
                  :value="
                    field.type === 'boolean' ? componentField.modelValue : componentField.value
                  "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>

        <div v-else class="text-muted-foreground text-center py-8">
          <Settings class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>此插件没有可配置项</p>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            取消
          </Button>
          <Button type="submit"> 保存配置 </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
