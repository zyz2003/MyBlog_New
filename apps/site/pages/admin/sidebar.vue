<script setup lang="ts">
const api = useAdminApi()

const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Sidebar settings
const sidebar = ref({
  enabled: true,
  widgets: ['profile', 'stats', 'tags', 'categories', 'recent'] as string[],
})

// Widget options
const widgetOptions = [
  { value: 'profile', label: '博主信息', icon: 'i-heroicons-user' },
  { value: 'stats', label: '网站统计', icon: 'i-heroicons-chart-bar' },
  { value: 'tags', label: '标签云', icon: 'i-heroicons-tag' },
  { value: 'categories', label: '分类', icon: 'i-heroicons-folder' },
  { value: 'archive', label: '归档', icon: 'i-heroicons-archive' },
  { value: 'friends', label: '友链', icon: 'i-heroicons-link' },
  { value: 'recent', label: '最新文章', icon: 'i-heroicons-clock' },
]

// Fetch settings
async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')

    const allSettings: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        allSettings[row.key] = row.value
      }
    }

    sidebar.value = {
      enabled: allSettings.homepageSidebarEnabled !== undefined ? Boolean(allSettings.homepageSidebarEnabled) : true,
      widgets: (allSettings.homepageSidebarWidgets as string[]) || ['profile', 'stats', 'tags', 'categories', 'recent'],
    }
  }
  catch (e) {
    console.error('Failed to fetch settings:', e)
  }
  finally {
    loading.value = false
  }
}

// Save settings
async function handleSave() {
  saving.value = true
  saveSuccess.value = false

  try {
    const items = [
      { key: 'homepageSidebarEnabled', value: sidebar.value.enabled, category: 'homepage' },
      { key: 'homepageSidebarWidgets', value: sidebar.value.widgets, category: 'homepage' },
    ]

    await api.put('/api/settings', items)
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存失败'
    alert(message)
  }
  finally {
    saving.value = false
  }
}

// Toggle widget
function toggleWidget(value: string) {
  const idx = sidebar.value.widgets.indexOf(value)
  if (idx === -1) {
    sidebar.value.widgets.push(value)
  }
  else {
    sidebar.value.widgets.splice(idx, 1)
  }
}

// Check if widget is selected
function isWidgetSelected(value: string): boolean {
  return sidebar.value.widgets.includes(value)
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-rectangles-stack w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">侧栏设置</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" />
          保存成功
        </span>
        <button
          class="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          :disabled="saving"
          :class="{ 'opacity-50 cursor-not-allowed': saving }"
          @click="handleSave"
        >
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-32 bg-surface-2 rounded-xl animate-pulse" />
      <div class="h-64 bg-surface rounded animate-pulse" />
    </div>

    <!-- Settings -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main settings -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Sidebar Toggle -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-view-columns w-5 h-5 text-primary" />
            侧栏显示
          </h2>
          <p class="text-sm text-muted mb-4">控制前台首页侧边栏的显示</p>

          <div class="flex items-center justify-between py-3 border-b border-border">
            <div>
              <label class="font-medium text-text">显示侧边栏</label>
              <p class="text-xs text-muted">关闭后文章列表将占满宽度</p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              :class="sidebar.enabled ? 'bg-primary' : 'bg-surface-2'"
              @click="sidebar.enabled = !sidebar.enabled"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="sidebar.enabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Widget Selection -->
        <div v-if="sidebar.enabled" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-squares-2x2 w-5 h-5 text-primary" />
            侧栏组件
          </h2>
          <p class="text-sm text-muted mb-4">选择要在侧栏显示的组件（拖拽可调整顺序）</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="widget in widgetOptions"
              :key="widget.value"
              class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer"
              :class="isWidgetSelected(widget.value)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'"
              @click="toggleWidget(widget.value)"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                :class="isWidgetSelected(widget.value) ? 'bg-primary text-white' : 'bg-surface-2 text-muted'"
              >
                <span :class="widget.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <span class="font-medium text-text">{{ widget.label }}</span>
              </div>
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                :class="isWidgetSelected(widget.value)
                  ? 'border-primary bg-primary'
                  : 'border-muted'"
              >
                <span v-if="isWidgetSelected(widget.value)" class="i-heroicons-check w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar - Preview -->
      <div class="space-y-6">
        <!-- Preview -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" />
            效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问前台查看效果</p>
          <NuxtLink
            to="/"
            target="_blank"
            class="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" />
            预览首页
          </NuxtLink>
        </div>

        <!-- Selected Widgets Order -->
        <div v-if="sidebar.enabled" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-list-bullet w-5 h-5 text-primary" />
            当前顺序
          </h2>
          <div class="space-y-2">
            <div
              v-for="(widgetValue, index) in sidebar.widgets"
              :key="widgetValue"
              class="flex items-center gap-3 p-2 bg-surface-2 rounded-lg"
            >
              <span class="text-xs text-muted w-6">{{ index + 1 }}</span>
              <span
                :class="widgetOptions.find(w => w.value === widgetValue)?.icon"
                class="w-4 h-4 text-muted"
              />
              <span class="text-sm text-text">
                {{ widgetOptions.find(w => w.value === widgetValue)?.label }}
              </span>
            </div>
          </div>
          <p class="text-xs text-muted mt-3">点击组件卡片可添加/移除</p>
        </div>
      </div>
    </div>
  </div>
</template>