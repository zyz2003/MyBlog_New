<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

interface ThemeItem {
  meta: {
    name: string
    label: string
    version: string
    author?: string
    description?: string
  }
  config: Record<string, unknown>
  isActive: boolean
}

const themes = ref<ThemeItem[]>([])
const loading = ref(true)

async function fetchThemes() {
  loading.value = true
  try {
    themes.value = await api.get<ThemeItem[]>('/api/themes')
  }
  catch (e) {
    console.error('Failed to fetch themes:', e)
  }
  finally {
    loading.value = false
  }
}

async function handleActivate(name: string) {
  try {
    await api.post(`/api/themes/${name}/activate`)
    await fetchThemes()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to activate theme'
    alert(message)
  }
}

onMounted(() => {
  fetchThemes()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Themes</h1>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-48 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="themes.length === 0" class="text-center py-12 card">
      <span class="i-heroicons-paint-brush w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">No themes installed</p>
    </div>

    <!-- Theme cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminThemesThemeCard
        v-for="theme in themes"
        :key="theme.meta.name"
        :theme="theme"
        @activate="handleActivate"
      />
    </div>
  </div>
</template>
