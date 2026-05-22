<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const api = useAdminApi()

interface ThemeMeta {
  name: string
  version: string
  author?: string
  description?: string
  screenshot?: string
}

interface ThemeItem {
  meta: ThemeMeta
  isActive: boolean
}

const themes = ref<ThemeItem[]>([])
const loading = ref(true)
const selectedThemeName = ref('')
const message = ref('')
const errorMessage = ref('')

const selectedTheme = computed(() => themes.value.find(theme => theme.meta.name === selectedThemeName.value) || null)

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

// Theme visual config — use settings system
const { settings, loading: settingsLoading, save: saveSettings, refresh: refreshSettings } = useAdminSettings('display')
const { toRecord } = useAdminFormHelpers()

const form = reactive({
  // theme_color
  themeColorEnable: true,
  themeColorMain: '#425AEF',
  themeColorDarkMain: '#f2b94b',
  themeColorPaginator: '#425AEF',
  themeColorTextSelection: '#2128bd',
  themeColorLinkColor: 'var(--anzhiyu-fontcolor)',
  themeColorMetaColor: 'var(--anzhiyu-fontcolor)',
  themeColorHrColor: '#4259ef23',
  themeColorCodeForeground: '#fff',
  themeColorCodeBackground: 'var(--anzhiyu-code-stress)',
  themeColorTocColor: '#425AEF',
  themeColorScrollbarColor: 'var(--anzhiyu-scrollbar)',
  themeColorMetaThemeColorLight: '#f7f9fe',
  themeColorMetaThemeColorDark: '#18171d',

  // font
  fontGlobalFontSize: '16px',
  fontCodeFontSize: '',
  fontFontFamily: '',
  fontCodeFontFamily: 'consolas, Menlo, "PingFang SC", "Microsoft JhengHei", "Microsoft YaHei", sans-serif',

  // blog_title_font
  blogTitleFontLink: '',
  blogTitleFontFamily: 'PingFang SC, \'Hiragino Sans GB\', \'Microsoft JhengHei\', \'Microsoft YaHei\', sans-serif',
})

const saving = ref(false)

function hydrateForm() {
  const themeColor = toRecord(settings.value.themeColor)
  form.themeColorEnable = themeColor.enable !== undefined ? Boolean(themeColor.enable) : true
  form.themeColorMain = String(themeColor.main ?? '#425AEF')
  form.themeColorDarkMain = String(themeColor.dark_main ?? themeColor.darkMain ?? '#f2b94b')
  form.themeColorPaginator = String(themeColor.paginator ?? '#425AEF')
  form.themeColorTextSelection = String(themeColor.text_selection ?? themeColor.textSelection ?? '#2128bd')
  form.themeColorLinkColor = String(themeColor.link_color ?? themeColor.linkColor ?? 'var(--anzhiyu-fontcolor)')
  form.themeColorMetaColor = String(themeColor.meta_color ?? themeColor.metaColor ?? 'var(--anzhiyu-fontcolor)')
  form.themeColorHrColor = String(themeColor.hr_color ?? themeColor.hrColor ?? '#4259ef23')
  form.themeColorCodeForeground = String(themeColor.code_foreground ?? themeColor.codeForeground ?? '#fff')
  form.themeColorCodeBackground = String(themeColor.code_background ?? themeColor.codeBackground ?? 'var(--anzhiyu-code-stress)')
  form.themeColorTocColor = String(themeColor.toc_color ?? themeColor.tocColor ?? '#425AEF')
  form.themeColorScrollbarColor = String(themeColor.scrollbar_color ?? themeColor.scrollbarColor ?? 'var(--anzhiyu-scrollbar)')
  form.themeColorMetaThemeColorLight = String(themeColor.meta_theme_color_light ?? themeColor.metaThemeColorLight ?? '#f7f9fe')
  form.themeColorMetaThemeColorDark = String(themeColor.meta_theme_color_dark ?? themeColor.metaThemeColorDark ?? '#18171d')

  const font = toRecord(settings.value.font)
  form.fontGlobalFontSize = String(font['global-font-size'] ?? font.globalFontSize ?? '16px')
  form.fontCodeFontSize = String(font['code-font-size'] ?? font.codeFontSize ?? '')
  form.fontFontFamily = String(font['font-family'] ?? font.fontFamily ?? '')
  form.fontCodeFontFamily = String(font['code-font-family'] ?? font.codeFontFamily ?? 'consolas, Menlo, "PingFang SC", "Microsoft JhengHei", "Microsoft YaHei", sans-serif')

  const blogTitleFont = toRecord(settings.value.blogTitleFont)
  form.blogTitleFontLink = String(blogTitleFont.font_link ?? blogTitleFont.fontLink ?? '')
  form.blogTitleFontFamily = String(blogTitleFont['font-family'] ?? blogTitleFont.fontFamily ?? 'PingFang SC, \'Hiragino Sans GB\', \'Microsoft JhengHei\', \'Microsoft YaHei\', sans-serif')
}

