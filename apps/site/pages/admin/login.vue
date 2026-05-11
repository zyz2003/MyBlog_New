<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'admin-auth',
})

const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

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
  <form @submit.prevent="handleLogin" class="space-y-6">
    <!-- Error message -->
    <div
      v-if="error"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"
    >
      <span class="i-heroicons-exclamation-circle w-4 h-4 inline mr-1" />
      {{ error }}
    </div>

    <!-- Username -->
    <div>
      <label for="username" class="block text-sm font-medium text-amber-800 dark:text-gray-300 mb-2">
        用户名
      </label>
      <div class="relative">
        <span class="i-heroicons-user absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          autocomplete="username"
          class="w-full pl-10 pr-4 py-3 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 dark:text-white placeholder-amber-300 dark:placeholder-gray-400 transition-all"
        >
      </div>
    </div>

    <!-- Password -->
    <div>
      <label for="password" class="block text-sm font-medium text-amber-800 dark:text-gray-300 mb-2">
        密码
      </label>
      <div class="relative">
        <span class="i-heroicons-lock-closed absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          autocomplete="current-password"
          class="w-full pl-10 pr-12 py-3 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 dark:text-white placeholder-amber-300 dark:placeholder-gray-400 transition-all"
        >
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 dark:hover:text-gray-300 cursor-pointer"
          @click="showPassword = !showPassword"
        >
          <span v-if="showPassword" class="i-heroicons-eye-slash w-5 h-5" />
          <span v-else class="i-heroicons-eye w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
    >
      <span v-if="loading" class="i-heroicons-arrow-path w-5 h-5 animate-spin" />
      <span>{{ loading ? '登录中...' : '登录' }}</span>
    </button>
  </form>
</template>