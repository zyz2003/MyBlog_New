<script setup lang="ts">
interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, number>
  borderRadius: Record<string, number>
  layout: Record<string, string | string[] | boolean>
}

const api = useAdminApi()

const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

const defaultConfig: ThemeConfig = {
  colors: {
    primary: '#425AEF',
    secondary: '#6B7280',
    accent: '#F2B94B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textMuted: '#9CA3AF',
  },
  fonts: {
    heading: '"Noto Sans SC", sans-serif',
    body: 'system-ui, sans-serif',
    mono: '"Fira Code", monospace',
  },
  spacing: { unit: 8, containerMax: 1200, contentPadding: 24 },
  borderRadius: { small: 4, medium: 8, large: 16 },
  layout: {
    headerPosition: 'sticky',
    sidebarPosition: 'right',
    footerStyle: 'simple',
    showSidebar: true,
  },
}

const config = ref<ThemeConfig>({ ...defaultConfig })

async function fetchConfig() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const allSettings: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        allSettings[row.key] = row.value
      }
    }
    if (allSettings.themeConfig) {
      const saved = allSettings.themeConfig as ThemeConfig
      config.value = {
        colors: { ...defaultConfig.colors, ...saved.colors },
        fonts: { ...defaultConfig.fonts, ...saved.fonts },
        spacing: { ...defaultConfig.spacing, ...saved.spacing },
        borderRadius: { ...defaultConfig.borderRadius, ...saved.borderRadius },
        layout: { ...defaultConfig.layout, ...saved.layout },
      }
    }
  } catch (e) {
    console.error('Failed to fetch theme config:', e)
  } finally {
    loading.value = false
  }
}

async function handleSave(themeConfig: ThemeConfig) {
  saving.value = true
  saveSuccess.value = false
  try {
    await api.put('/api/settings', [
      { key: 'themeConfig', value: themeConfig, category: 'theme' },
    ])
    config.value = themeConfig
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存失败'
    alert(message)
  } finally {
    saving.value = false
  }
}

function handleExport() {
  const blob = new Blob([JSON.stringify(config.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'theme-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-paint-brush w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">主题管理</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" />
          保存成功
        </span>
        <span v-if="saving" class="text-sm text-muted flex items-center gap-1">
          <span class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          保存中...
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-96 bg-surface-2 rounded-xl animate-pulse" />
    </div>

    <!-- Theme Customizer -->
    <div v-else>
      <AdminThemesThemeCustomizer
        :config="config"
        active-theme="default"
        @save="handleSave"
        @export="handleExport"
      />
    </div>
  </div>
</template>
