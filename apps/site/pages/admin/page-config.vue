<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('page-config')

// --- Menu types ---
interface MenuItem {
  name: string
  path: string
  icon: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

// --- Nav types ---
interface NavSubItem {
  name: string
  link: string
  icon: string
}

interface NavMenuItem {
  title: string
  item: NavSubItem[]
}

const form = reactive({
  // menu
  menuGroups: [] as MenuGroup[],

  // nav
  navEnable: false,
  navTravelling: false,
  navClock: false,
  navMenu: [] as NavMenuItem[],

  // mourn
  mournEnable: false,
  mournDaysText: '',

  // codeBlock
  highlightTheme: 'light',
  highlightCopy: true,
  highlightLang: true,
  highlightShrink: 'false',
  highlightHeightLimit: 330,
  codeWordWrap: false,

  // copySettings
  copyEnable: true,
  copyrightEnable: false,
  copyrightLimitCount: 50,

  // search
  searchMode: 'local',

  // localSearch
  localSearchEnable: false,
  localSearchPreload: true,

  // mathjax
  mathjaxEnable: false,
  mathjaxPerPage: false,

  // katex
  katexEnable: false,
  katexPerPage: false,
  katexHideScrollbar: true,

  // already visual
  pageThumbnailSuffix: '',
  tableInterlacedDiscoloration: false,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

// --- Helpers ---
function toMenuGroup(key: string, value: unknown): MenuGroup {
  const items = Array.isArray(value) ? value : []
  return {
    title: String(key),
    items: items.map((item: unknown) => {
      const r = item && typeof item === 'object' ? item as Record<string, unknown> : {}
      return { name: String(r.name ?? ''), path: String(r.path ?? ''), icon: String(r.icon ?? '') }
    }),
  }
}

function toNavMenuItem(item: unknown): NavMenuItem {
  const r = item && typeof item === 'object' ? item as Record<string, unknown> : {}
  const subItems = Array.isArray(r.item) ? r.item : []
  return {
    title: String(r.title ?? ''),
    item: subItems.map((sub: unknown) => {
      const s = sub && typeof sub === 'object' ? sub as Record<string, unknown> : {}
      return { name: String(s.name ?? ''), link: String(s.link ?? ''), icon: String(s.icon ?? '') }
    }),
  }
}

function addMenuGroup() {
  form.menuGroups.push({ title: '', items: [] })
}

function removeMenuGroup(index: number) {
  form.menuGroups.splice(index, 1)
}

function addMenuItem(groupIndex: number) {
  form.menuGroups[groupIndex].items.push({ name: '', path: '', icon: '' })
}

function removeMenuItem(groupIndex: number, itemIndex: number) {
  form.menuGroups[groupIndex].items.splice(itemIndex, 1)
}

function addNavMenuItem() {
  form.navMenu.push({ title: '', item: [] })
}

function removeNavMenuItem(index: number) {
  form.navMenu.splice(index, 1)
}

function addNavSubItem(menuIndex: number) {
  form.navMenu[menuIndex].item.push({ name: '', link: '', icon: '' })
}

function removeNavSubItem(menuIndex: number, subIndex: number) {
  form.navMenu[menuIndex].item.splice(subIndex, 1)
}

function fromLines(value: string) {
  return value.split(/\r?\n/g).map(s => s.trim()).filter(Boolean)
}

function toLines(value: unknown) {
  return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean).join('\n') : ''
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

// --- Hydrate ---
function hydrateForm() {
  // menu: Record<string, MenuItem[]>
  const menuRaw = toRecord(settings.value.menu)
  form.menuGroups = Object.entries(menuRaw).map(([key, val]) => toMenuGroup(key, val))

  // nav
  const nav = toRecord(settings.value.nav)
  form.navEnable = Boolean(nav.enable ?? false)
  form.navTravelling = Boolean(nav.travelling ?? false)
  form.navClock = Boolean(nav.clock ?? false)
  form.navMenu = Array.isArray(nav.menu) ? nav.menu.map(toNavMenuItem) : []

  // mourn
  const mourn = toRecord(settings.value.mourn)
  form.mournEnable = Boolean(mourn.enable ?? false)
  form.mournDaysText = toLines(mourn.days)

  // codeBlock
  const codeBlock = toRecord(settings.value.codeBlock)
  form.highlightTheme = String(codeBlock.highlight_theme ?? 'light')
  form.highlightCopy = Boolean(codeBlock.highlight_copy ?? true)
  form.highlightLang = Boolean(codeBlock.highlight_lang ?? true)
  form.highlightShrink = String(codeBlock.highlight_shrink ?? 'false')
  form.highlightHeightLimit = Number(codeBlock.highlight_height_limit ?? 330) || 330
  form.codeWordWrap = Boolean(codeBlock.code_word_wrap ?? false)

  // copySettings
  const copySettings = toRecord(settings.value.copySettings)
  const copyright = toRecord(copySettings.copyright)
  form.copyEnable = Boolean(copySettings.enable ?? true)
  form.copyrightEnable = Boolean(copyright.enable ?? false)
  form.copyrightLimitCount = Number(copyright.limit_count ?? 50) || 50

  // search — determine mode from which sub-search is enabled
  const search = toRecord(settings.value.search)
  const localSearch = toRecord(settings.value.localSearch)
  const algoliaSearch = toRecord(settings.value.algoliaSearch)
  const docsearch = toRecord(settings.value.docsearch)
  if (Boolean(algoliaSearch.enable)) {
    form.searchMode = 'algolia'
  }
  else if (Boolean(docsearch.enable)) {
    form.searchMode = 'docsearch'
  }
  else if (Boolean(localSearch.enable) || Boolean(search.enable)) {
    form.searchMode = 'local'
  }
  else {
    form.searchMode = 'off'
  }

  // localSearch
  form.localSearchEnable = Boolean(localSearch.enable ?? false)
  form.localSearchPreload = Boolean(localSearch.preload ?? true)

  // mathjax
  const mathjax = toRecord(settings.value.mathjax)
  form.mathjaxEnable = Boolean(mathjax.enable ?? false)
  form.mathjaxPerPage = Boolean(mathjax.per_page ?? false)

  // katex
  const katex = toRecord(settings.value.katex)
  form.katexEnable = Boolean(katex.enable ?? false)
  form.katexPerPage = Boolean(katex.per_page ?? false)
  form.katexHideScrollbar = Boolean(katex.hide_scrollbar ?? true)

  // already visual
  form.pageThumbnailSuffix = String(settings.value.pageThumbnailSuffix ?? '')
  form.tableInterlacedDiscoloration = Boolean(settings.value.table_interlaced_discoloration)
}

watch(settings, () => { hydrateForm() }, { deep: true, immediate: true })

// --- Save ---
async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    // Reassemble menu from groups
    const menuObj: Record<string, unknown> = {}
    for (const group of form.menuGroups) {
      const key = group.title.trim()
      if (key) {
        menuObj[key] = group.items.map(item => ({
          name: item.name.trim(),
          path: item.path.trim(),
          icon: item.icon.trim(),
        }))
      }
    }

    // Reassemble search mode
    const searchEnable = form.searchMode !== 'off'
    const localSearchEnable = form.searchMode === 'local' ? form.localSearchEnable : false
    const algoliaEnable = form.searchMode === 'algolia'
    const docsearchEnable = form.searchMode === 'docsearch'

    await save({
      menu: menuObj,
      nav: {
        enable: form.navEnable,
        travelling: form.navTravelling,
        clock: form.navClock,
        menu: form.navMenu.map(m => ({
          title: m.title.trim(),
          item: m.item.map(s => ({
            name: s.name.trim(),
            link: s.link.trim(),
            icon: s.icon.trim(),
          })),
        })),
      },
      mourn: {
        enable: form.mournEnable,
        days: fromLines(form.mournDaysText),
      },
      codeBlock: {
        highlight_theme: form.highlightTheme,
        highlight_copy: form.highlightCopy,
        highlight_lang: form.highlightLang,
        highlight_shrink: form.highlightShrink,
        highlight_height_limit: form.highlightHeightLimit,
        code_word_wrap: form.codeWordWrap,
      },
      copySettings: {
        enable: form.copyEnable,
        copyright: {
          enable: form.copyrightEnable,
          limit_count: form.copyrightLimitCount,
        },
      },
      search: { enable: searchEnable },
      localSearch: {
        enable: localSearchEnable,
        preload: form.localSearchPreload,
      },
      algoliaSearch: { enable: algoliaEnable },
      docsearch: { enable: docsearchEnable },
      mathjax: {
        enable: form.mathjaxEnable,
        per_page: form.mathjaxPerPage,
      },
      katex: {
        enable: form.katexEnable,
        per_page: form.katexPerPage,
        hide_scrollbar: form.katexHideScrollbar,
      },
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
        管理菜单、导航、代码高亮、搜索、数学公式等页面级配置。所有配置项均已可视化，保存后前台立刻生效。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <!-- 菜单 menu -->
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">菜单配置</h2>
          <p class="mt-2 text-sm text-muted">管理顶部菜单分组与子项，每组包含标题和若干菜单条目。</p>
        </div>
        <button type="button" class="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" @click="addMenuGroup">
          新增分组
        </button>
      </div>

      <div v-if="form.menuGroups.length" class="mt-5 space-y-4">
        <article v-for="(group, gi) in form.menuGroups" :key="`menu-group-${gi}`" class="rounded-3xl border border-border bg-background/70 p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-semibold text-text">分组 {{ gi + 1 }}</p>
            <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeMenuGroup(gi)">
              删除分组
            </button>
          </div>
          <label class="mt-3 block space-y-2">
            <span class="text-xs font-medium text-muted">分组标题</span>
            <input v-model="group.title" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：文章、友链、我的" >
          </label>

          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="text-xs font-medium text-muted">菜单条目</span>
            <button type="button" class="rounded-xl border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/30" @click="addMenuItem(gi)">
              新增条目
            </button>
          </div>

          <div v-if="group.items.length" class="mt-3 space-y-3">
            <div v-for="(item, ii) in group.items" :key="`menu-item-${gi}-${ii}`" class="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <label class="block space-y-1">
                <span class="text-xs text-muted">名称</span>
                <input v-model="item.name" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="隧道" >
              </label>
              <label class="block space-y-1">
                <span class="text-xs text-muted">路径</span>
                <input v-model="item.path" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/archives/" >
              </label>
              <label class="block space-y-1">
                <span class="text-xs text-muted">图标</span>
                <input v-model="item.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="anzhiyu-icon-box-archive" >
              </label>
              <button type="button" class="mt-5 self-start text-xs text-rose-500 transition hover:text-rose-600" @click="removeMenuItem(gi, ii)">
                删除
              </button>
            </div>
          </div>
          <div v-else class="mt-3 text-xs text-muted">暂无条目，点击上方按钮添加。</div>
        </article>
      </div>
      <div v-else class="mt-5 rounded-3xl border border-dashed border-border bg-background/45 px-6 py-12 text-center text-sm text-muted">
        还没有菜单分组，点击右上角按钮添加。
      </div>
    </section>

    <!-- 导航 nav -->
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">导航配置</h2>
      <p class="mt-2 text-sm text-muted">控制导航栏开关与导航菜单项。</p>

      <div class="mt-5 space-y-5">
        <div class="grid gap-4 md:grid-cols-3">
          <AdminToggleSwitch v-model="form.navEnable" label="启用导航" />
          <AdminToggleSwitch v-model="form.navTravelling" label="开往" />
          <AdminToggleSwitch v-model="form.navClock" label="导航时钟" />
        </div>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium text-text">导航菜单项</span>
          <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addNavMenuItem">
            新增导航项
          </button>
        </div>

        <div v-if="form.navMenu.length" class="space-y-4">
          <article v-for="(navItem, ni) in form.navMenu" :key="`nav-menu-${ni}`" class="rounded-3xl border border-border bg-background/70 p-5">
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-semibold text-text">导航项 {{ ni + 1 }}</p>
              <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeNavMenuItem(ni)">
                删除
              </button>
            </div>
            <label class="mt-3 block space-y-2">
              <span class="text-xs font-medium text-muted">标题</span>
              <input v-model="navItem.title" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：网页" >
            </label>

            <div class="mt-4 flex items-center justify-between gap-3">
              <span class="text-xs font-medium text-muted">子项</span>
              <button type="button" class="rounded-xl border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/30" @click="addNavSubItem(ni)">
                新增子项
              </button>
            </div>

            <div v-if="navItem.item.length" class="mt-3 space-y-3">
              <div v-for="(sub, si) in navItem.item" :key="`nav-sub-${ni}-${si}`" class="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <label class="block space-y-1">
                  <span class="text-xs text-muted">名称</span>
                  <input v-model="sub.name" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="博客" >
                </label>
                <label class="block space-y-1">
                  <span class="text-xs text-muted">链接</span>
                  <input v-model="sub.link" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="https://example.com/" >
                </label>
                <label class="block space-y-1">
                  <span class="text-xs text-muted">图标</span>
                  <input v-model="sub.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/img/favicon.ico" >
                </label>
                <button type="button" class="mt-5 self-start text-xs text-rose-500 transition hover:text-rose-600" @click="removeNavSubItem(ni, si)">
                  删除
                </button>
              </div>
            </div>
            <div v-else class="mt-3 text-xs text-muted">暂无子项，点击上方按钮添加。</div>
          </article>
        </div>
        <div v-else class="rounded-3xl border border-dashed border-border bg-background/45 px-6 py-8 text-center text-sm text-muted">
          还没有导航菜单项，点击上方按钮添加。
        </div>
      </div>
    </section>

    <!-- 纪念日 -->
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">纪念日灰色模式</h2>
          <p class="mt-2 text-sm text-muted">特定日期首页变灰，如哀悼日、纪念日。</p>
        </div>
        <AdminToggleSwitch v-model="form.mournEnable" label="启用哀悼模式" />
      </div>
      <label class="mt-5 block space-y-2">
        <span class="text-sm font-medium text-text">哀悼日期</span>
        <textarea v-model="form.mournDaysText" rows="3" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个日期，例如：4-5" />
        <span class="text-xs text-muted">仅首页变灰，格式如 4-5、5-12、7-7</span>
      </label>
    </section>

    <!-- 代码块 + 复制 -->
    <section class="grid gap-6 xl:grid-cols-2">
      <!-- codeBlock -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">代码块配置</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">高亮主题</span>
              <select v-model="form.highlightTheme" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="light">light</option>
                <option value="darker">darker</option>
                <option value="pale night">pale night</option>
                <option value="ocean">ocean</option>
                <option value="mac">mac</option>
                <option value="mac light">mac light</option>
                <option value="false">关闭高亮</option>
              </select>
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">代码折叠</span>
              <select v-model="form.highlightShrink" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="true">默认折叠</option>
                <option value="false">默认展开</option>
                <option value="none">展开并隐藏按钮</option>
              </select>
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.highlightCopy" label="复制按钮" />
            <AdminToggleSwitch v-model="form.highlightLang" label="显示语言" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.codeWordWrap" label="代码自动换行" />
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">高度限制 (px)</span>
              <input v-model.number="form.highlightHeightLimit" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </div>
      </article>

      <!-- copySettings -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">复制设置</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.copyEnable" label="启用复制提示" />
            <AdminToggleSwitch v-model="form.copyrightEnable" label="追加版权信息" />
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">版权字数限制</span>
            <input v-model.number="form.copyrightLimitCount" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            <span class="text-xs text-muted">超过此字数才追加版权信息</span>
          </label>
        </div>
      </article>
    </section>

    <!-- 搜索 + 数学公式 -->
    <section class="grid gap-6 xl:grid-cols-2">
      <!-- search -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">搜索配置</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">搜索方式</span>
            <select v-model="form.searchMode" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="local">本地搜索</option>
              <option value="algolia">Algolia 搜索</option>
              <option value="docsearch">DocSearch</option>
              <option value="off">关闭搜索</option>
            </select>
          </label>

          <template v-if="form.searchMode === 'local'">
            <div class="grid gap-4 md:grid-cols-2">
              <AdminToggleSwitch v-model="form.localSearchEnable" label="启用本地搜索" />
              <AdminToggleSwitch v-model="form.localSearchPreload" label="预加载索引" />
            </div>
          </template>
        </div>
      </article>

      <!-- mathjax + katex -->
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">数学公式</h2>
        <div class="mt-5 space-y-5">
          <div class="rounded-3xl border border-border bg-background/70 p-5">
            <p class="text-sm font-semibold text-text">MathJax</p>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <AdminToggleSwitch v-model="form.mathjaxEnable" label="启用 MathJax" />
              <AdminToggleSwitch v-model="form.mathjaxPerPage" label="每页加载" />
            </div>
          </div>

          <div class="rounded-3xl border border-border bg-background/70 p-5">
            <p class="text-sm font-semibold text-text">KaTeX</p>
            <div class="mt-3 grid gap-4 md:grid-cols-3">
              <AdminToggleSwitch v-model="form.katexEnable" label="启用 KaTeX" />
              <AdminToggleSwitch v-model="form.katexPerPage" label="每页加载" />
              <AdminToggleSwitch v-model="form.katexHideScrollbar" label="隐藏滚动条" />
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- 页面缩略图 + 表格斑马纹 -->
    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">页面缩略图</h2>
        <div class="mt-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">缩略图后缀</span>
            <input v-model="form.pageThumbnailSuffix" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：webp" >
            <span class="text-xs text-muted">用于图片 CDN 裁切参数，如 ?imageView2/1/w/600/h/400</span>
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">表格样式</h2>
        <div class="mt-5">
          <label class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4">
            <div>
              <p class="text-sm font-medium text-text">表格斑马纹</p>
              <p class="mt-1 text-xs text-muted">控制文章表格的交错背景效果。</p>
            </div>
            <AdminToggleSwitch v-model="form.tableInterlacedDiscoloration" label="表格斑马纹" />
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
        {{ saving ? '保存中...' : '保存页面配置' }}
      </button>
    </div>
  </div>
</template>
