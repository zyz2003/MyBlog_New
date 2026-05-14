<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Code blocks
const codeBlock = ref({
  highlightTheme: 'light' as string,
  highlightCopy: true,
  highlightLang: true,
  highlightShrink: false,
  highlightHeightLimit: 330,
  codeWordWrap: false,
})

// Copy settings
const copySettings = ref({
  enable: true,
  copyrightEnable: false,
  copyrightLimitCount: 50,
})

// Search
const search = ref({
  provider: '' as string, // '' | 'local' | 'algolia' | 'docsearch'
})

const localSearch = ref({
  enable: false,
  preload: true,
})

const algoliaSearch = ref({
  enable: false,
  perPage: 6,
})

const docsearch = ref({
  enable: false,
  appId: '',
  apiKey: '',
  indexName: '',
})

// Math
const math = ref({
  provider: '' as string, // '' | 'mathjax' | 'katex'
})

const mathjax = ref({
  enable: false,
  perPage: false,
})

const katex = ref({
  enable: false,
  perPage: false,
  hideScrollbar: true,
})

// Image / LazyLoad
const lazyload = ref({
  enable: true,
  field: 'site' as string,
  blur: true,
  progressive: true,
})

const fancybox = ref(true)
const mediumZoom = ref(false)

// Pangu (中英文空格)
const pangu = ref({
  enable: false,
  field: 'site' as string,
})

// Pjax
const pjax = ref({
  enable: false,
})

