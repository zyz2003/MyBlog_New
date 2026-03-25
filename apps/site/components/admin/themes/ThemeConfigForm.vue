<script setup lang="ts">
import { ref, watch } from 'vue'
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
  Select,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#components'
import type { Theme } from './ThemeCard.vue'

interface ThemeConfig {
  name: string
  description?: string
  colors: {
    primary: string
    background: string
    foreground: string
    accent?: string
  }
  typography: {
    fontFamily: string
    baseSize: string
  }
  layout: {
    sidebarPosition: 'left' | 'right'
    sidebarWidth: number
  }
}

const props = defineProps<{
  open: boolean
  theme: Theme | null
  config: ThemeConfig | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [config: ThemeConfig]
}>()

const activeTab = ref('basic')

const presetColors = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
]

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, '主题名称不能为空').max(50),
    description: z.string().max(200).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '请选择有效的颜色'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '请选择有效的颜色'),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '请选择有效的颜色'),
    fontFamily: z.string().default('Inter, system-ui, sans-serif'),
    baseFontSize: z.enum(['14px', '16px', '18px']),
    sidebarPosition: z.enum(['left', 'right']),
    sidebarWidth: z.number().min(200).max(400),
  })
)

const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: formSchema,
  initialValues: props.config
    ? {
        name: props.config.name,
        description: props.config.description,
        primaryColor: props.config.colors.primary,
        backgroundColor: props.config.colors.background,
        textColor: props.config.colors.foreground,
        fontFamily: props.config.typography.fontFamily,
        baseFontSize: props.config.typography.baseSize,
        sidebarPosition: props.config.layout.sidebarPosition,
        sidebarWidth: props.config.layout.sidebarWidth,
      }
    : {},
})

watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      resetForm({
        values: {
          name: newConfig.name,
          description: newConfig.description || '',
          primaryColor: newConfig.colors.primary,
          backgroundColor: newConfig.colors.background,
          textColor: newConfig.colors.foreground,
          fontFamily: newConfig.typography.fontFamily,
          baseFontSize: newConfig.typography.baseSize,
          sidebarPosition: newConfig.layout.sidebarPosition,
          sidebarWidth: newConfig.layout.sidebarWidth,
        },
      })
    }
  }
)

const onSubmit = handleSubmit((data) => {
  emit('save', {
    name: data.name,
    description: data.description,
    colors: {
      primary: data.primaryColor,
      background: data.backgroundColor,
      foreground: data.textColor,
    },
    typography: {
      fontFamily: data.fontFamily,
      baseSize: data.baseFontSize,
    },
    layout: {
      sidebarPosition: data.sidebarPosition,
      sidebarWidth: data.sidebarWidth,
    },
  })
})
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>配置主题：{{ theme?.name }}</DialogTitle>
      </DialogHeader>

      <Tabs v-model="activeTab" class="mt-4">
        <TabsList class="grid grid-cols-4 w-full">
          <TabsTrigger value="basic">基础</TabsTrigger>
          <TabsTrigger value="colors">颜色</TabsTrigger>
          <TabsTrigger value="typography">字体</TabsTrigger>
          <TabsTrigger value="layout">布局</TabsTrigger>
        </TabsList>

        <form class="mt-4 space-y-4" @submit="onSubmit">
          <!-- 基础设置 -->
          <TabsContent value="basic" class="space-y-4">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>主题名称</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>主题描述</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" rows="3" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </TabsContent>

          <!-- 颜色配置 -->
          <TabsContent value="colors" class="space-y-4">
            <FormField v-slot="{ componentField }" name="primaryColor">
              <FormItem>
                <FormLabel>主色调</FormLabel>
                <div class="flex items-center gap-4">
                  <FormControl>
                    <input
                      type="color"
                      v-bind="componentField"
                      class="w-12 h-10 rounded cursor-pointer"
                    />
                  </FormControl>
                  <Input v-model="values.primaryColor" class="w-32" />
                </div>
                <div class="flex gap-2 mt-2 flex-wrap">
                  <span
                    v-for="color in presetColors"
                    :key="color"
                    class="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    :style="{ backgroundColor: color }"
                    @click="setFieldValue('primaryColor', color)"
                  ></span>
                </div>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="backgroundColor">
              <FormItem>
                <FormLabel>背景色</FormLabel>
                <div class="flex items-center gap-4">
                  <FormControl>
                    <input type="color" v-bind="componentField" class="w-12 h-10 rounded" />
                  </FormControl>
                  <Input v-model="values.backgroundColor" class="w-32" />
                </div>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="textColor">
              <FormItem>
                <FormLabel>文字颜色</FormLabel>
                <div class="flex items-center gap-4">
                  <FormControl>
                    <input type="color" v-bind="componentField" class="w-12 h-10 rounded" />
                  </FormControl>
                  <Input v-model="values.textColor" class="w-32" />
                </div>
                <FormMessage />
              </FormItem>
            </FormField>
          </TabsContent>

          <!-- 字体配置 -->
          <TabsContent value="typography" class="space-y-4">
            <FormField v-slot="{ componentField }" name="fontFamily">
              <FormItem>
                <FormLabel>字体族</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <select class="w-full rounded-md border p-2">
                      <option value="Inter, system-ui, sans-serif">Inter (默认)</option>
                      <option value="Georgia, serif">Georgia (衬线)</option>
                      <option value="Fira Code, monospace">Fira Code (等宽)</option>
                    </select>
                  </FormControl>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="baseFontSize">
              <FormItem>
                <FormLabel>基础字号</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <select class="w-full rounded-md border p-2">
                      <option value="14px">14px (小)</option>
                      <option value="16px">16px (默认)</option>
                      <option value="18px">18px (大)</option>
                    </select>
                  </FormControl>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </TabsContent>

          <!-- 布局配置 -->
          <TabsContent value="layout" class="space-y-4">
            <FormField v-slot="{ componentField }" name="sidebarPosition">
              <FormItem>
                <FormLabel>侧边栏位置</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <select class="w-full rounded-md border p-2">
                      <option value="left">左侧</option>
                      <option value="right">右侧</option>
                    </select>
                  </FormControl>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="sidebarWidth">
              <FormItem>
                <FormLabel>侧边栏宽度 (px)</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" :min="200" :max="400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </TabsContent>

          <!-- 底部按钮 -->
          <div class="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" @click="emit('update:open', false)">
              取消
            </Button>
            <Button type="button" variant="secondary"> 重置为默认 </Button>
            <Button type="submit"> 保存配置 </Button>
          </div>
        </form>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
