<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SettingField from './SettingField.vue'
import { User, Save, X } from 'lucide-vue-next'

interface UserProfile {
  id: string
  email: string
  displayName: string
  bio?: string
  avatar?: string
  socialLinks?: {
    github?: string
    twitter?: string
    weibo?: string
  }
}

const props = withDefaults(defineProps<{
  profile: UserProfile | null
  loading?: boolean
  saveMode?: 'auto' | 'manual'
}>(), {
  saveMode: 'manual',
})

const emit = defineEmits<{
  'save': [profile: Partial<UserProfile>]
  'fieldChange': [field: string, value: any]
}>()

const avatarPreviewUrl = ref<string | undefined>(props.profile?.avatar)

const formSchema = toTypedSchema(z.object({
  displayName: z.string().min(2, '显示名称至少 2 个字符').max(50),
  email: z.string().email(),
  bio: z.string().max(500),
  avatar: z.string().optional(),
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    weibo: z.string().url().optional().or(z.literal('')),
  }),
}))

const { handleSubmit, setFieldValue, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: props.profile || {
    displayName: '',
    email: '',
    bio: '',
    socialLinks: {},
  },
})

watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    resetForm({
      values: {
        displayName: newProfile.displayName,
        email: newProfile.email,
        bio: newProfile.bio || '',
        avatar: newProfile.avatar,
        socialLinks: newProfile.socialLinks || {},
      },
    })
    avatarPreviewUrl.value = newProfile.avatar
  }
}, { immediate: true })

const onSubmit = handleSubmit((data) => {
  emit('save', data)
})

const handleAvatarUpload = async (file: File) => {
  avatarPreviewUrl.value = URL.createObjectURL(file)
  emit('fieldChange', 'avatar', file)
}

const handleAvatarRemove = () => {
  avatarPreviewUrl.value = undefined
  setFieldValue('avatar', '')
  emit('fieldChange', 'avatar', null)
}
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- 头像设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <User class="w-5 h-5" />
          头像设置
        </CardTitle>
        <CardDescription>
          上传你的个人头像
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-start gap-6">
          <!-- 头像预览 -->
          <div class="relative group">
            <Avatar class="w-24 h-24">
              <AvatarImage v-if="avatarPreviewUrl" :src="avatarPreviewUrl" />
              <AvatarFallback>
                {{ values.displayName?.charAt(0).toUpperCase() || 'U' }}
              </AvatarFallback>
            </Avatar>
            <Button
              v-if="avatarPreviewUrl"
              variant="destructive"
              size="icon"
              class="absolute -top-2 -right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="handleAvatarRemove"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>

          <!-- 上传区域 -->
          <div class="flex-1 space-y-2">
            <SettingField
              v-model="values.avatar"
              label="上传头像"
              type="file"
              accept="image/png,image/jpeg"
              :preview-url="avatarPreviewUrl"
              description="建议尺寸 200x200px，支持 JPG 和 PNG 格式"
              @file-change="handleAvatarUpload"
              @remove="handleAvatarRemove"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 个人资料 -->
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>
          管理你的个人信息和简介
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.displayName"
          label="显示名称"
          type="text"
          placeholder="你的名字"
          description="在文章中显示的作者名称"
          required
        />
        <SettingField
          v-model="values.email"
          label="邮箱"
          type="email"
          description="用于登录和接收通知"
          disabled
        />
        <SettingField
          v-model="values.bio"
          label="个人简介"
          type="textarea"
          placeholder="介绍一下自己..."
          description="简短的个人介绍，显示在作者页面"
          :rows="4"
        />
      </CardContent>
    </Card>

    <!-- 社交链接 -->
    <Card>
      <CardHeader>
        <CardTitle>社交链接</CardTitle>
        <CardDescription>
          添加你的社交媒体主页链接
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.socialLinks.github"
          label="GitHub"
          type="url"
          placeholder="https://github.com/yourname"
        />
        <SettingField
          v-model="values.socialLinks.twitter"
          label="Twitter / X"
          type="url"
          placeholder="https://twitter.com/yourname"
        />
        <SettingField
          v-model="values.socialLinks.weibo"
          label="微博"
          type="url"
          placeholder="https://weibo.com/yourname"
        />
      </CardContent>
    </Card>

    <!-- 保存按钮（手动保存模式） -->
    <div v-if="saveMode === 'manual'" class="flex justify-end pt-4">
      <Button type="submit" :disabled="loading">
        <Save class="w-4 h-4 mr-2" />
        {{ loading ? '保存中...' : '保存设置' }}
      </Button>
    </div>
  </form>
</template>
