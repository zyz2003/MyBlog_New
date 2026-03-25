<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import SettingField from './SettingField.vue'
import { Save, Globe, Search, Image } from 'lucide-vue-next'

interface SiteSettings {
  name: string
  description: string
  url: string
  logo?: string
  favicon?: string
  seo: {
    defaultTitle: string
    defaultDescription: string
    metaKeywords: string
    googleVerification?: string
    bingVerification?: string
  }
}

const props = withDefaults(
  defineProps<{
    settings: SiteSettings | null
    loading?: boolean
    saveMode?: 'auto' | 'manual'
  }>(),
  {
    saveMode: 'manual',
  }
)

const emit = defineEmits<{
  save: [settings: Partial<SiteSettings>]
  fieldChange: [field: string, value: unknown]
}>()

const logoPreviewUrl = ref<string | undefined>(props.settings?.logo)
const faviconPreviewUrl = ref<string | undefined>(props.settings?.favicon)

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, '站点名称不能为空').max(50),
    description: z.string().max(200),
    url: z.string().url('请输入有效的 URL'),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    seo: z.object({
      defaultTitle: z.string().max(60),
      defaultDescription: z.string().max(160),
      metaKeywords: z.string().optional(),
      googleVerification: z.string().optional(),
      bingVerification: z.string().optional(),
    }),
  })
)

const { handleSubmit, setFieldValue, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: props.settings || {
    name: '',
    description: '',
    url: '',
    seo: {
      defaultTitle: '',
      defaultDescription: '',
      metaKeywords: '',
      googleVerification: '',
      bingVerification: '',
    },
  },
})

watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      resetForm({
        values: newSettings,
      })
      logoPreviewUrl.value = newSettings.logo
      faviconPreviewUrl.value = newSettings.favicon
    }
  },
  { immediate: true }
)

const onSubmit = handleSubmit((data) => {
  emit('save', data)
})

const handleLogoUpload = async (file: File) => {
  logoPreviewUrl.value = URL.createObjectURL(file)
  emit('fieldChange', 'logo', file)
}

const handleLogoRemove = () => {
  logoPreviewUrl.value = undefined
  setFieldValue('logo', '')
  emit('fieldChange', 'logo', null)
}

const handleFaviconUpload = async (file: File) => {
  faviconPreviewUrl.value = URL.createObjectURL(file)
  emit('fieldChange', 'favicon', file)
}

const handleFaviconRemove = () => {
  faviconPreviewUrl.value = undefined
  setFieldValue('favicon', '')
  emit('fieldChange', 'favicon', null)
}
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <!-- 基础设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Globe class="w-5 h-5" />
          基础设置
        </CardTitle>
        <CardDescription> 配置站点的基本信息 </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.name"
          label="站点名称"
          type="text"
          placeholder="我的博客"
          description="显示在浏览器标题栏和 SEO 中的站点名称"
          required
        />
        <SettingField
          v-model="values.description"
          label="站点描述"
          type="textarea"
          placeholder="一个分享技术和生活的个人博客"
          description="站点的简短描述，用于 SEO 和社交媒体分享"
          :rows="3"
        />
        <SettingField
          v-model="values.url"
          label="站点 URL"
          type="url"
          placeholder="https://example.com"
          description="站点的完整 URL，用于生成绝对链接"
          required
        />
      </CardContent>
    </Card>

    <!-- 品牌标识 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Image class="w-5 h-5" />
          品牌标识
        </CardTitle>
        <CardDescription> 上传站点的 Logo 和 Favicon </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.logo"
          label="站点 Logo"
          type="file"
          accept="image/png,image/jpeg"
          :preview-url="logoPreviewUrl"
          :show-remove="!!logoPreviewUrl"
          description="建议尺寸 200x60px，用于站点头部显示"
          @file-change="handleLogoUpload"
          @remove="handleLogoRemove"
        />
        <Separator />
        <SettingField
          v-model="values.favicon"
          label="Favicon"
          type="file"
          accept="image/png,image/x-icon"
          :preview-url="faviconPreviewUrl"
          :show-remove="!!faviconPreviewUrl"
          description="建议尺寸 32x32px，用于浏览器标签页图标"
          @file-change="handleFaviconUpload"
          @remove="handleFaviconRemove"
        />
      </CardContent>
    </Card>

    <!-- SEO 设置 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="w-5 h-5" />
          SEO 设置
        </CardTitle>
        <CardDescription> 优化搜索引擎收录和排名 </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <SettingField
          v-model="values.seo.defaultTitle"
          label="默认标题"
          type="text"
          placeholder="我的博客 - 分享技术和生活"
          description="首页和未设置标题页面的 SEO 标题（建议不超过 60 字符）"
        />
        <SettingField
          v-model="values.seo.defaultDescription"
          label="默认描述"
          type="textarea"
          placeholder="这是一个个人博客，分享前端开发、技术学习等内容"
          description="首页和未设置描述页面的 SEO 描述（建议不超过 160 字符）"
          :rows="3"
        />
        <SettingField
          v-model="values.seo.metaKeywords"
          label="Meta 关键词"
          type="text"
          placeholder="博客，前端，技术，Vue, Nuxt"
          description="用逗号分隔的关键词列表"
        />
        <Separator />
        <SettingField
          v-model="values.seo.googleVerification"
          label="Google 搜索控制台验证"
          type="text"
          placeholder="google-site-verification=xxx"
          description="Google Search Console 验证代码"
        />
        <SettingField
          v-model="values.seo.bingVerification"
          label="Bing 网站管理员工具验证"
          type="text"
          placeholder="msvalidate.01=xxx"
          description="Bing Webmaster Tools 验证代码"
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