// Instant page
const instantpage = ref(true)

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) { s[row.key] = row.value }
    }

    if (s.codeBlock) codeBlock.value = { ...codeBlock.value, ...(s.codeBlock as typeof codeBlock.value) }
    if (s.copySettings) copySettings.value = { ...copySettings.value, ...(s.copySettings as typeof copySettings.value) }
    if (s.search) search.value = { ...search.value, ...(s.search as typeof search.value) }
    if (s.localSearch) localSearch.value = { ...localSearch.value, ...(s.localSearch as typeof localSearch.value) }
    if (s.algoliaSearch) algoliaSearch.value = { ...algoliaSearch.value, ...(s.algoliaSearch as typeof algoliaSearch.value) }
    if (s.docsearch) docsearch.value = { ...docsearch.value, ...(s.docsearch as typeof docsearch.value) }
    if (s.math) math.value = { ...math.value, ...(s.math as typeof math.value) }
    if (s.mathjax) mathjax.value = { ...mathjax.value, ...(s.mathjax as typeof mathjax.value) }
    if (s.katex) katex.value = { ...katex.value, ...(s.katex as typeof katex.value) }
    if (s.lazyload) lazyload.value = { ...lazyload.value, ...(s.lazyload as typeof lazyload.value) }
    if (s.fancybox !== undefined) fancybox.value = Boolean(s.fancybox)
    if (s.mediumZoom !== undefined) mediumZoom.value = Boolean(s.mediumZoom)
    if (s.pangu) pangu.value = { ...pangu.value, ...(s.pangu as typeof pangu.value) }
    if (s.pjax) pjax.value = { ...pjax.value, ...(s.pjax as typeof pjax.value) }
    if (s.instantpage !== undefined) instantpage.value = Boolean(s.instantpage)
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveSuccess.value = false
  try {
    await api.put('/api/settings', [
      { key: 'codeBlock', value: codeBlock.value, category: 'display' },
      { key: 'copySettings', value: copySettings.value, category: 'display' },
      { key: 'search', value: search.value, category: 'display' },
      { key: 'localSearch', value: localSearch.value, category: 'display' },
      { key: 'algoliaSearch', value: algoliaSearch.value, category: 'display' },
      { key: 'docsearch', value: docsearch.value, category: 'display' },
      { key: 'math', value: math.value, category: 'display' },
      { key: 'mathjax', value: mathjax.value, category: 'display' },
      { key: 'katex', value: katex.value, category: 'display' },
      { key: 'lazyload', value: lazyload.value, category: 'display' },
      { key: 'fancybox', value: fancybox.value, category: 'display' },
      { key: 'mediumZoom', value: mediumZoom.value, category: 'display' },
      { key: 'pangu', value: pangu.value, category: 'display' },
      { key: 'pjax', value: pjax.value, category: 'display' },
      { key: 'instantpage', value: instantpage.value, category: 'display' },
    ])
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchSettings())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-code-bracket w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">代码与搜索</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" /> 保存成功
        </span>
        <button class="btn-primary px-4 py-2 text-sm flex items-center gap-2 cursor-pointer" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-48 bg-surface-2 rounded-xl animate-pulse" v-for="i in 3" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Code Block -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-code-bracket-square w-5 h-5 text-primary" /> 代码块
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">高亮主题</label>
              <select v-model="codeBlock.highlightTheme" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="darker">Darker</option>
                <option value="pale night">Pale Night</option>
                <option value="ocean">Ocean</option>
                <option value="mac">Mac</option>
                <option value="mac light">Mac Light</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">最大高度 (px)</label>
              <input v-model.number="codeBlock.highlightHeightLimit" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
          <div class="flex gap-6 mt-4 flex-wrap">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="codeBlock.highlightCopy" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示复制按钮</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="codeBlock.highlightLang" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示语言标签</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="codeBlock.highlightShrink" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">默认折叠代码块</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="codeBlock.codeWordWrap" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">代码自动换行</span>
            </label>
          </div>
        </div>

        <!-- Copy -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-clipboard-document w-5 h-5 text-primary" /> 复制设置
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">启用复制功能</label>
              <button class="toggle-switch" :class="copySettings.enable ? 'bg-primary' : 'bg-surface-2'" @click="copySettings.enable = !copySettings.enable">
                <span class="toggle-knob" :class="copySettings.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-text">复制后追加版权信息</label>
                <p class="text-xs text-muted">超过一定字数后自动追加</p>
              </div>
              <button class="toggle-switch" :class="copySettings.copyrightEnable ? 'bg-primary' : 'bg-surface-2'" @click="copySettings.copyrightEnable = !copySettings.copyrightEnable">
                <span class="toggle-knob" :class="copySettings.copyrightEnable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div v-if="copySettings.copyrightEnable">
              <label class="block text-sm font-medium text-text mb-1.5">触发字数阈值</label>
              <input v-model.number="copySettings.copyrightLimitCount" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-magnifying-glass w-5 h-5 text-primary" /> 搜索
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">搜索引擎</label>
              <select v-model="search.provider" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="">不使用搜索</option>
                <option value="local">本地搜索</option>
                <option value="algolia">Algolia</option>
                <option value="docsearch">Docsearch</option>
              </select>
            </div>
            <!-- Local -->
            <div v-if="search.provider === 'local'" class="p-3 bg-surface-2 rounded-lg">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="localSearch.preload" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">预加载搜索索引</span>
              </label>
            </div>
            <!-- Algolia -->
            <div v-if="search.provider === 'algolia'" class="p-3 bg-surface-2 rounded-lg">
              <label class="block text-sm font-medium text-text mb-1.5">每页结果数</label>
              <input v-model.number="algoliaSearch.perPage" type="number" min="2" max="20" class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text">
            </div>
            <!-- Docsearch -->
            <div v-if="search.provider === 'docsearch'" class="p-3 bg-surface-2 rounded-lg space-y-2">
              <div>
                <label class="block text-sm font-medium text-text mb-1">App ID</label>
                <input v-model="docsearch.appId" type="text" class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text">
              </div>
              <div>
                <label class="block text-sm font-medium text-text mb-1">API Key</label>
                <input v-model="docsearch.apiKey" type="text" class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text">
              </div>
              <div>
                <label class="block text-sm font-medium text-text mb-1">Index Name</label>
                <input v-model="docsearch.indexName" type="text" class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text">
              </div>
            </div>
          </div>
        </div>

        <!-- Math -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-variable w-5 h-5 text-primary" /> 数学公式
          </h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">公式引擎</label>
            <select v-model="math.provider" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              <option value="">不使用</option>
              <option value="mathjax">MathJax</option>
              <option value="katex">KaTeX</option>
            </select>
          </div>
          <div v-if="math.provider === 'mathjax'" class="mt-3 p-3 bg-surface-2 rounded-lg">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="mathjax.perPage" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">每页加载（否则按需加载，需在 Frontmatter 添加 mathjax: true）</span>
            </label>
          </div>
          <div v-if="math.provider === 'katex'" class="mt-3 p-3 bg-surface-2 rounded-lg space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="katex.perPage" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">每页加载</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="katex.hideScrollbar" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">隐藏公式滚动条</span>
            </label>
          </div>
        </div>

        <!-- Image -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-photo w-5 h-5 text-primary" /> 图片与加载
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">图片懒加载</label>
              <button class="toggle-switch" :class="lazyload.enable ? 'bg-primary' : 'bg-surface-2'" @click="lazyload.enable = !lazyload.enable">
                <span class="toggle-knob" :class="lazyload.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="lazyload.blur" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">模糊占位</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="lazyload.progressive" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">渐进加载</span>
              </label>
            </div>
            <div class="border-t border-border pt-4">
              <label class="font-medium text-text mb-2 block">图片灯箱</label>
              <div class="flex gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="fancybox" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">Fancybox</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="mediumZoom" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">Medium Zoom</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Pangu / Pjax / InstantPage -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-bolt w-5 h-5 text-primary" /> 性能优化
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-text">中英文自动空格</label>
                <p class="text-xs text-muted">Pangu.js 在中文和英文/数字间插入空格</p>
              </div>
              <button class="toggle-switch" :class="pangu.enable ? 'bg-primary' : 'bg-surface-2'" @click="pangu.enable = !pangu.enable">
                <span class="toggle-knob" :class="pangu.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-text">Pjax 无刷新加载</label>
                <p class="text-xs text-muted">可能包含 bug，谨慎开启</p>
              </div>
              <button class="toggle-switch" :class="pjax.enable ? 'bg-primary' : 'bg-surface-2'" @click="pjax.enable = !pjax.enable">
                <span class="toggle-knob" :class="pjax.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-text">Instant.page 预加载</label>
                <p class="text-xs text-muted">悬停链接时预加载页面</p>
              </div>
              <button class="toggle-switch" :class="instantpage ? 'bg-primary' : 'bg-surface-2'" @click="instantpage = !instantpage">
                <span class="toggle-knob" :class="instantpage ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" /> 效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问带代码块的文章查看效果</p>
          <NuxtLink to="/articles" target="_blank" class="btn-secondary w-full flex items-center justify-center gap-2">
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" /> 查看文章
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toggle-switch { @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer; }
.toggle-knob { @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform; }
</style>
