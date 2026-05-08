<script setup lang="ts">
import { CSSVariablesMap } from '~/server/core/theme/types'

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()
const { themeConfig, applyThemeStyles } = useTheme()

interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, number>
  borderRadius: Record<string, number>
  layout: Record<string, string | string[] | boolean>
}

interface ThemeConfigApi {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string | number>
  borderRadius: Record<string, string | number>
  layout: Record<string, string | string[] | boolean>
}

interface ThemeItem {
  meta: {
    name: string
    label: string
    version: string
    author?: string
    description?: string
  }
  config: ThemeConfigApi
  isActive: boolean
}

const themes = ref<ThemeItem[]>([])
const loading = ref(true)
const showCustomizer = ref(false)
const selectedTheme = ref<ThemeItem | null>(null)
const customizerConfig = ref<ThemeConfig | null>(null)
const showImportModal = ref(false)
const importTargetTheme = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

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
    const message = e instanceof Error ? e.message : '启用主题失败'
    alert(message)
  }
}

function handleCustomize(theme: ThemeItem) {
  selectedTheme.value = theme
  // Convert spacing/borderRadius from strings to numbers for ThemeCustomizer
  const config = theme.config as ThemeConfig
  customizerConfig.value = {
    colors: { ...config.colors },
    fonts: { ...config.fonts },
    spacing: Object.fromEntries(
      Object.entries(config.spacing).map(([k, v]) => [k, Number(v)]),
    ),
    borderRadius: Object.fromEntries(
      Object.entries(config.borderRadius).map(([k, v]) => [k, Number(v)]),
    ),
    layout: { ...config.layout },
  }
  showCustomizer.value = true
}

async function handleSaveConfig(config: ThemeConfig) {
  if (!selectedTheme.value) return
  try {
    await api.post(`/api/themes/${selectedTheme.value.meta.name}/config`, config)
    showCustomizer.value = false
    await fetchThemes()

    // If saved theme is the active theme, re-apply CSS variables immediately
    if (selectedTheme.value.isActive) {
      // Convert numbers back to strings with px suffix for CSS variables
      const vars: Record<string, string> = {}
      for (const [key, value] of Object.entries(config.colors)) {
        vars[`--color-${key === 'textMuted' ? 'text-muted' : key}`] = value
      }
      for (const [key, value] of Object.entries(config.fonts)) {
        vars[`--font-${key}`] = value
      }
      vars['--spacing-unit'] = `${config.spacing.unit}px`
      vars['--container-max'] = `${config.spacing.containerMax}px`
      vars['--content-padding'] = `${config.spacing.contentPadding}px`
      for (const [key, value] of Object.entries(config.borderRadius)) {
        vars[`--radius-${key}`] = `${value}px`
      }
      for (const [key, value] of Object.entries(config.layout)) {
        if (typeof value === 'string') {
          vars[`--layout-${key}`] = value
        }
      }
      // Apply directly to DOM
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        for (const [key, value] of Object.entries(vars)) {
          root.style.setProperty(key, value)
        }
      }
    }
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存配置失败'
    alert(message)
  }
}

function handleExport() {
  if (!selectedTheme.value || !customizerConfig.value) return
  const data = {
    name: selectedTheme.value.meta.name,
    version: selectedTheme.value.meta.version,
    config: customizerConfig.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedTheme.value.meta.name}-theme-config.json`
  a.click()
  URL.revokeObjectURL(url)
}

function openImportModal(themeName: string) {
  importTargetTheme.value = themeName
  showImportModal.value = true
  nextTick(() => {
    fileInputRef.value?.click()
  })
}

async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // If importing to existing theme, wrap the config
    const payload = data.config
      ? { name: importTargetTheme.value, config: data.config }
      : data

    await api.post('/api/themes/import', payload)
    showImportModal.value = false
    await fetchThemes()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '导入配置失败'
    alert(message)
  }

  target.value = ''
}

onMounted(() => {
  fetchThemes()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">主题管理</h1>
      <div class="flex gap-2">
        <!-- Import dropdown -->
        <div class="relative">
          <button
            class="btn-secondary flex items-center gap-2"
            @click="showImportModal = !showImportModal"
          >
            <span class="i-heroicons-arrow-down-tray w-4 h-4" />
            导入配置
          </button>
          <div
            v-if="showImportModal"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
          >
            <p class="px-4 py-2 text-xs text-gray-500">选择要导入配置的主题</p>
            <div class="border-t border-gray-100">
              <button
                v-for="theme in themes"
                :key="theme.meta.name"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                @click="openImportModal(theme.meta.name)"
              >
                {{ theme.meta.label || theme.meta.name }}
              </button>
            </div>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileImport"
        >
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-48 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="themes.length === 0" class="text-center py-12 card">
      <span class="i-heroicons-paint-brush w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">暂无主题</p>
    </div>

    <!-- Theme cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminThemesThemeCard
        v-for="theme in themes"
        :key="theme.meta.name"
        :theme="theme"
        @activate="handleActivate"
        @customize="handleCustomize"
      />
    </div>

    <!-- Theme Customizer Modal -->
    <Teleport to="body">
      <div v-if="showCustomizer && customizerConfig" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="showCustomizer = false" />

        <!-- Modal -->
        <div class="absolute inset-4 md:inset-8 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 class="text-xl font-bold text-gray-900">主题定制</h2>
              <p class="text-sm text-gray-500">{{ selectedTheme?.meta.label }} - {{ selectedTheme?.meta.name }}</p>
            </div>
            <button
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              @click="showCustomizer = false"
            >
              <span class="i-heroicons-x-mark w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <AdminThemesThemeCustomizer
              :config="customizerConfig"
              :active-theme="selectedTheme?.meta.name || ''"
              @save="handleSaveConfig"
              @export="handleExport"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
