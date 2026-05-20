<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('page-config')

const form = reactive({
  menuJson: '{}',
  navJson: '{\n  "enable": false,\n  "travelling": false,\n  "clock": false,\n  "menu": []\n}',
  mournJson: '{\n  "enable": false,\n  "days": []\n}',
  codeBlockJson: '{\n  "theme": "light"\n}',
  copySettingsJson: '{\n  "enable": true,\n  "copyright": {\n    "enable": false,\n    "limit_count": 50\n  }\n}',
  searchJson: '{\n  "enable": false\n}',
  localSearchJson: '{\n  "enable": false,\n  "preload": true\n}',
  mathjaxJson: '{\n  "enable": false,\n  "per_page": false\n}',
  katexJson: '{\n  "enable": false,\n  "per_page": false,\n  "hide_scrollbar": true\n}',
  pageThumbnailSuffix: '',
  tableInterlacedDiscoloration: false,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function stringifyValue(value: unknown, fallback: string) {
  if (value === undefined || value === null) return fallback
  try {
    return JSON.stringify(value, null, 2)
  }
  catch {
    return fallback
  }
}

function hydrateForm() {
  form.menuJson = stringifyValue(settings.value.menu, '{}')
  form.navJson = stringifyValue(settings.value.nav, form.navJson)
  form.mournJson = stringifyValue(settings.value.mourn, form.mournJson)
  form.codeBlockJson = stringifyValue(settings.value.codeBlock, form.codeBlockJson)
  form.copySettingsJson = stringifyValue(settings.value.copySettings, form.copySettingsJson)
  form.searchJson = stringifyValue(settings.value.search, form.searchJson)
  form.localSearchJson = stringifyValue(settings.value.localSearch, form.localSearchJson)
  form.mathjaxJson = stringifyValue(settings.value.mathjax, form.mathjaxJson)
  form.katexJson = stringifyValue(settings.value.katex, form.katexJson)
  form.pageThumbnailSuffix = String(settings.value.pageThumbnailSuffix || '')
  form.tableInterlacedDiscoloration = Boolean(settings.value.table_interlaced_discoloration)
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

function parseJson<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T
  }
  catch {
    throw new Error(`${label} 不是合法的 JSON，请检查格式后再保存。`)
  }
}

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      menu: parseJson<Record<string, unknown>>(form.menuJson, '菜单配置'),
      nav: parseJson<Record<string, unknown>>(form.navJson, '导航配置'),
      mourn: parseJson<Record<string, unknown>>(form.mournJson, '灰色纪念日配置'),
      codeBlock: parseJson<Record<string, unknown>>(form.codeBlockJson, '代码块配置'),
      copySettings: parseJson<Record<string, unknown>>(form.copySettingsJson, '复制配置'),
      search: parseJson<Record<string, unknown>>(form.searchJson, '搜索配置'),
      localSearch: parseJson<Record<string, unknown>>(form.localSearchJson, '本地搜索配置'),
      mathjax: parseJson<Record<string, unknown>>(form.mathjaxJson, 'MathJax 配置'),
      katex: parseJson<Record<string, unknown>>(form.katexJson, 'KaTeX 配置'),
      pageThumbnailSuffix: form.pageThumbnailSuffix.trim(),
      table_interlaced_discoloration: form.tableInterlacedDiscoloration,
    })
    message.value = '页面与展示配置已保存。'
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
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(34,184,207,0.1),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Page Config</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">页面与展示配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这一页开始承接 `_config.yml` 里偏页面级、展示级的设置项。
        先恢复菜单、导航、搜索、代码块和数学公式等关键能力，再逐步细化为可视化编辑器。
      </p>
    </section>

    <div
      v-if="message"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
    >
      {{ message }}
    </div>
    <div
      v-if="errorMessage"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
    >
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">导航与页面入口</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">菜单 `menu`</span>
            <textarea v-model="form.menuJson" rows="10" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">导航 `nav`</span>
            <textarea v-model="form.navJson" rows="10" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">纪念日灰色模式 `mourn`</span>
            <textarea v-model="form.mournJson" rows="7" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">页面缩略图后缀 `pageThumbnailSuffix`</span>
            <input
              v-model="form.pageThumbnailSuffix"
              type="text"
              class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="例如：webp"
            >
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">展示能力</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">代码块 `codeBlock`</span>
            <textarea v-model="form.codeBlockJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">复制设置 `copySettings`</span>
            <textarea v-model="form.copySettingsJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">搜索主配置 `search`</span>
            <textarea v-model="form.searchJson" rows="7" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">本地搜索 `localSearch`</span>
            <textarea v-model="form.localSearchJson" rows="7" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4">
            <div>
              <p class="text-sm font-medium text-text">表格斑马纹 `table_interlaced_discoloration`</p>
              <p class="mt-1 text-xs text-muted">控制文章表格的交错背景效果。</p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-7 w-12 items-center rounded-full transition"
              :class="form.tableInterlacedDiscoloration ? 'bg-primary' : 'bg-surface-2'"
              @click="form.tableInterlacedDiscoloration = !form.tableInterlacedDiscoloration"
            >
              <span
                class="inline-block h-5 w-5 rounded-full bg-white transition"
                :class="form.tableInterlacedDiscoloration ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </label>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">数学公式</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">MathJax `mathjax`</span>
            <textarea v-model="form.mathjaxJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">KaTeX `katex`</span>
            <textarea v-model="form.katexJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">恢复策略说明</h2>
        <div class="mt-5 space-y-4 text-sm leading-7 text-muted">
          <p>当前这批复杂配置先用 JSON 承接，是为了尽快补回后台替代 `_config.yml` 的能力。</p>
          <p>等核心链路稳定后，再把菜单编辑、导航项、搜索和代码块配置拆成更细致的可视化表单。</p>
          <p>这样不会阻塞前台继续对齐安知鱼主题，同时也避免再次出现“大改一轮后整站不可用”的情况。</p>
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
        {{ saving ? '保存中...' : '保存页面配置' }}
      </button>
    </div>
  </div>
</template>
