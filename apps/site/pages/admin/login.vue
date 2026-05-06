<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
})

const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await login(username.value, password.value)
    await navigateTo('/admin')
  }
  catch (e: unknown) {
    // Extract error message from API response
    if (e && typeof e === 'object' && 'data' in e) {
      const errData = (e as { data?: { message?: string } }).data
      error.value = errData?.message || '登录失败'
    }
    else if (e instanceof Error) {
      error.value = e.message
    }
    else {
      error.value = '登录失败'
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <!-- Logo / Title -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">博客后台</h1>
      <p class="text-sm text-gray-500 mt-1">登录以管理你的博客</p>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
      <!-- Error message -->
      <div
        v-if="error"
        class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600"
      >
        {{ error }}
      </div>

      <!-- Username -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
          用户名
        </label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          autocomplete="username"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          autocomplete="current-password"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
      >
        <span v-if="loading" class="i-heroicons-arrow-path w-5 h-5 animate-spin" />
        <span>{{ loading ? '登录中...' : '登录' }}</span>
      </button>
    </form>
  </div>
</template>
