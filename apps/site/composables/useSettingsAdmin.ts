import { useSettingsAdminStore } from '~/stores/settingsAdmin'
import { useToast } from '~/components/ui/toast/use-toast'

export function useSettingsAdmin() {
  const store = useSettingsAdminStore()
  const { toast } = useToast()

  const handleSiteSave = async (data: unknown) => {
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

  const handleProfileSave = async (data: unknown) => {
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

  const handleAvatarUpload = async (file: File) => {
    const result = await store.uploadAvatar(file)
    if (result.success) {
      toast({
        title: '头像上传成功',
        description: '头像已更新',
      })
      return result.url
    } else {
      toast({
        title: '头像上传失败',
        description: result.error as string,
        variant: 'destructive',
      })
      throw new Error(result.error as string)
    }
  }

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    const result = await store.changePassword(data)
    if (result.success) {
      toast({
        title: '密码已修改',
        description: '请使用新密码重新登录',
      })
    } else {
      toast({
        title: '修改失败',
        description: result.error as string,
        variant: 'destructive',
      })
    }
  }

  const handleNotificationSave = async (data: unknown) => {
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

  const handleSystemSave = async (data: unknown) => {
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

  return {
    store,
    handleSiteSave,
    handleProfileSave,
    handleAvatarUpload,
    handlePasswordChange,
    handleNotificationSave,
    handleSystemSave,
    handleClearCache,
  }
}
