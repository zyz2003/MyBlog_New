<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import SettingField from './SettingField.vue'
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-vue-next'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  'success': []
  'error': [error: string]
}>()

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordStrength = ref(0)

const passwordRules = ref([
  { label: '至少 8 个字符', valid: false },
  { label: '包含大写字母', valid: false },
  { label: '包含小写字母', valid: false },
  { label: '包含数字', valid: false },
  { label: '包含特殊字符', valid: false },
])

const checkPasswordStrength = (password: string) => {
  let strength = 0
  const rules = [
    { label: '至少 8 个字符', valid: false },
    { label: '包含大写字母', valid: false },
    { label: '包含小写字母', valid: false },
    { label: '包含数字', valid: false },
    { label: '包含特殊字符', valid: false },
  ]

  if (password.length >= 8) {
    strength++
    rules[0].valid = true
  }
  if (/[A-Z]/.test(password)) {
    strength++
    rules[1].valid = true
  }
  if (/[a-z]/.test(password)) {
    strength++
    rules[2].valid = true
  }
  if (/[0-9]/.test(password)) {
    strength++
    rules[3].valid = true
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    strength++
    rules[4].valid = true
  }

  passwordStrength.value = strength
  passwordRules.value = rules
  return rules
}

const strengthColor = computed(() => {
  if (passwordStrength.value <= 2) return 'bg-red-500'
  if (passwordStrength.value <= 3) return 'bg-yellow-500'
  if (passwordStrength.value <= 4) return 'bg-blue-500'
  return 'bg-green-500'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value <= 2) return '弱'
  if (passwordStrength.value <= 3) return '中等'
  if (passwordStrength.value <= 4) return '强'
  return '很强'
})

const formSchema = toTypedSchema(z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
}))

const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (data) => {
  try {
    emit('success')
    resetForm()
    passwordStrength.value = 0
    passwordRules.value = passwordRules.value.map(rule => ({ ...rule, valid: false }))
  } catch (error) {
    emit('error', error as string)
  }
})

const handleNewPasswordInput = (value: string) => {
  setFieldValue('newPassword', value)
  checkPasswordStrength(value)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Lock class="w-5 h-5" />
        修改密码
      </CardTitle>
      <CardDescription>
        定期修改密码可以提高账户安全性
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>当前密码</Label>
          <div class="relative">
            <Input
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="values.currentPassword"
              placeholder="请输入当前密码"
              class="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="absolute right-0 top-0 h-full px-3"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <EyeOff v-if="showCurrentPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label>新密码</Label>
          <div class="relative">
            <Input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="values.newPassword"
              placeholder="请输入新密码"
              class="pr-10"
              @update:model-value="handleNewPasswordInput"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="absolute right-0 top-0 h-full px-3"
              @click="showNewPassword = !showNewPassword"
            >
              <EyeOff v-if="showNewPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>

          <!-- 密码强度指示器 -->
          <div v-if="values.newPassword" class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  :class="['h-full transition-all', strengthColor]"
                  :style="{ width: `${(passwordStrength / 5) * 100}%` }"
                ></div>
              </div>
              <span class="text-xs text-muted-foreground">{{ strengthLabel }}</span>
            </div>

            <!-- 密码规则 -->
            <ul class="text-xs space-y-1 text-muted-foreground">
              <li
                v-for="rule in passwordRules"
                :key="rule.label"
                :class="rule.valid ? 'text-green-600' : ''"
              >
                <CheckCircle v-if="rule.valid" class="w-3 h-3 inline mr-1" />
                <span v-else class="inline-block w-4 mr-1"></span>
                {{ rule.label }}
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-2">
          <Label>确认密码</Label>
          <div class="relative">
            <Input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="values.confirmPassword"
              placeholder="请再次输入新密码"
              class="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="absolute right-0 top-0 h-full px-3"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <!-- 安全提示 -->
        <Alert>
          <AlertTriangle class="w-4 h-4" />
          <AlertDescription>
            密码修改后，其他设备将需要重新登录
          </AlertDescription>
        </Alert>

        <div class="flex justify-end pt-4">
          <Button type="submit" :disabled="loading">
            <Lock class="w-4 h-4 mr-2" />
            {{ loading ? '修改中...' : '修改密码' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
