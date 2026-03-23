<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { LogIn } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

// 登录表单 Schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

type LoginForm = z.infer<typeof loginSchema>

// 路由和导航
const route = useRoute()
const router = useRouter()
const { login } = useAuth()

// 表单状态
const isLoading = ref(false)

// 获取重定向地址
const redirect = route.query.redirect as string | undefined

// 初始化表单
const { handleSubmit, errors, defineField } = useForm<LoginForm>({
  validationSchema: toTypedSchema(loginSchema),
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

// 提交处理
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    await login(values.username, values.password)
    // 登录成功后跳转到原页面或后台首页
    const redirectTo = redirect || '/admin'
    await router.push(redirectTo)
  } catch (error) {
    // 错误已通过 toast 显示
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="w-full max-w-md p-6">
      <!-- 登录卡片 -->
      <Card class="border-slate-200 shadow-lg">
        <CardHeader class="space-y-1 text-center">
          <!-- Logo -->
          <div class="flex justify-center mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <LogIn class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-semibold text-slate-900">Blog Admin</span>
            </div>
          </div>

          <!-- 标题 -->
          <CardTitle class="text-2xl font-semibold text-slate-900">
            欢迎回来
          </CardTitle>
          <CardDescription class="text-slate-500">
            请输入您的账号信息登录
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit="onSubmit" class="space-y-4">
            <!-- 用户名输入框 -->
            <div class="space-y-2">
              <Label for="username" class="text-slate-700 font-medium">
                用户名
              </Label>
              <Input
                id="username"
                v-model="username"
                v-bind="usernameAttrs"
                type="text"
                placeholder="请输入用户名"
                :disabled="isLoading"
                :class="{ 'border-red-500': errors.username }"
              />
              <p v-if="errors.username" class="text-sm text-red-500">
                {{ errors.username }}
              </p>
            </div>

            <!-- 密码输入框 -->
            <div class="space-y-2">
              <Label for="password" class="text-slate-700 font-medium">
                密码
              </Label>
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="请输入密码"
                :disabled="isLoading"
                :class="{ 'border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="text-sm text-red-500">
                {{ errors.password }}
              </p>
            </div>

            <!-- 登录按钮 -->
            <Button
              type="submit"
              class="w-full bg-slate-900 hover:bg-slate-800"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">登录</span>
              <span v-else>登录中...</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