watch(settings, () => { hydrateForm() }, { deep: true, immediate: true })

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await saveSettings({
      themeColor: {
        enable: form.themeColorEnable,
        main: form.themeColorMain.trim(),
        dark_main: form.themeColorDarkMain.trim(),
        paginator: form.themeColorPaginator.trim(),
        text_selection: form.themeColorTextSelection.trim(),
        link_color: form.themeColorLinkColor.trim(),
        meta_color: form.themeColorMetaColor.trim(),
        hr_color: form.themeColorHrColor.trim(),
        code_foreground: form.themeColorCodeForeground.trim(),
        code_background: form.themeColorCodeBackground.trim(),
        toc_color: form.themeColorTocColor.trim(),
        scrollbar_color: form.themeColorScrollbarColor.trim(),
        meta_theme_color_light: form.themeColorMetaThemeColorLight.trim(),
        meta_theme_color_dark: form.themeColorMetaThemeColorDark.trim(),
      },
      font: {
        'global-font-size': form.fontGlobalFontSize.trim(),
        'code-font-size': form.fontCodeFontSize.trim(),
        'font-family': form.fontFontFamily.trim(),
        'code-font-family': form.fontCodeFontFamily.trim(),
      },
      blogTitleFont: {
        font_link: form.blogTitleFontLink.trim(),
        'font-family': form.blogTitleFontFamily.trim(),
      },
    })

    message.value = '主题配置已保存。'
    await refreshSettings()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '主题保存失败'
  }
  finally {
    saving.value = false
  }
}

onMounted(fetchThemes)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-6">
    <header class="rounded-[28px] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] p-6 text-white shadow-lg">
      <h1 class="text-2xl font-black">主题管理</h1>
      <p class="mt-1 text-sm text-white/80">管理主题切换、配色与字体设置</p>
    </header>

    <div v-if="message" class="rounded-2xl bg-green-500/10 px-4 py-3 text-sm text-green-600">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
      {{ errorMessage }}
    </div>

    <!-- Theme List -->
    <section v-if="loading" class="rounded-[28px] border border-border/70 bg-surface/82 p-10 text-center text-muted">
      加载中...
    </section>
    <section v-else-if="themes.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="theme in themes"
        :key="theme.meta.name"
        class="group relative overflow-hidden rounded-[28px] border border-border/70 bg-surface/82 shadow-sm transition hover:shadow-md"
        :class="{ 'ring-2 ring-primary': theme.isActive }"
      >
        <div class="h-32 bg-gradient-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center">
          <img v-if="theme.meta.screenshot" :src="theme.meta.screenshot" :alt="theme.meta.name" class="h-full w-full object-cover" >
          <span v-else class="text-4xl text-primary/30">🎨</span>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-text">{{ theme.meta.name }}</h3>
            <span v-if="theme.meta.version" class="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">v{{ theme.meta.version }}</span>
            <span v-if="theme.isActive" class="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600">当前</span>
          </div>
          <p v-if="theme.meta.description" class="mt-1 text-sm text-muted line-clamp-2">{{ theme.meta.description }}</p>
          <p v-if="theme.meta.author" class="mt-1 text-xs text-muted">作者: {{ theme.meta.author }}</p>
          <div class="mt-3 flex gap-2">
            <button
              v-if="!theme.isActive"
              class="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark"
              @click="activateTheme(theme.meta.name)"
            >激活</button>
            <button
              class="rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary/25"
              @click="exportTheme(theme.meta.name)"
            >导出配置</button>
          </div>
        </div>
      </article>
    </section>
    <section v-else class="rounded-[28px] border border-border/70 bg-surface/82 p-10 text-center text-muted">
      暂无已安装主题
    </section>

    <!-- Theme Visual Config -->
    <section class="grid gap-6 xl:grid-cols-2">
      <!-- theme_color -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">主题配色</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.themeColorEnable" label="启用自定义配色" />
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">主色</span>
              <div class="flex gap-2">
                <input v-model="form.themeColorMain" type="color" class="h-11 w-11 shrink-0 cursor-pointer rounded-xl border border-border" >
                <input v-model="form.themeColorMain" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </div>
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">深色主色</span>
              <div class="flex gap-2">
                <input v-model="form.themeColorDarkMain" type="color" class="h-11 w-11 shrink-0 cursor-pointer rounded-xl border border-border" >
                <input v-model="form.themeColorDarkMain" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </div>
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">分页器色</span>
              <input v-model="form.themeColorPaginator" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">文字选中色</span>
              <input v-model="form.themeColorTextSelection" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">链接色</span>
              <input v-model="form.themeColorLinkColor" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">元信息色</span>
              <input v-model="form.themeColorMetaColor" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">分隔线色</span>
              <input v-model="form.themeColorHrColor" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">代码前景色</span>
              <input v-model="form.themeColorCodeForeground" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">代码背景色</span>
              <input v-model="form.themeColorCodeBackground" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">目录色</span>
              <input v-model="form.themeColorTocColor" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">滚动条色</span>
              <input v-model="form.themeColorScrollbarColor" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">浅色主题色（meta）</span>
              <input v-model="form.themeColorMetaThemeColorLight" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">深色主题色（meta）</span>
              <input v-model="form.themeColorMetaThemeColorDark" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </div>
      </article>

      <!-- font + blog_title_font -->
      <div class="space-y-6">
        <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h2 class="text-xl font-black text-text">全局字体</h2>
          <div class="mt-5 space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">全局字号</span>
                <input v-model="form.fontGlobalFontSize" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="16px" >
              </label>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">代码字号</span>
                <input v-model="form.fontCodeFontSize" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="留空使用默认" >
              </label>
            </div>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">正文字体族</span>
              <input v-model="form.fontFontFamily" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="留空使用默认" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">代码字体族</span>
              <input v-model="form.fontCodeFontFamily" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </article>

        <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h2 class="text-xl font-black text-text">网站标题字体</h2>
          <div class="mt-5 space-y-4">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">字体链接</span>
              <input v-model="form.blogTitleFontLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Google Fonts 链接" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">字体族</span>
              <input v-model="form.blogTitleFontFamily" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </article>
      </div>
    </section>

    <!-- Save -->
    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary"
        :disabled="settingsLoading || saving"
        @click="refreshSettings"
      >
        刷新
      </button>
      <button
        type="button"
        class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary-dark disabled:opacity-50"
        :disabled="settingsLoading || saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
    </div>
  </div>
</template>
