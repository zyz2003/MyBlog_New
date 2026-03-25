<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useDebounceFn } from '@vueuse/core'
import type { Category } from '@my-blog/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  open: boolean
  category?: Category | null
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [data: {
    name: string
    slug: string
    parentId: string | null
    description?: string
    color?: string
  }]
}>()

// 预设颜色
const presetColors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#F43F5E', '#64748b',
]

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称最多 50 个字符'),
  slug: z.string().min(1, '别名不能为空').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '别名只能包含小写字母、数字和连字符'),
  parentId: z.string().nullable().optional(),
  description: z.string().max(200, '描述最多 200 个字符').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '请选择有效的颜色').optional(),
}))

const { handleSubmit, setFieldValue, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: props.category?.name || '',
    slug: props.category?.slug || '',
    parentId: props.category?.parentId || null,
    description: props.category?.description || '',
    color: props.category?.color || '#3B82F6',
  },
})

// 监听对话框打开，重置表单
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    resetForm({
      values: {
        name: props.category?.name || '',
        slug: props.category?.slug || '',
        parentId: props.category?.parentId || null,
        description: props.category?.description || '',
        color: props.category?.color || '#3B82F6',
      },
    })
  }
})

// 别名自动生成
watch(() => values.name, (newName) => {
  if (!props.category || newName !== props.category.name) {
    setFieldValue('slug', generateSlug(newName))
  }
})

// 别名唯一性检查
const slugError = ref('')
const checkSlugAvailability = useDebounceFn(async (slug: string) => {
  if (!slug || slug === props.category?.slug) return
  try {
    // TODO: 实现 API 调用
    // await $fetch(`/api/v1/categories/check-slug?slug=${slug}`)
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

// 获取树形结构的父分类选项
const getParentCategoryOptions = (categories: Category[], depth = 0): Array<{ value: string; label: string; disabled: boolean }> => {
  const options: Array<{ value: string; label: string; disabled: boolean }> = []
  for (const cat of categories) {
    // 禁用当前分类和它的子分类
    const disabled = cat.id === props.category?.id
    options.push({
      value: cat.id,
      label: '  '.repeat(depth) + cat.name,
      disabled,
    })
    if (cat.children?.length) {
      options.push(...getParentCategoryOptions(cat.children, depth + 1))
    }
  }
  return options
}

const parentCategoryOptions = computed(() => {
  const options = getParentCategoryOptions(props.categories)
  return [{ value: '', label: '无（作为顶级分类）', disabled: false }, ...options]
})
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ category ? '编辑分类' : '新增分类' }}</DialogTitle>
      </DialogHeader>
      <form @submit="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>分类名称</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="请输入分类名称"
              />
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
                  placeholder="category-name"
                  :class="{ 'border-red-500': slugError }"
                  @input="checkSlugAvailability(values.slug)"
                />
                <span
                  v-if="slugError"
                  class="absolute -bottom-5 right-0 text-xs text-red-500"
                >
                  {{ slugError }}
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="parentId">
          <FormItem>
            <FormLabel>父分类</FormLabel>
            <FormControl>
              <select
                v-bind="componentField"
                class="w-full rounded-md border p-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option
                  v-for="opt in parentCategoryOptions"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="opt.disabled"
                >
                  {{ opt.label }}
                </option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>描述</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="分类描述（可选）"
                rows="3"
              />
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
              <Input
                v-model="values.color"
                placeholder="#3B82F6"
                class="w-32"
              />
            </div>
            <!-- 预设色板 -->
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
            {{ category ? '保存' : '创建' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
