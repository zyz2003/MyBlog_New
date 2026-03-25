<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useDebounceFn } from '@vueuse/core'
import type { Tag } from '@my-blog/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  open: boolean
  tag?: Tag | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      name: string
      slug: string
      description?: string
      color: string
    },
  ]
}>()

// 预设颜色
const presetColors = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F43F5E',
  '#64748b',
]

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, '标签名称不能为空').max(30, '标签名称最多 30 个字符'),
    slug: z
      .string()
      .min(1, '别名不能为空')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '别名只能包含小写字母、数字和连字符'),
    description: z.string().max(100, '描述最多 100 个字符').optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, '请选择有效的颜色')
      .default('#3B82F6'),
  })
)

const { handleSubmit, setFieldValue, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: props.tag?.name || '',
    slug: props.tag?.slug || '',
    description: props.tag?.description || '',
    color: props.tag?.color || '#3B82F6',
  },
})

// 监听对话框打开，重置表单
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      resetForm({
        values: {
          name: props.tag?.name || '',
          slug: props.tag?.slug || '',
          description: props.tag?.description || '',
          color: props.tag?.color || '#3B82F6',
        },
      })
    }
  }
)

// 别名自动生成
watch(
  () => values.name,
  (newName) => {
    if (!props.tag || newName !== props.tag.name) {
      setFieldValue('slug', generateSlug(newName))
    }
  }
)

// 别名唯一性检查
const slugError = ref('')
const checkSlugAvailability = useDebounceFn(async (slug: string) => {
  if (!slug || slug === props.tag?.slug) return
  try {
    // TODO: Replace with actual API call
    // await $fetch(`/api/v1/tags/check-slug?slug=${slug}`)
    slugError.value = ''
  } catch {
    slugError.value = '该别名已被使用'
  }
}, 300)

const onSubmit = handleSubmit((data) => {
  emit('submit', data)
})

// 中文转拼音别名（简单实现）
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '-')
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[450px]">
      <DialogHeader>
        <DialogTitle>{{ tag ? '编辑标签' : '新增标签' }}</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>标签名称</FormLabel>
            <FormControl>
              <Input v-bind="componentField" placeholder="请输入标签名称" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="slug">
          <FormItem>
            <FormLabel>别名</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  v-bind="componentField"
                  placeholder="tag-name"
                  :class="{ 'border-red-500': slugError }"
                  @input="checkSlugAvailability(values.slug)"
                />
                <span v-if="slugError" class="text-xs text-red-500">{{ slugError }}</span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>描述</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="标签描述（可选）" rows="2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="color">
          <FormItem>
            <FormLabel>颜色</FormLabel>
            <div class="flex items-center gap-4">
              <FormControl>
                <input
                  type="color"
                  v-bind="componentField"
                  class="w-12 h-10 rounded cursor-pointer border border-input"
                />
              </FormControl>
              <Input v-model="values.color" placeholder="#3B82F6" class="w-32" />
            </div>
            <div class="flex gap-2 mt-2 flex-wrap">
              <span
                v-for="color in presetColors"
                :key="color"
                class="w-6 h-6 rounded cursor-pointer border border-gray-200"
                :style="{ backgroundColor: color }"
                @click="setFieldValue('color', color)"
              ></span>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            取消
          </Button>
          <Button type="submit">
            {{ tag ? '保存' : '创建' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
