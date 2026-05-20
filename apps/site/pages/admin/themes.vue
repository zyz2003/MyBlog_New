<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string | number>
  borderRadius: Record<string, string | number>
  layout: Record<string, string | string[] | boolean>
}

interface ThemeMeta {
  name: string
  version: string
  author?: string
  description?: string
  screenshot?: string
}

interface ThemeItem {
  meta: ThemeMeta
  config: ThemeConfig
  isActive: boolean
}

const api = useAdminApi()

const themes = ref<ThemeItem[]>([])
const loading = ref(true)
const selectedThemeName = ref('')
const editor = reactive({
  colorsJson: '{}',
  fontsJson: '{}',
  spacingJson: '{}',
  borderRadiusJson: '{}',
  layoutJson: '{}',
})
const message = ref('')
const errorMessage = ref('')
const saving = ref(false)
const importing = ref(false)
const importName = ref('')
const importPayload = ref('')

const selectedTheme = computed(() => themes.value.find(theme => theme.meta.name === selectedThemeName.value) || null)

function stringify(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function syncEditorFromTheme(theme: ThemeItem | null) {
  if (!theme) return
  editor.colorsJson = stringify(theme.config.colors)
  editor.fontsJson = stringify(theme.config.fonts)
  editor.spacingJson = stringify(theme.config.spacing)
  editor.borderRadiusJson = stringify(theme.config.borderRadius)
  editor.layoutJson = stringify(theme.config.layout)
}

watch(selectedTheme, (theme) => {
  syncEditorFromTheme(theme)
}, { immediate: true })

async function fetchThemes() {
  loading.value = true
  try {
    themes.value = await api.get<ThemeItem[]>('/api/themes')
    const active = themes.value.find(theme => theme.isActive)
    selectedThemeName.value = active?.meta.name || themes.value[0]?.meta.name || ''
  }
  finally {
    loading.value = false
  }
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value)
  }
  catch {
    throw new Error(`${label} 不是合法的 JSON。`)
  }
}

async function activateTheme(name: string) {
  message.value = ''
  errorMessage.value = ''
  try {
    await api.post(`/api/themes/${name}/activate`)
    await fetchThemes()
    message.value = `主题 ${name} 已激活。`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '主题激活失败'
  }
}

async function saveTheme() {
  if (!selectedTheme.value) return

  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const payload: ThemeConfig = {
      colors: parseJson(editor.colorsJson, '颜色配置'),
      fonts: parseJson(editor.fontsJson, '字体配置'),
      spacing: parseJson(editor.spacingJson, '间距配置'),
      borderRadius: parseJson(editor.borderRadiusJson, '圆角配置'),
      layout: parseJson(editor.layoutJson, '布局配置'),
    }

    await api.post(`/api/themes/${selectedTheme.value.meta.name}/config`, payload)
    await fetchThemes()
    message.value = '主题配置已保存。'
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '主题保存失败'
  }
  finally {
    saving.value = false
  }
}

async function exportTheme(name: string) {
  try {
    const response = await $fetch<{ code: number, data: unknown }>(`/api/themes/export?name=${encodeURIComponent(name)}`)
    await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    message.value = `主题 ${name} 的配置已复制到剪贴板。`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '导出主题失败'
  }
}

async function importTheme() {
  importing.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const parsed = parseJson(importPayload.value, '导入配置') as Record<string, unknown>
    await $fetch('/api/themes/import', {
      method: 'POST',
      body: {
        name: importName.value.trim(),
        config: parsed,
      },
    })
    await fetchThemes()
    message.value = `主题 ${importName.value.trim()} 已导入。`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '导入主题失败'
  }
  finally {
    importing.value = false
  }
}

onMounted(fetchThemes)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Platform</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">主题管理</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        管理可用主题、切换激活主题，并直接编辑主题的颜色、字体、间距和布局配置。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-black text-text">可用主题</h2>
          <span class="text-sm text-muted">{{ themes.length }} 个主题</span>
        </div>

        <div class="mt-5 space-y-3">
          <button
            v-for="theme in themes"
            :key="theme.meta.name"
            class="w-full rounded-[24px] border px-5 py-4 text-left transition"
            :class="selectedThemeName === theme.meta.name
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/70 bg-background/72 hover:border-primary/20'"
            @click="selectedThemeName = theme.meta.name"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-text">{{ theme.meta.name }}</h3>
                  <span
                    v-if="theme.isActive"
                    class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600"
                  >
                    当前激活
                  </span>
                </div>
                <p class="mt-1 text-sm text-muted">{{ theme.meta.description || '暂无主题描述' }}</p>
                <p class="mt-2 text-xs text-muted">版本 {{ theme.meta.version }}<span v-if="theme.meta.author"> · {{ theme.meta.author }}</span></p>
              </div>

              <div class="flex gap-2">
                <button
                  class="rounded-xl border border-border bg-white/80 px-3 py-2 text-xs font-semibold text-text transition hover:text-primary"
                  @click.stop="exportTheme(theme.meta.name)"
                >
                  导出
                </button>
                <button
                  class="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                  :disabled="theme.isActive"
                  @click.stop="activateTheme(theme.meta.name)"
                >
                  {{ theme.isActive ? '已启用' : '启用' }}
                </button>
              </div>
            </div>
          </button>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-black text-text">主题配置编辑器</h2>
          <span v-if="selectedTheme" class="text-sm text-muted">{{ selectedTheme.meta.name }}</span>
        </div>

        <div v-if="selectedTheme" class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">颜色 `colors`</span>
            <textarea v-model="editor.colorsJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">字体 `fonts`</span>
            <textarea v-model="editor.fontsJson" rows="6" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">间距 `spacing`</span>
            <textarea v-model="editor.spacingJson" rows="6" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">圆角 `borderRadius`</span>
            <textarea v-model="editor.borderRadiusJson" rows="6" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">布局 `layout`</span>
            <textarea v-model="editor.layoutJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>

          <div class="flex justify-end">
            <button
              class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60"
              :disabled="saving"
              @click="saveTheme"
            >
              {{ saving ? '保存中...' : '保存主题配置' }}
            </button>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">导入主题配置</h2>
      <div class="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">主题名称</span>
          <input
            v-model="importName"
            type="text"
            placeholder="例如：anzhiyu-custom"
            class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">配置 JSON</span>
          <textarea
            v-model="importPayload"
            rows="10"
            class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="{ &quot;colors&quot;: {}, &quot;fonts&quot;: {}, &quot;spacing&quot;: {}, &quot;borderRadius&quot;: {}, &quot;layout&quot;: {} }"
          />
        </label>
      </div>
      <div class="mt-5 flex justify-end">
        <button
          class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary disabled:opacity-60"
          :disabled="importing || !importName.trim() || !importPayload.trim()"
          @click="importTheme"
        >
          {{ importing ? '导入中...' : '导入主题配置' }}
        </button>
      </div>
    </section>
  </div>
</template>
