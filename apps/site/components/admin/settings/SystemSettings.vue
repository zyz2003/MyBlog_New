<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import SettingField from './SettingField.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Globe, Database, Zap, AlertTriangle } from 'lucide-vue-next'

interface SystemSettings {
  general: {
    timezone: string
    language: string
    dateFormat: string
  }
  cache: {
    enabled: boolean
    ttl: number
  }
  performance: {
    imageQuality: number
    postsPerPage: number
    lazyLoad: boolean
  }
}

const props = withDefaults(defineProps<{
  settings: SystemSettings | null
  loading?: boolean
  saveMode?: 'auto' | 'manual'
}>(), {
  saveMode: 'manual',
})

const emit = defineEmits<{
  'save': [settings: SystemSettings]
  'clearCache': []
  'fieldChange': [field: string, value: any]
}>()

const timezones = [
  { label: 'UTC+8 北京时间', value: 'Asia/Shanghai' },
  { label: 'UTC+0 伦敦时间', value: 'Europe/London' },
  { label: 'UTC-5 纽约时间', value: 'America/New_York' },
  { label: 'UTC-8 洛杉矶时间', value: 'America/Los_Angeles' },
  { label: 'UTC+9 东京时间', value: 'Asia/Tokyo' },
]

const languages = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
]

const dateFormats = [
  { label: 'YYYY-MM-DD (2024-01-15)', value: 'YYYY-MM-DD' },
  { label: 'MM/DD/YYYY (01/15/2024)', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY (15/01/2024)', value: 'DD/MM/YYYY' },
  { label: 'YYYY 年 MM 月 DD 日 (2024 年 01 月 15 日)', value: 'YYYY 年 MM 月 DD 日' },
]

const cacheTtlOptions = [
  { label: '5 分钟', value: 300 },
  { label: '15 分钟', value: 900 },
  { label: '30 分钟', value: 1800 },
  { label: '1 小时', value: 3600 },
  { label: '6 小时', value: 21600 },
  { label: '24 小时', value: 86400 },
]

const formSchema = toTypedSchema(z.object({
  general: z.object({
    timezone: z.string(),
    language: z.string(),
    dateFormat: z.string(),
  }),
  cache: z.object({
    enabled: z.boolean(),
    ttl: z.number().min(60).max(86400),
  }),
  performance: z.object({
    imageQuality: z.number().min(10).max(100),
    postsPerPage: z.number().min(5).max(100),
    lazyLoad: z.boolean(),
  }),
}))

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: props.settings || {
    general: {
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD',
    },
    cache: {
      enabled: true,
      ttl: 3600,
    },
    performance: {
      imageQuality: 80,
      postsPerPage: 10,
      lazyLoad: true,
    },
  },
})

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    resetForm({ values: newSettings })
  }
}, { immediate: true })

const onSubmit = handleSubmit((data) => {
  emit('save', data)
})

const applyPreset = (preset: 'development' | 'production') => {
  if (preset === 'development') {
    values.performance.imageQuality = 100
    values.performance.postsPerPage = 20
    values.performance.lazyLoad = false
  } else {
    values.performance.imageQuality = 80
    values.performance.postsPerPage = 10
    values.performance.lazyLoad = true
  }
}
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- 常规设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Globe class="w-5 h-5" />
          常规设置
        </CardTitle>
        <CardDescription>
          配置系统的基础设置
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.general.timezone"
          label="时区"
          type="select"
          :options="timezones"
          description="用于显示日期和时间"
        />
        <SettingField
          v-model="values.general.language"
          label="语言"
          type="select"
          :options="languages"
          description="系统显示语言（预留多语言支持）"
        />
        <SettingField
          v-model="values.general.dateFormat"
          label="日期格式"
          type="select"
          :options="dateFormats"
          description="日期的显示格式"
        />
      </CardContent>
    </Card>

    <!-- 缓存设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Database class="w-5 h-5" />
          缓存设置
        </CardTitle>
        <CardDescription>
          管理系统的缓存策略
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>启用缓存</Label>
            <p class="text-sm text-muted-foreground">
              缓存可以提升页面加载速度
            </p>
          </div>
          <Switch
            v-model="values.cache.enabled"
            @update:model-value="emit('fieldChange', 'cache.enabled', $event)"
          />
        </div>

        <Separator />

        <SettingField
          v-model="values.cache.ttl"
          label="缓存过期时间"
          type="select"
          :options="cacheTtlOptions"
          description="缓存数据的有效期"
          :disabled="!values.cache.enabled"
        />

        <Alert>
          <AlertTriangle class="w-4 h-4" />
          <AlertDescription>
            清除缓存会导致短时间内性能下降，建议在低峰期操作
          </AlertDescription>
        </Alert>

        <div class="flex justify-end">
          <Button
            variant="outline"
            type="button"
            @click="emit('clearCache')"
          >
            清除缓存
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 性能设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Zap class="w-5 h-5" />
          性能设置
        </CardTitle>
        <CardDescription>
          优化系统性能和资源使用
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 性能预设 -->
        <div class="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            @click="applyPreset('development')"
          >
            开发模式
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            @click="applyPreset('production')"
          >
            生产模式
          </Button>
        </div>

        <SettingField
          v-model="values.performance.imageQuality"
          label="图片压缩质量"
          type="number"
          description="上传图片的压缩质量（10-100）"
          placeholder="80"
        />
        <SettingField
          v-model="values.performance.postsPerPage"
          label="每页文章数"
          type="number"
          description="列表页每页显示的文章数量"
          placeholder="10"
        />
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>启用懒加载</Label>
            <p class="text-sm text-muted-foreground">
              图片和内容在滚动到可视区域时加载
            </p>
          </div>
          <Switch
            v-model="values.performance.lazyLoad"
            @update:model-value="emit('fieldChange', 'performance.lazyLoad', $event)"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 保存按钮（手动保存模式） -->
    <div v-if="saveMode === 'manual'" class="flex justify-end pt-4">
      <Button type="submit" :disabled="loading">
        {{ loading ? '保存中...' : '保存设置' }}
      </Button>
    </div>
  </form>
</template>
