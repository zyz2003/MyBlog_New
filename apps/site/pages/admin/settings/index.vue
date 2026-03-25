<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import { useSettingsAdminStore } from '~/stores/settingsAdmin'
import { useToast } from '~/components/ui/toast/use-toast'
import SettingsTabs from '~/components/admin/settings/SettingsTabs.vue'
import SiteSettingsForm from '~/components/admin/settings/SiteSettingsForm.vue'
import UserProfileSettings from '~/components/admin/settings/UserProfileSettings.vue'
import ChangePasswordForm from '~/components/admin/settings/ChangePasswordForm.vue'
import NotificationSettings from '~/components/admin/settings/NotificationSettings.vue'
import SystemSettings from '~/components/admin/settings/SystemSettings.vue'
import { TabsContent } from '~/components/ui/tabs'
import { Skeleton } from '~/components/ui/skeleton'

const store = useSettingsAdminStore()
const { toast } = useToast()

const activeTab = ref('site')

const tabs = computed(() => [
  {
    id: 'site',
    label: '站点设置',
    icon: 'site',
    hasUnsavedChanges: store.unsavedChanges.site,
  },
  {
    id: 'user',
    label: '用户设置',
    icon: 'user',
    hasUnsavedChanges: store.unsavedChanges.user,
  },
  {
    id: 'system',
    label: '系统设置',
    icon: 'system',
    hasUnsavedChanges: store.unsavedChanges.system,
  },
])

const beforeUnload = (event: BeforeUnloadEvent) => {
  const hasChanges = Object.values(store.unsavedChanges).some(v => v)
  if (hasChanges) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(async () => {
  await store.fetchAllSettings()
  window.addEventListener('beforeunload', beforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})

const handleSiteSave = async (data: any) => {
  const result = await store.saveSiteSettings(data)
  if (result.success) {
    toast({
      title: '保存成功',
      description: '站点设置已更新',
    })
  } else {
    toast({
      title: '保存失败',
      description: result.error as string,
      variant: 'destructive',
    })
  }
}

const handleProfileSave = async (data: any) => {
  const result = await store.saveUserProfile(data)
  if (result.success) {
    toast({
      title: '保存成功',
      description: '个人资料已更新',
    })
  } else {
    toast({
      title: '保存失败',
      description: result.error as string,
      variant: 'destructive',
    })
  }
}

const handlePasswordSuccess = async () => {
  toast({
    title: '密码已修改',
    description: '请使用新密码重新登录',
  })
}

const handlePasswordError = (error: string) => {
  toast({
    title: '修改失败',
    description: error,
    variant: 'destructive',
  })
}

const handleNotificationSave = async (data: any) => {
  const result = await store.saveNotificationSettings(data)
  if (result.success) {
    toast({
      title: '保存成功',
      description: '通知设置已更新',
    })
  } else {
    toast({
      title: '保存失败',
      description: result.error as string,
      variant: 'destructive',
    })
  }
}

const handleSystemSave = async (data: any) => {
  const result = await store.saveSystemSettings(data)
  if (result.success) {
    toast({
      title: '保存成功',
      description: '系统设置已更新',
    })
  } else {
    toast({
      title: '保存失败',
      description: result.error as string,
      variant: 'destructive',
    })
  }
}

const handleClearCache = async () => {
  const result = await store.clearCache()
  if (result.success) {
    toast({
      title: '缓存已清除',
      description: '系统缓存已成功清除',
    })
  } else {
    toast({
      title: '清除失败',
      description: result.error as string,
      variant: 'destructive',
    })
  }
}

const handleSiteFieldChange = (field: string, value: any) => {
  store.markUnsaved('site')
}

const handleUserFieldChange = (field: string, value: any) => {
  store.markUnsaved('user')
}

const handleSystemFieldChange = (field: string, value: any) => {
  store.markUnsaved('system')
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- 页面头部 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">设置</h1>
          <p class="text-muted-foreground">管理系统配置和个人资料</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="store.loading" class="flex justify-center py-12">
        <Skeleton class="w-8 h-8 rounded-full" />
      </div>

      <!-- 设置内容 -->
      <template v-else>
        <SettingsTabs v-model="activeTab" :tabs="tabs">
          <!-- 站点设置 -->
          <TabsContent value="site">
            <SiteSettingsForm
              :settings="store.siteSettings"
              :loading="store.saving"
              save-mode="manual"
              @save="handleSiteSave"
              @field-change="handleSiteFieldChange"
            />
          </TabsContent>

          <!-- 用户设置 -->
          <TabsContent value="user">
            <div class="space-y-6">
              <UserProfileSettings
                :profile="store.userProfile"
                :loading="store.saving"
                save-mode="manual"
                @save="handleProfileSave"
                @field-change="handleUserFieldChange"
              />
              <ChangePasswordForm
                :loading="store.saving"
                @success="handlePasswordSuccess"
                @error="handlePasswordError"
              />
              <NotificationSettings
                :settings="store.notificationSettings"
                :loading="store.saving"
                save-mode="manual"
                @save="handleNotificationSave"
                @field-change="handleUserFieldChange"
              />
            </div>
          </TabsContent>

          <!-- 系统设置 -->
          <TabsContent value="system">
            <SystemSettings
              :settings="store.systemSettings"
              :loading="store.saving"
              save-mode="manual"
              @save="handleSystemSave"
              @field-change="handleSystemFieldChange"
              @clear-cache="handleClearCache"
            />
          </TabsContent>
        </SettingsTabs>
      </template>
    </div>
  </AdminLayout>
</template>
