<script setup lang="ts">
definePageMeta({
  layout: 'admin-auth',
})

const { login, isAuthenticated } = useAuth()

const username = ref('admin')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

watchEffect(() => {
  if (isAuthenticated.value) {
    navigateTo('/admin')
  }
})

async function handleSubmit() {
  loading.value = true
  errorMessage.value = ''

  try {
    await login(username.value.trim(), password.value)
    await navigateTo('/admin')
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : '登录失败，请检查用户名和密码。'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Admin Access</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">登录后台</h1>
      <p class="mt-2 text-sm leading-7 text-muted">
        登录后即可继续管理文章、页面、前台配置和主题能力。
      </p>
    </div>

    <div class="space-y-4">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-text">用户名</span>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="请输入后台用户名"
        >
      </label>

      <label class="block space-y-2">
        <span class="text-sm font-medium text-text">密码</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="请输入后台密码"
        >
      </label>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
    >
      {{ errorMessage }}
    </div>

    <button
      type="submit"
      class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      :disabled="loading"
    >
      <span
        v-if="loading"
        class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      />
      <span>{{ loading ? '登录中...' : '进入后台' }}</span>
    </button>
  </form>
</template>
