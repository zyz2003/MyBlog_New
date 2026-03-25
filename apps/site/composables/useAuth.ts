import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

// UserObject 类型定义
export interface UserObject {
  id: string
  username: string
  email?: string
  role: string
}

export function useAuth() {
  const authStore = useAuthStore()

  const getAuthHeaders = () => ({
    headers: {
      Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
    },
  })

  const login = async (username: string, password: string) => {
    try {
      const response = await $fetch('/api/v1/auth/login', {
        method: 'POST',
        body: { username, password },
      })

      if (response.success && response.data) {
        const { token, user } = response.data as { token: string; user: UserObject }
        authStore.setAuth(token, user)
        toast.success('登录成功', {
          description: `欢迎回来，${user.username}`,
        })
        return response.data
      } else {
        throw new Error('登录失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '用户名或密码错误'
      toast.error('登录失败', {
        description: message,
      })
      throw error
    }
  }

  const logout = async () => {
    await authStore.logout()
    toast.success('已退出登录')
  }

  return {
    login,
    logout,
    getAuthHeaders,
  }
}
