<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('display')
const { toRecord, toLines, fromLines, objectToKeyValueText, keyValueTextToObject } = useAdminFormHelpers()

const form = reactive({
  codeHighlightTheme: 'light',
  codeHighlightCopy: true,
  codeHighlightLang: true,
  codeHighlightShrink: 'none',
  codeHighlightHeightLimit: 330,
  codeWordWrap: false,

  copyEnable: true,
  copyCopyrightEnable: false,
  copyCopyrightLimitCount: 50,

  searchProvider: '',
  localSearchEnable: false,
  localSearchPreload: true,
  localSearchCDN: '',
  algoliaEnable: false,
  algoliaAppId: '',
  algoliaApiKey: '',
  algoliaIndexName: '',
  algoliaPerPage: 6,
  algoliaTagsText: '',
  docsearchEnable: false,
  docsearchAppId: '',
  docsearchApiKey: '',
  docsearchIndexName: '',
  docsearchOptionText: '',

  mathProvider: '',
  mathjaxEnable: false,
  mathjaxPerPage: false,
  katexEnable: false,
  katexPerPage: false,
  katexHideScrollbar: true,

  mermaidEnable: false,
  mermaidThemeLight: 'default',
  mermaidThemeDark: 'dark',

  noteStyle: 'flat',
  noteIcons: true,
  noteBorderRadius: 3,
  noteLightBgOffset: 0,

  tableInterlacedEnable: false,
  tableInterlacedDiscoloration: false,

  iconsAliIconfontJs: '',
  iconsFontawesome: true,
  iconsFontawesomeAnimationCss: '',

  lazyloadEnable: false,
  lazyloadField: 'site',
  lazyloadPlaceholder: '',
  lazyloadBlur: true,
  lazyloadProgressive: true,

  fancybox: true,
  mediumZoom: false,

  panguEnable: false,
  panguField: 'site',

  pjaxEnable: false,
  pjaxExcludeText: '',

  instantpage: false,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function hydrateForm() {
  const codeBlock = toRecord(settings.value.codeBlock)
  const copySettings = toRecord(settings.value.copySettings)
  const search = toRecord(settings.value.search)
  const localSearch = toRecord(settings.value.localSearch)
  const algoliaSearch = toRecord(settings.value.algoliaSearch)
  const docsearch = toRecord(settings.value.docsearch)
  const math = toRecord(settings.value.math)
  const mathjax = toRecord(settings.value.mathjax)
  const katex = toRecord(settings.value.katex)
  const mermaid = toRecord(settings.value.mermaid)
  const mermaidTheme = toRecord(mermaid.theme)
  const note = toRecord(settings.value.note)
  const tableInterlaced = toRecord(settings.value.tableInterlaced)
  const icons = toRecord(settings.value.icons)
  const lazyload = toRecord(settings.value.lazyload)
  const pangu = toRecord(settings.value.pangu)
  const pjax = toRecord(settings.value.pjax)

  form.codeHighlightTheme = String(codeBlock.highlightTheme ?? 'light')
  form.codeHighlightCopy = codeBlock.highlightCopy !== undefined ? Boolean(codeBlock.highlightCopy) : true
  form.codeHighlightLang = codeBlock.highlightLang !== undefined ? Boolean(codeBlock.highlightLang) : true
  form.codeHighlightShrink = String(codeBlock.highlightShrink ?? 'none')
  form.codeHighlightHeightLimit = Number(codeBlock.highlightHeightLimit ?? 330) || 330
  form.codeWordWrap = codeBlock.codeWordWrap !== undefined ? Boolean(codeBlock.codeWordWrap) : false

  form.copyEnable = copySettings.enable !== undefined ? Boolean(copySettings.enable) : true
  form.copyCopyrightEnable = copySettings.copyrightEnable !== undefined ? Boolean(copySettings.copyrightEnable) : false
  form.copyCopyrightLimitCount = Number(copySettings.copyrightLimitCount ?? 50) || 50

  form.searchProvider = String(search.provider ?? '')
  form.localSearchEnable = localSearch.enable !== undefined ? Boolean(localSearch.enable) : false
  form.localSearchPreload = localSearch.preload !== undefined ? Boolean(localSearch.preload) : true
  form.localSearchCDN = String(localSearch.CDN ?? '')
  form.algoliaEnable = algoliaSearch.enable !== undefined ? Boolean(algoliaSearch.enable) : false
  form.algoliaAppId = String(algoliaSearch.appId ?? '')
  form.algoliaApiKey = String(algoliaSearch.apiKey ?? '')
  form.algoliaIndexName = String(algoliaSearch.indexName ?? '')
  form.algoliaPerPage = Number(algoliaSearch.perPage ?? 6) || 6
  form.algoliaTagsText = toLines(algoliaSearch.tags)
  form.docsearchEnable = docsearch.enable !== undefined ? Boolean(docsearch.enable) : false
  form.docsearchAppId = String(docsearch.appId ?? '')
  form.docsearchApiKey = String(docsearch.apiKey ?? '')
  form.docsearchIndexName = String(docsearch.indexName ?? '')
  form.docsearchOptionText = objectToKeyValueText(docsearch.option)

  form.mathProvider = String(math.provider ?? '')
  form.mathjaxEnable = mathjax.enable !== undefined ? Boolean(mathjax.enable) : false
  form.mathjaxPerPage = mathjax.perPage !== undefined ? Boolean(mathjax.perPage) : false
  form.katexEnable = katex.enable !== undefined ? Boolean(katex.enable) : false
  form.katexPerPage = katex.perPage !== undefined ? Boolean(katex.perPage) : false
  form.katexHideScrollbar = katex.hideScrollbar !== undefined ? Boolean(katex.hideScrollbar) : true

  form.mermaidEnable = mermaid.enable !== undefined ? Boolean(mermaid.enable) : false
  form.mermaidThemeLight = String(mermaidTheme.light ?? 'default')
  form.mermaidThemeDark = String(mermaidTheme.dark ?? 'dark')

  form.noteStyle = String(note.style ?? 'flat')
  form.noteIcons = note.icons !== undefined ? Boolean(note.icons) : true
  form.noteBorderRadius = Number(note.border_radius ?? 3) || 3
  form.noteLightBgOffset = Number(note.light_bg_offset ?? 0) || 0

  form.tableInterlacedEnable = tableInterlaced.enable !== undefined ? Boolean(tableInterlaced.enable) : false
  form.tableInterlacedDiscoloration = Boolean(settings.value.table_interlaced_discoloration)

  form.iconsAliIconfontJs = String(icons.ali_iconfont_js ?? '')
  form.iconsFontawesome = icons.fontawesome !== undefined ? Boolean(icons.fontawesome) : true
  form.iconsFontawesomeAnimationCss = String(icons.fontawesome_animation_css ?? '')

  form.lazyloadEnable = lazyload.enable !== undefined ? Boolean(lazyload.enable) : false
  form.lazyloadField = String(lazyload.field ?? 'site')
  form.lazyloadPlaceholder = String(lazyload.placeholder ?? '')
  form.lazyloadBlur = lazyload.blur !== undefined ? Boolean(lazyload.blur) : true
  form.lazyloadProgressive = lazyload.progressive !== undefined ? Boolean(lazyload.progressive) : true

  form.fancybox = Boolean(settings.value.fancybox)
  form.mediumZoom = Boolean(settings.value.mediumZoom)

  form.panguEnable = pangu.enable !== undefined ? Boolean(pangu.enable) : false
  form.panguField = String(pangu.field ?? 'site')

  form.pjaxEnable = pjax.enable !== undefined ? Boolean(pjax.enable) : false
  form.pjaxExcludeText = toLines(pjax.exclude)

  form.instantpage = Boolean(settings.value.instantpage)
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      codeBlock: {
        highlightTheme: form.codeHighlightTheme,
        highlightCopy: form.codeHighlightCopy,
        highlightLang: form.codeHighlightLang,
        highlightShrink: form.codeHighlightShrink === 'none' ? false : form.codeHighlightShrink,
        highlightHeightLimit: form.codeHighlightHeightLimit,
        codeWordWrap: form.codeWordWrap,
      },
      copySettings: {
        enable: form.copyEnable,
        copyrightEnable: form.copyCopyrightEnable,
        copyrightLimitCount: form.copyCopyrightLimitCount,
      },
      search: {
        provider: form.searchProvider,
      },
      localSearch: {
        enable: form.localSearchEnable,
        preload: form.localSearchPreload,
        CDN: form.localSearchCDN.trim(),
      },
      algoliaSearch: {
        enable: form.algoliaEnable,
        appId: form.algoliaAppId.trim(),
        apiKey: form.algoliaApiKey.trim(),
        indexName: form.algoliaIndexName.trim(),
        perPage: form.algoliaPerPage,
        tags: fromLines(form.algoliaTagsText),
      },
      docsearch: {
        enable: form.docsearchEnable,
        appId: form.docsearchAppId.trim(),
        apiKey: form.docsearchApiKey.trim(),
        indexName: form.docsearchIndexName.trim(),
        option: keyValueTextToObject(form.docsearchOptionText),
      },
      math: {
        provider: form.mathProvider,
      },
      mathjax: {
        enable: form.mathjaxEnable,
        perPage: form.mathjaxPerPage,
      },
      katex: {
        enable: form.katexEnable,
        perPage: form.katexPerPage,
        hideScrollbar: form.katexHideScrollbar,
      },
      mermaid: {
        enable: form.mermaidEnable,
        theme: {
          light: form.mermaidThemeLight.trim(),
          dark: form.mermaidThemeDark.trim(),
        },
      },
      note: {
        style: form.noteStyle.trim(),
        icons: form.noteIcons,
        border_radius: form.noteBorderRadius,
        light_bg_offset: form.noteLightBgOffset,
      },
      tableInterlaced: {
        enable: form.tableInterlacedEnable,
      },
      table_interlaced_discoloration: form.tableInterlacedDiscoloration,
      icons: {
        ali_iconfont_js: form.iconsAliIconfontJs.trim(),
        fontawesome: form.iconsFontawesome,
        fontawesome_animation_css: form.iconsFontawesomeAnimationCss.trim(),
      },
      lazyload: {
        enable: form.lazyloadEnable,
        field: form.lazyloadField,
        placeholder: form.lazyloadPlaceholder.trim(),
        blur: form.lazyloadBlur,
        progressive: form.lazyloadProgressive,
      },
      fancybox: form.fancybox,
      mediumZoom: form.mediumZoom,
      pangu: {
        enable: form.panguEnable,
        field: form.panguField,
      },
      pjax: {
        enable: form.pjaxEnable,
        exclude: fromLines(form.pjaxExcludeText),
      },
      instantpage: form.instantpage,
    })

    message.value = '展示配置已保存。'
    await refresh()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败，请稍后重试。'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Display</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">展示配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里负责代码高亮、搜索、数学公式、Mermaid、图片交互和排版增强，保存后文章页与全站展示层会直接读取这些配置。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-3">
      <!-- 代码块 -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">代码块</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">高亮主题</span>
              <input v-model="form.codeHighlightTheme" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">收缩模式</span>
              <select v-model="form.codeHighlightShrink" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="none">不收缩</option>
                <option value="true">按配置收缩</option>
              </select>
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.codeHighlightCopy = !form.codeHighlightCopy">
              <span class="text-sm text-text">复制按钮</span>
              <span class="text-sm text-muted">{{ form.codeHighlightCopy ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.codeHighlightLang = !form.codeHighlightLang">
              <span class="text-sm text-text">语言标签</span>
              <span class="text-sm text-muted">{{ form.codeHighlightLang ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.codeWordWrap = !form.codeWordWrap">
              <span class="text-sm text-text">自动换行</span>
              <span class="text-sm text-muted">{{ form.codeWordWrap ? '已开启' : '已关闭' }}</span>
            </button>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">高度限制</span>
              <input v-model.number="form.codeHighlightHeightLimit" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </div>
      </article>

      <!-- 复制设置 -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">复制设置</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.copyEnable = !form.copyEnable">
              <span class="text-sm text-text">复制版权提示</span>
              <span class="text-sm text-muted">{{ form.copyEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.copyCopyrightEnable = !form.copyCopyrightEnable">
              <span class="text-sm text-text">追加版权文案</span>
              <span class="text-sm text-muted">{{ form.copyCopyrightEnable ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">版权复制阈值</span>
            <input v-model.number="form.copyCopyrightLimitCount" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>
      </article>

      <!-- 搜索 -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">搜索</h2>
        <div class="mt-5 space-y-4">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">搜索提供者</span>
            <select v-model="form.searchProvider" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="">关闭搜索</option>
              <option value="local">本地搜索</option>
              <option value="algolia">Algolia</option>
              <option value="docsearch">Docsearch</option>
            </select>
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.localSearchEnable = !form.localSearchEnable">
              <span class="text-sm text-text">启用本地搜索</span>
              <span class="text-sm text-muted">{{ form.localSearchEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.localSearchPreload = !form.localSearchPreload">
              <span class="text-sm text-text">预加载索引</span>
              <span class="text-sm text-muted">{{ form.localSearchPreload ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <input v-model="form.localSearchCDN" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="本地搜索 CDN 地址" >
          <div class="rounded-3xl border border-border bg-background/60 p-4">
            <p class="text-sm font-semibold text-text">Algolia</p>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-white/90 px-3 py-3 text-left transition hover:border-primary/20" @click="form.algoliaEnable = !form.algoliaEnable">
                <span class="text-xs text-text">启用</span>
                <span class="text-xs text-muted">{{ form.algoliaEnable ? '开' : '关' }}</span>
              </button>
              <input v-model.number="form.algoliaPerPage" type="number" min="1" class="rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每页条数" >
              <input v-model="form.algoliaAppId" type="text" class="rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="App ID" >
              <input v-model="form.algoliaApiKey" type="text" class="rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="API Key" >
            </div>
            <input v-model="form.algoliaIndexName" type="text" class="mt-3 w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="索引名" >
          </div>
          <div class="rounded-3xl border border-border bg-background/60 p-4">
            <p class="text-sm font-semibold text-text">Docsearch</p>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-white/90 px-3 py-3 text-left transition hover:border-primary/20" @click="form.docsearchEnable = !form.docsearchEnable">
                <span class="text-xs text-text">启用</span>
                <span class="text-xs text-muted">{{ form.docsearchEnable ? '开' : '关' }}</span>
              </button>
              <input v-model="form.docsearchAppId" type="text" class="rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="App ID" >
              <input v-model="form.docsearchApiKey" type="text" class="rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="API Key" >
            </div>
            <input v-model="form.docsearchIndexName" type="text" class="mt-3 w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="索引名" >
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">数学公式与图表</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">数学引擎</span>
            <select v-model="form.mathProvider" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="">关闭</option>
              <option value="mathjax">MathJax</option>
              <option value="katex">KaTeX</option>
            </select>
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.mathjaxEnable = !form.mathjaxEnable">
              <span class="text-sm text-text">启用 MathJax</span>
              <span class="text-sm text-muted">{{ form.mathjaxEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.mathjaxPerPage = !form.mathjaxPerPage">
              <span class="text-sm text-text">按页控制 MathJax</span>
              <span class="text-sm text-muted">{{ form.mathjaxPerPage ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.katexEnable = !form.katexEnable">
              <span class="text-sm text-text">启用 KaTeX</span>
              <span class="text-sm text-muted">{{ form.katexEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.katexPerPage = !form.katexPerPage">
              <span class="text-sm text-text">按页控制 KaTeX</span>
              <span class="text-sm text-muted">{{ form.katexPerPage ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20 md:col-span-2" @click="form.katexHideScrollbar = !form.katexHideScrollbar">
              <span class="text-sm text-text">隐藏公式滚动条</span>
              <span class="text-sm text-muted">{{ form.katexHideScrollbar ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <div class="rounded-3xl border border-border bg-background/60 p-5">
            <h3 class="text-lg font-black text-text">Mermaid</h3>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-white/90 px-4 py-4 text-left transition hover:border-primary/20 md:col-span-1" @click="form.mermaidEnable = !form.mermaidEnable">
                <span class="text-sm text-text">启用 Mermaid</span>
                <span class="text-sm text-muted">{{ form.mermaidEnable ? '已开启' : '已关闭' }}</span>
              </button>
              <input v-model="form.mermaidThemeLight" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="浅色主题" >
              <input v-model="form.mermaidThemeDark" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="深色主题" >
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">图文增强</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">Note 样式</span>
              <input v-model="form.noteStyle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">边角圆角</span>
              <input v-model.number="form.noteBorderRadius" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">浅色背景偏移</span>
              <input v-model.number="form.noteLightBgOffset" type="number" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">Ali Iconfont JS</span>
              <input v-model="form.iconsAliIconfontJs" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.noteIcons = !form.noteIcons">
              <span class="text-sm text-text">Note 图标</span>
              <span class="text-sm text-muted">{{ form.noteIcons ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tableInterlacedEnable = !form.tableInterlacedEnable">
              <span class="text-sm text-text">表格交错行</span>
              <span class="text-sm text-muted">{{ form.tableInterlacedEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tableInterlacedDiscoloration = !form.tableInterlacedDiscoloration">
              <span class="text-sm text-text">斑马纹着色</span>
              <span class="text-sm text-muted">{{ form.tableInterlacedDiscoloration ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.iconsFontawesome = !form.iconsFontawesome">
              <span class="text-sm text-text">Font Awesome</span>
              <span class="text-sm text-muted">{{ form.iconsFontawesome ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.fancybox = !form.fancybox">
              <span class="text-sm text-text">Fancybox</span>
              <span class="text-sm text-muted">{{ form.fancybox ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.mediumZoom = !form.mediumZoom">
              <span class="text-sm text-text">Medium Zoom</span>
              <span class="text-sm text-muted">{{ form.mediumZoom ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">Font Awesome 动画样式地址</span>
            <input v-model="form.iconsFontawesomeAnimationCss" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">懒加载与排版</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.lazyloadEnable = !form.lazyloadEnable">
              <span class="text-sm text-text">启用图片懒加载</span>
              <span class="text-sm text-muted">{{ form.lazyloadEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.lazyloadBlur = !form.lazyloadBlur">
              <span class="text-sm text-text">启用模糊占位</span>
              <span class="text-sm text-muted">{{ form.lazyloadBlur ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.lazyloadProgressive = !form.lazyloadProgressive">
              <span class="text-sm text-text">渐进加载</span>
              <span class="text-sm text-muted">{{ form.lazyloadProgressive ? '已开启' : '已关闭' }}</span>
            </button>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">作用范围</span>
              <select v-model="form.lazyloadField" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="site">全站</option>
                <option value="post">文章页</option>
              </select>
            </label>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">懒加载占位图</span>
            <input v-model="form.lazyloadPlaceholder" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>

          <div class="mt-2 h-px bg-border/70" />

          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.panguEnable = !form.panguEnable">
              <span class="text-sm text-text">启用中英文空格优化</span>
              <span class="text-sm text-muted">{{ form.panguEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">Pangu 作用范围</span>
              <select v-model="form.panguField" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="site">全站</option>
                <option value="post">文章页</option>
              </select>
            </label>
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">页面交互</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.pjaxEnable = !form.pjaxEnable">
              <span class="text-sm text-text">启用 PJAX</span>
              <span class="text-sm text-muted">{{ form.pjaxEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.instantpage = !form.instantpage">
              <span class="text-sm text-text">启用 Instant.page</span>
              <span class="text-sm text-muted">{{ form.instantpage ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">PJAX 排除路径</span>
            <textarea v-model="form.pjaxExcludeText" rows="6" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个排除路径，例如 /admin /friends" />
          </label>
        </div>
      </article>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary"
        :disabled="loading || saving"
        @click="refresh"
      >
        刷新
      </button>
      <button
        type="button"
        class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60"
        :disabled="loading || saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存展示配置' }}
      </button>
    </div>
  </div>
</template>
