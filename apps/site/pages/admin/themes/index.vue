<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import ThemeList from '~/components/admin/themes/ThemeList.vue'
import ThemePreviewModal from '~/components/admin/themes/ThemePreviewModal.vue'
import ThemeConfigForm from '~/components/admin/themes/ThemeConfigForm.vue'
import { Button } from '#components'
import { useToast } from '#imports'
import { Upload } from 'lucide-vue-next'
import { useThemeAdminStore, type Theme, type ThemeConfig } from '~/stores/themeAdmin'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: '主题管理 - 后台管理',
})

const toast = useToast()
const themeStore = useThemeAdminStore()

const showUploadDialog = ref(false)

const handleActivate = async (themeId: string) => {
  const result = await themeStore.activateTheme(themeId)
  if (result.success) {
    toast.add({
      title: '主题激活成功',
      description: '新主题已激活并应用到前台',
    })
  } else {
    toast.add({
      title: '主题激活失败',
      description: '请稍后重试',
      variant: 'destructive',
    })
  }
}

const handlePreview = (theme: Theme) => {
  themeStore.openPreview(theme)
}

const handleConfigure = (theme: Theme) => {
  themeStore.openConfig(theme)
}

const handleSearch = (query: string) => {
  // Search is handled by the ThemeList component
  console.log('Search query:', query)
}

const handleFilterChange = (filter: string) => {
  console.log('Filter changed:', filter)
}

const handleSaveConfig = async (config: ThemeConfig) => {
  if (themeStore.configTheme) {
    const result = await themeStore.saveThemeConfig(themeStore.configTheme.id, config)
    if (result.success) {
      toast.add({
        title: '配置保存成功',
        description: '主题配置已更新',
      })
      themeStore.closeConfig()
    } else {
      toast.add({
        title: '配置保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }
}

onMounted(() => {
  themeStore.fetchThemes()
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- 页面头部 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">主题管理</h1>
          <p class="text-muted-foreground mt-1">浏览、预览和管理博客主题</p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="showUploadDialog = true">
            <Upload class="w-4 h-4 mr-2" />
            上传主题
          </Button>
        </div>
      </div>

      <!-- 主题列表 -->
      <div class="bg-card rounded-lg border p-6">
        <ThemeList
          :themes="themeStore.themes"
          :loading="themeStore.loading"
          @activate="handleActivate"
          @preview="handlePreview"
          @configure="handleConfigure"
          @search="handleSearch"
          @filter-change="handleFilterChange"
        />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <ThemePreviewModal
      v-model:open="themeStore.previewOpen"
      :theme="themeStore.previewTheme"
      @activate="handleActivate"
    />

    <!-- 配置弹窗 -->
    <ThemeConfigForm
      v-model:open="themeStore.configOpen"
      :theme="themeStore.configTheme"
      :config="themeStore.currentConfig"
      @save="handleSaveConfig"
    />
  </AdminLayout>
</template>
