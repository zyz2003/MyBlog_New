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
import { Bell, Mail, Eye } from 'lucide-vue-next'

interface NotificationSettings {
  emailNotifications: {
    newComments: boolean
    systemUpdates: boolean
    securityAlerts: boolean
  }
  browserNotifications: boolean
  frequency: 'immediate' | 'hourly' | 'daily'
}

const props = withDefaults(defineProps<{
  settings: NotificationSettings | null
  loading?: boolean
  saveMode?: 'auto' | 'manual'
}>(), {
  saveMode: 'manual',
})

const emit = defineEmits<{
  'save': [settings: NotificationSettings]
  'fieldChange': [field: string, value: any]
}>()

const formSchema = toTypedSchema(z.object({
  emailNotifications: z.object({
    newComments: z.boolean(),
    systemUpdates: z.boolean(),
    securityAlerts: z.boolean(),
  }),
  browserNotifications: z.boolean(),
  frequency: z.enum(['immediate', 'hourly', 'daily']),
}))

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: props.settings || {
    emailNotifications: {
      newComments: true,
      systemUpdates: true,
      securityAlerts: true,
    },
    browserNotifications: false,
    frequency: 'immediate',
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

const frequencyOptions = [
  { label: '立即发送', value: 'immediate' },
  { label: '每小时摘要', value: 'hourly' },
  { label: '每日摘要', value: 'daily' },
]
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- 邮件通知 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Mail class="w-5 h-5" />
          邮件通知
        </CardTitle>
        <CardDescription>
          选择通过邮件接收哪些通知
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>新评论通知</Label>
            <p class="text-sm text-muted-foreground">
              当文章有新评论时发送邮件
            </p>
          </div>
          <Switch
            v-model="values.emailNotifications.newComments"
            @update:model-value="emit('fieldChange', 'emailNotifications.newComments', $event)"
          />
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>系统更新通知</Label>
            <p class="text-sm text-muted-foreground">
              系统更新或新功能发布时通知
            </p>
          </div>
          <Switch
            v-model="values.emailNotifications.systemUpdates"
            @update:model-value="emit('fieldChange', 'emailNotifications.systemUpdates', $event)"
          />
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label class="flex items-center gap-1">
              安全通知
              <span class="text-xs text-muted-foreground">（必选）</span>
            </Label>
            <p class="text-sm text-muted-foreground">
              账户安全相关的重要通知
            </p>
          </div>
          <Switch
            v-model="values.emailNotifications.securityAlerts"
            disabled
          />
        </div>
      </CardContent>
    </Card>

    <!-- 浏览器通知 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Bell class="w-5 h-5" />
          浏览器通知
        </CardTitle>
        <CardDescription>
          在浏览器中接收实时通知
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>启用浏览器通知</Label>
            <p class="text-sm text-muted-foreground">
              需要浏览器授权通知权限
            </p>
          </div>
          <Switch
            v-model="values.browserNotifications"
            @update:model-value="emit('fieldChange', 'browserNotifications', $event)"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 通知频率 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Eye class="w-5 h-5" />
          通知频率
        </CardTitle>
        <CardDescription>
          控制通知的发送频率
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingField
          v-model="values.frequency"
          label="通知聚合频率"
          type="select"
          :options="frequencyOptions"
          description="选择立即发送或聚合后发送"
        />
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
