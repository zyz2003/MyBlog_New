import { defineStore } from 'pinia'

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

interface NotificationSettings {
  emailNotifications: {
    newComments: boolean
    systemUpdates: boolean
    securityAlerts: boolean
  }
  browserNotifications: boolean
  frequency: 'immediate' | 'hourly' | 'daily'
}

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

interface SettingsAdminState {
  siteSettings: SiteSettings | null
  userProfile: UserProfile | null
  notificationSettings: NotificationSettings | null
  systemSettings: SystemSettings | null
  loading: boolean
  saving: boolean
  activeTab: string
  unsavedChanges: {
    site: boolean
    user: boolean
    system: boolean
  }
}

export const useSettingsAdminStore = defineStore('settingsAdmin', {
  state: (): SettingsAdminState => ({
    siteSettings: null,
    userProfile: null,
    notificationSettings: null,
    systemSettings: null,
    loading: false,
    saving: false,
    activeTab: 'site',
    unsavedChanges: {
      site: false,
      user: false,
      system: false,
    },
  }),

  actions: {
    async fetchAllSettings() {
      this.loading = true
      try {
        const [site, user, notifications, system] = await Promise.all([
          $fetch('/api/v1/settings/site'),
          $fetch('/api/v1/users/me'),
          $fetch('/api/v1/users/me/notifications'),
          $fetch('/api/v1/settings/system'),
        ])

        this.siteSettings = site
        this.userProfile = user
        this.notificationSettings = notifications
        this.systemSettings = system
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        // Initialize with empty objects if API doesn't exist yet
        this.siteSettings = {
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
        }
        this.userProfile = {
          id: '',
          email: '',
          displayName: '',
          bio: '',
          socialLinks: {},
        }
        this.notificationSettings = {
          emailNotifications: {
            newComments: true,
            systemUpdates: true,
            securityAlerts: true,
          },
          browserNotifications: false,
          frequency: 'immediate',
        }
        this.systemSettings = {
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
        }
      } finally {
        this.loading = false
      }
    },

    async saveSiteSettings(data: Partial<SiteSettings>) {
      this.saving = true
      try {
        const result = await $fetch('/api/v1/settings/site', {
          method: 'PUT',
          body: data,
        })
        this.siteSettings = { ...this.siteSettings, ...result } as SiteSettings
        this.unsavedChanges.site = false
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '保存失败' }
      } finally {
        this.saving = false
      }
    },

    async saveUserProfile(data: Partial<UserProfile>) {
      this.saving = true
      try {
        const result = await $fetch('/api/v1/users/me', {
          method: 'PUT',
          body: data,
        })
        this.userProfile = { ...this.userProfile, ...result } as UserProfile
        this.unsavedChanges.user = false
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '保存失败' }
      } finally {
        this.saving = false
      }
    },

    async uploadAvatar(file: File) {
      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const result = await $fetch('/api/v1/users/me/avatar', {
          method: 'PUT',
          body: formData,
        })
        if (this.userProfile) {
          this.userProfile.avatar = (result as any).avatar
        }
        return { success: true, url: (result as any).avatar }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '上传失败' }
      }
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
      try {
        await $fetch('/api/v1/users/me/password', {
          method: 'PUT',
          body: data,
        })
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '修改失败' }
      }
    },

    async saveNotificationSettings(data: NotificationSettings) {
      this.saving = true
      try {
        const result = await $fetch('/api/v1/users/me/notifications', {
          method: 'PUT',
          body: data,
        })
        this.notificationSettings = result as NotificationSettings
        this.unsavedChanges.user = false
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '保存失败' }
      } finally {
        this.saving = false
      }
    },

    async saveSystemSettings(data: SystemSettings) {
      this.saving = true
      try {
        const result = await $fetch('/api/v1/settings/system', {
          method: 'PUT',
          body: data,
        })
        this.systemSettings = result as SystemSettings
        this.unsavedChanges.system = false
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '保存失败' }
      } finally {
        this.saving = false
      }
    },

    async clearCache() {
      try {
        await $fetch('/api/v1/settings/system/cache', { method: 'DELETE' })
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '清除失败' }
      }
    },

    setActiveTab(tab: string) {
      this.activeTab = tab
    },

    markUnsaved(tab: 'site' | 'user' | 'system') {
      this.unsavedChanges[tab] = true
    },
  },
})
