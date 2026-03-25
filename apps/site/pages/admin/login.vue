<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { PenTool, User, Lock, Check } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

// 登录表单 Schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入您的账号或邮箱'),
  password: z.string().min(1, '请输入您的密码'),
})

type LoginForm = z.infer<typeof loginSchema>

// 路由和导航
const route = useRoute()
const router = useRouter()
const { login } = useAuth()

// 表单状态
const isLoading = ref(false)
const rememberMe = ref(false)

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
    const redirectTo = redirect || '/admin'
    await router.push(redirectTo)
  } catch {
    // 错误已通过 toast 显示
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- 左侧面板 - 设计文件：leftPanel, 500x900, 渐变蓝色背景 + 水墨装饰 -->
    <div
      class="w-[500px] h-screen relative overflow-hidden"
      style="
        background: linear-gradient(
          180deg,
          #e8f6ff 0%,
          #b8e6ff 25%,
          #8ad4ff 45%,
          #5ec4ff 65%,
          #2c9dff 82%,
          #00aefc 100%
        );
      "
    >
      <!-- 水墨圆圈装饰 -->
      <div
        class="absolute top-[-30px] left-[50px] w-[280px] h-[280px] rounded-full bg-[#5EC4FF30]"
      ></div>
      <div
        class="absolute top-[-80px] left-[280px] w-[200px] h-[200px] rounded-full bg-[#2C9DFF20]"
      ></div>
      <div
        class="absolute top-[90px] left-[20px] w-[160px] h-[160px] rounded-full bg-[#95DBFF25]"
      ></div>
      <div
        class="absolute top-[120px] left-[280px] w-[130px] h-[130px] rounded-full bg-[#5EC4FF20]"
      ></div>
      <div
        class="absolute top-[350px] left-[80px] w-[140px] h-[140px] rounded-full bg-[#2C9DFF18]"
      ></div>
      <div
        class="absolute top-[450px] left-[350px] w-[100px] h-[100px] rounded-full bg-[#95DBFF18]"
      ></div>
      <div
        class="absolute top-[550px] left-[20px] w-[90px] h-[90px] rounded-full bg-[#5EC4FF15]"
      ></div>
      <div
        class="absolute top-[650px] left-[220px] w-[70px] h-[70px] rounded-full bg-[#2C9DFF12]"
      ></div>

      <!-- 雾气效果 -->
      <div
        class="absolute top-[450px] left-[60px] w-[360px] h-[90px] rounded-full bg-[#ffffff20]"
      ></div>
      <div
        class="absolute top-[540px] left-[90px] w-[300px] h-[70px] rounded-full bg-[#ffffff18]"
      ></div>
      <div
        class="absolute top-[620px] left-[110px] w-[260px] h-[55px] rounded-full bg-[#ffffff15]"
      ></div>

      <!-- Logo 容器 - 设计文件：100x100, cornerRadius=20 -->
      <div
        class="absolute top-[120px] left-[175px] w-[100px] h-[100px] rounded-[20px] bg-[#FFFFFF60] border-[2.5px] border-[#FFFFFF90] flex items-center justify-center"
      >
        <!-- Logo 内部装饰 -->
        <div
          class="absolute top-[10px] left-[10px] w-[80px] h-[80px] rounded-full bg-[#00AEFC20]"
        ></div>
        <div
          class="absolute top-[20px] left-[20px] w-[60px] h-[60px] rounded-full bg-[#2C9DFF40]"
        ></div>
        <div
          class="absolute top-[30px] left-[30px] w-[40px] h-[40px] rounded-full bg-[#00AEFC60]"
        ></div>
        <!-- 渐变背景 -->
        <div
          class="absolute top-[8px] left-[8px] w-[84px] h-[84px] rounded-[42px]"
          style="background: radial-gradient(circle, #00aefc 0%, #2c9dff 50%, #5ec4ff 100%)"
        ></div>
        <!-- 高光 -->
        <div
          class="absolute top-[15px] left-[15px] w-[70px] h-[70px] rounded-full bg-[#ffffff25]"
        ></div>
        <!-- 图标背景 -->
        <div
          class="absolute top-[22px] left-[22px] w-[56px] h-[56px] rounded-full bg-[#FFFFFF40]"
        ></div>
        <!-- Pen Tool 图标 -->
        <div class="relative z-10">
          <PenTool class="w-10 h-10 text-white" />
        </div>
      </div>

      <!-- 品牌标题 - 设计文件：fontSize=36, fontWeight=700, fill=#003D5C -->
      <div class="absolute top-[280px] left-[50px] text-[36px] font-bold text-[#003D5C]">
        博客管理
      </div>

      <!-- 品牌副标题 - 设计文件：fontSize=16, fill=#003D5Ce0 -->
      <div class="absolute top-[330px] left-[50px] text-[16px] text-[#003D5Ce0]">
        记录思想火花，分享知识价值
      </div>

      <!-- 山层效果 -->
      <div
        class="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#5EC4FF35]"
        style="
          clip-path: polygon(
            0 100%,
            0 30%,
            100px 0,
            220px 80px,
            350px 0,
            480px 100%,
            500px 80%,
            500px 100%
          );
        "
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[500px] h-[220px] bg-[#2C9DFF28]"
        style="
          clip-path: polygon(0 100%, 0 50%, 150px 0, 300px 60px, 450px 0, 500px 40%, 500px 100%);
        "
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[500px] h-[140px] bg-[#95DBFF20]"
        style="
          clip-path: polygon(
            0 100%,
            0 60%,
            100px 20px,
            250px 70px,
            400px 30px,
            500px 50%,
            500px 100%
          );
        "
      ></div>
    </div>

    <!-- 右侧面板 - 设计文件：rightPanel, 940x900, 浅色背景 -->
    <div
      class="flex-1 h-screen relative flex items-center justify-center"
      style="background: #f5faff"
    >
      <!-- 背景装饰 -->
      <div
        class="absolute inset-0"
        style="background: radial-gradient(circle at center, #f0faff 0%, #d1f0ff 50%, #a8e4ff 100%)"
      ></div>

      <!-- 登录卡片 - 设计文件：loginCard, x=250, y=97, width=440, cornerRadius=20 -->
      <div
        class="relative z-10 w-[440px] bg-white rounded-[20px] border border-[#D4DCE5] p-[44px] pb-[52px]"
        style="box-shadow: 0 20px 60px rgba(0, 174, 252, 0.19)"
      >
        <!-- Logo 区域 -->
        <div class="flex flex-col items-center mb-7">
          <!-- Logo 容器 - 80x80 -->
          <div class="relative w-20 h-20 mb-4">
            <div class="absolute top-2 left-2 w-16 h-16 rounded-full bg-[#00AEFC10]"></div>
            <div class="absolute top-4 left-4 w-12 h-12 rounded-full bg-[#2C9DFF08]"></div>
            <div
              class="absolute top-6 left-6 w-8 h-8 rounded-full"
              style="background: radial-gradient(circle, #5ec4ff 0%, #00aefc 100%)"
            ></div>
            <div class="absolute top-3 left-3 w-14 h-14 rounded-full bg-[#FFFFFF60]"></div>
            <!-- 中心渐变方块 -->
            <div
              class="absolute top-[18px] left-[18px] w-11 h-11 rounded-[12px] flex items-center justify-center"
              style="
                background: linear-gradient(135deg, #008fd9 0%, #00aefc 100%);
                box-shadow: 0 6px 16px rgba(0, 174, 252, 0.31);
              "
            >
              <PenTool class="w-[22px] h-[22px] text-white" />
            </div>
            <!-- 装饰点 -->
            <div
              class="absolute top-[10px] right-[16px] w-[6px] h-[6px] rounded-full bg-[#00AEFC40]"
            ></div>
            <div
              class="absolute bottom-[18px] right-[16px] w-[4px] h-[4px] rounded-full bg-[#2C9DFF30]"
            ></div>
          </div>

          <!-- 标题 - 设计文件：fontSize=26, fontWeight=700, fill=#002D4A -->
          <div class="text-[26px] font-bold text-[#002D4A] mb-2">博客管理后台</div>

          <!-- 副标题 - 设计文件：fontSize=14, fill=#005A8C -->
          <div class="text-[14px] text-[#005A8C]">欢迎回来，请登录您的账号继续创作</div>
        </div>

        <!-- 表单区域 -->
        <form class="space-y-5" @submit="onSubmit">
          <!-- 账号输入 - 设计文件：height=50, cornerRadius=12 -->
          <div class="space-y-2">
            <label class="text-[14px] font-semibold text-[#003D5C]">账号</label>
            <div
              class="relative h-[50px] bg-white rounded-[12px] border-2 border-[#B8D4E8] flex items-center px-4"
              style="box-shadow: 0 2px 4px rgba(0, 174, 252, 0.06)"
            >
              <User class="w-[19px] h-[19px] text-[#008FD9] mr-3" />
              <input
                v-model="username"
                v-bind="usernameAttrs"
                type="text"
                placeholder="请输入您的账号或邮箱"
                class="flex-1 bg-transparent outline-none text-[#003D5C] placeholder:text-[#A8C4D9] text-[14px]"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.username" class="text-sm text-red-500">{{ errors.username }}</p>
          </div>

          <!-- 密码输入 - 设计文件：height=50, cornerRadius=12 -->
          <div class="space-y-2">
            <label class="text-[14px] font-semibold text-[#003D5C]">密码</label>
            <div
              class="relative h-[50px] bg-white rounded-[12px] border-2 border-[#B8D4E8] flex items-center px-4"
              style="box-shadow: 0 2px 4px rgba(0, 174, 252, 0.06)"
            >
              <Lock class="w-[19px] h-[19px] text-[#008FD9] mr-3" />
              <input
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="请输入您的密码"
                class="flex-1 bg-transparent outline-none text-[#003D5C] placeholder:text-[#A8C4D9] text-[14px]"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <!-- 选项行 -->
          <div class="flex items-center justify-between">
            <!-- 复选框 - 设计文件：20x20, cornerRadius=6, 渐变蓝色 -->
            <label class="flex items-center gap-2 cursor-pointer">
              <div
                class="relative w-5 h-5 rounded-[6px]"
                style="
                  background: linear-gradient(135deg, #00aefc 0%, #00aefc 100%);
                  box-shadow: 0 2px 6px rgba(0, 174, 252, 0.31);
                "
              >
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Check
                  v-if="rememberMe"
                  class="w-[14px] h-[14px] text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              <span class="text-[13px] text-[#005A8C]">30 天内免登录</span>
            </label>

            <!-- 找回密码链接 -->
            <a class="text-[13px] font-semibold text-[#008FD9] cursor-pointer hover:underline"
              >找回密码？</a
            >
          </div>

          <!-- 登录按钮 - 设计文件：height=52, cornerRadius=12, 渐变蓝色 -->
          <button
            type="submit"
            class="w-full h-[52px] rounded-[12px] text-white text-[15px] font-semibold tracking-wider flex items-center justify-center transition-all duration-200 hover:opacity-90"
            style="
              background: linear-gradient(90deg, #00aefc 0%, #008fd9 100%);
              box-shadow: 0 8px 24px rgba(0, 174, 252, 0.38);
            "
            :disabled="isLoading"
          >
            <span v-if="!isLoading">登录</span>
            <span v-else>登录中...</span>
          </button>
        </form>

        <!-- 分割线 -->
        <div class="my-6 h-[1px] bg-[#D4E8F5]"></div>

        <!-- 页脚 -->
        <div class="flex flex-col items-center gap-1.5">
          <div class="text-[13px] text-[#8AB0C9]">登录遇到问题？</div>
          <a class="text-[13px] font-semibold text-[#008FD9] cursor-pointer hover:underline"
            >联系技术支持</a
          >
        </div>
      </div>
    </div>
  </div>
</template>
