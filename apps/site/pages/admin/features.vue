<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('features')

const rightsideOptions = [
  { value: 'readmode', label: '阅读模式' },
  { value: 'translate', label: '翻译切换' },
  { value: 'darkmode', label: '明暗切换' },
  { value: 'hide-aside-btn', label: '侧栏开关' },
  { value: 'mobile-toc-button', label: '移动目录' },
  { value: 'to_comment', label: '跳转评论' },
  { value: 'go-up', label: '回到顶部' },
]

const form = reactive({
  readmode: false,

  preloaderEnable: true,
  preloaderSource: 3,
  preloaderAvatar: '',

  rightsideEnableOrder: false,
  rightsideShow: [] as string[],
  rightsideHide: [] as string[],

  navMusicEnable: true,
  navMusicConsoleWidescreen: false,
  navMusicId: '',
  navMusicServer: 'netease',
  navMusicVolume: 0.7,
  navMusicPlaylist: '',

  translateEnable: false,
  translateDefaultEncoding: 2,
  translateDelay: 0,
  translateTraditionalLabel: '繁',
  translateSimplifiedLabel: '简',
  translateMenuTraditional: '',
  translateMenuSimplified: '',

  snackbarEnable: false,
  snackbarPosition: 'top-center',
  snackbarBgLight: '#425AEF',
  snackbarBgDark: '#1f1f1f',

  rightClickMenuEnable: false,

  greetingBoxEnable: false,
  greetingBoxDefault: '晚上好，欢迎来到这里。',
  greetingBoxListJson: '[]',

  centerConsoleEnable: false,
  centerConsoleJson: '{\n  "card_tags": {\n    "enable": true,\n    "limit": 40,\n    "color": false,\n    "highlightTags": []\n  },\n  "card_archives": {\n    "enable": true,\n    "type": "monthly",\n    "format": "MMMM YYYY",\n    "order": -1,\n    "limit": 8\n  }\n}',

  effectsJson: '{\n  "dynamicEffect": {},\n  "canvasRibbon": {},\n  "canvasFlutteringRibbon": {},\n  "canvasNest": {},\n  "fireworks": {},\n  "clickHeart": {},\n  "clickShowText": {},\n  "activatePowerMode": {},\n  "universe": {},\n  "bubble": {}\n}',
  aiSummaryJson: '{\n  "gptName": "AnZhiYu",\n  "btnLink": ""\n}',
  agreementPopupJson: '{\n  "enable": false,\n  "url": "/privacy"\n}',
  friendsVueJson: '{\n  "enable": false,\n  "vueJs": "",\n  "apiurl": "",\n  "topTips": "",\n  "topBackground": ""\n}',
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function stringifyValue(value: unknown, fallback: string) {
  if (value === undefined || value === null) {
    return fallback
  }

  try {
    return JSON.stringify(value, null, 2)
  }
  catch {
    return fallback
  }
}

function hydrateForm() {
  const preloader = (settings.value.preloader as Record<string, unknown> | undefined) ?? {}
  const rightsideItems = (settings.value.rightsideItems as Record<string, unknown> | undefined) ?? {}
  const navMusic = (settings.value.navMusic as Record<string, unknown> | undefined) ?? {}
  const translate = (settings.value.translate as Record<string, unknown> | undefined) ?? {}
  const snackbar = (settings.value.snackbar as Record<string, unknown> | undefined) ?? {}
  const rightClickMenu = (settings.value.rightClickMenu as Record<string, unknown> | undefined) ?? {}
  const greetingBox = (settings.value.greetingBox as Record<string, unknown> | undefined) ?? {}
  const centerConsole = (settings.value.centerConsole as Record<string, unknown> | undefined) ?? {}

  form.readmode = Boolean(settings.value.readmode)

  form.preloaderEnable = preloader.enable !== undefined ? Boolean(preloader.enable) : true
  form.preloaderSource = Number(preloader.source ?? 3) || 3
  form.preloaderAvatar = String(preloader.avatar ?? '')

  form.rightsideEnableOrder = rightsideItems.enableOrder !== undefined ? Boolean(rightsideItems.enableOrder) : false
  form.rightsideShow = Array.isArray(rightsideItems.show)
    ? rightsideItems.show.map(item => String(item))
    : ['readmode', 'darkmode', 'hide-aside-btn', 'mobile-toc-button', 'to_comment', 'go-up']
  form.rightsideHide = Array.isArray(rightsideItems.hide)
    ? rightsideItems.hide.map(item => String(item))
    : []

  form.navMusicEnable = navMusic.enable !== undefined ? Boolean(navMusic.enable) : true
  form.navMusicConsoleWidescreen = navMusic.consoleWidescreenMusic !== undefined
    ? Boolean(navMusic.consoleWidescreenMusic)
    : Boolean(navMusic.console_widescreen_music ?? false)
  form.navMusicId = String(navMusic.id ?? '')
  form.navMusicServer = String(navMusic.server ?? 'netease')
  form.navMusicVolume = Number(navMusic.volume ?? 0.7) || 0.7
  form.navMusicPlaylist = String(navMusic.allPlaylist ?? '')

  form.translateEnable = translate.enable !== undefined ? Boolean(translate.enable) : false
  form.translateDefaultEncoding = Number(translate.defaultEncoding ?? 2) || 2
  form.translateDelay = Number(translate.translateDelay ?? 0) || 0
  form.translateTraditionalLabel = String(translate.msgToTraditionalChinese ?? '繁')
  form.translateSimplifiedLabel = String(translate.msgToSimplifiedChinese ?? '简')
  form.translateMenuTraditional = String(translate.rightMenuMsgToTraditionalChinese ?? '')
  form.translateMenuSimplified = String(translate.rightMenuMsgToSimplifiedChinese ?? '')

  form.snackbarEnable = snackbar.enable !== undefined ? Boolean(snackbar.enable) : false
  form.snackbarPosition = String(snackbar.position ?? 'top-center')
  form.snackbarBgLight = String(snackbar.bg_light ?? '#425AEF')
  form.snackbarBgDark = String(snackbar.bg_dark ?? '#1f1f1f')

  form.rightClickMenuEnable = rightClickMenu.enable !== undefined ? Boolean(rightClickMenu.enable) : false

  form.greetingBoxEnable = greetingBox.enable !== undefined ? Boolean(greetingBox.enable) : false
  form.greetingBoxDefault = String(greetingBox.default ?? '晚上好，欢迎来到这里。')
  form.greetingBoxListJson = stringifyValue(greetingBox.list, '[]')

  form.centerConsoleEnable = centerConsole.enable !== undefined ? Boolean(centerConsole.enable) : false
  form.centerConsoleJson = stringifyValue(centerConsole, form.centerConsoleJson)

  form.effectsJson = stringifyValue({
    dynamicEffect: settings.value.dynamicEffect ?? {},
    canvasRibbon: settings.value.canvasRibbon ?? {},
    canvasFlutteringRibbon: settings.value.canvasFlutteringRibbon ?? {},
    canvasNest: settings.value.canvasNest ?? {},
    fireworks: settings.value.fireworks ?? {},
    clickHeart: settings.value.clickHeart ?? {},
    clickShowText: settings.value.clickShowText ?? {},
    activatePowerMode: settings.value.activatePowerMode ?? {},
    universe: settings.value.universe ?? {},
    bubble: settings.value.bubble ?? {},
  }, form.effectsJson)
  form.aiSummaryJson = stringifyValue(settings.value.aiSummary, form.aiSummaryJson)
  form.agreementPopupJson = stringifyValue(settings.value.agreementPopup, form.agreementPopupJson)
  form.friendsVueJson = stringifyValue(settings.value.friendsVue, form.friendsVueJson)
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

function toggleSelection(target: 'rightsideShow' | 'rightsideHide', value: string) {
  if (form[target].includes(value)) {
    form[target] = form[target].filter(item => item !== value)
    return
  }
  form[target] = [...form[target], value]
}

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const greetingList = parseJson<Array<Record<string, unknown>>>(form.greetingBoxListJson, '欢迎语时间段')
    const centerConsole = parseJson<Record<string, unknown>>(form.centerConsoleJson, '中控台配置')
    const effects = parseJson<Record<string, Record<string, unknown>>>(form.effectsJson, '动效配置')

    await save({
      readmode: form.readmode,
      preloader: {
        enable: form.preloaderEnable,
        source: form.preloaderSource,
        avatar: form.preloaderAvatar.trim(),
      },
      rightsideItems: {
        enableOrder: form.rightsideEnableOrder,
        show: form.rightsideShow,
        hide: form.rightsideHide,
      },
      navMusic: {
        enable: form.navMusicEnable,
        consoleWidescreenMusic: form.navMusicConsoleWidescreen,
        id: form.navMusicId.trim(),
        server: form.navMusicServer.trim() || 'netease',
        volume: form.navMusicVolume,
        allPlaylist: form.navMusicPlaylist.trim(),
      },
      translate: {
        enable: form.translateEnable,
        defaultEncoding: form.translateDefaultEncoding,
        translateDelay: form.translateDelay,
        msgToTraditionalChinese: form.translateTraditionalLabel.trim() || '繁',
        msgToSimplifiedChinese: form.translateSimplifiedLabel.trim() || '简',
        rightMenuMsgToTraditionalChinese: form.translateMenuTraditional.trim(),
        rightMenuMsgToSimplifiedChinese: form.translateMenuSimplified.trim(),
      },
      snackbar: {
        enable: form.snackbarEnable,
        position: form.snackbarPosition.trim() || 'top-center',
        bg_light: form.snackbarBgLight.trim() || '#425AEF',
        bg_dark: form.snackbarBgDark.trim() || '#1f1f1f',
      },
      rightClickMenu: {
        enable: form.rightClickMenuEnable,
      },
      greetingBox: {
        enable: form.greetingBoxEnable,
        default: form.greetingBoxDefault.trim(),
        list: greetingList,
      },
      centerConsole: {
        ...centerConsole,
        enable: form.centerConsoleEnable,
      },
      dynamicEffect: effects.dynamicEffect ?? {},
      canvasRibbon: effects.canvasRibbon ?? {},
      canvasFlutteringRibbon: effects.canvasFlutteringRibbon ?? {},
      canvasNest: effects.canvasNest ?? {},
      fireworks: effects.fireworks ?? {},
      clickHeart: effects.clickHeart ?? {},
      clickShowText: effects.clickShowText ?? {},
      activatePowerMode: effects.activatePowerMode ?? {},
      universe: effects.universe ?? {},
      bubble: effects.bubble ?? {},
      aiSummary: parseJson<Record<string, unknown>>(form.aiSummaryJson, 'AI 摘要配置'),
      agreementPopup: parseJson<Record<string, unknown>>(form.agreementPopupJson, '协议弹窗配置'),
      friendsVue: parseJson<Record<string, unknown>>(form.friendsVueJson, '友链朋友圈配置'),
    })

    message.value = '增强功能配置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Features</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">增强功能配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里承接右侧按钮、预加载、导航音乐、翻译、提示消息、欢迎语和部分互动增强功能。
        先把高频操作拆成表单，复杂动效继续保留 JSON 入口，保证后台先可用、可管、可联调。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">阅读与预加载</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.readmode = !form.readmode">
            <span class="text-sm text-text">启用阅读模式按钮</span>
            <span class="text-sm text-muted">{{ form.readmode ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.preloaderEnable = !form.preloaderEnable">
            <span class="text-sm text-text">启用预加载动画</span>
            <span class="text-sm text-muted">{{ form.preloaderEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">预加载类型</span>
            <select v-model="form.preloaderSource" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option :value="1">旋转加载动画</option>
              <option :value="2">Pace 进度条</option>
              <option :value="3">头像加载</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">预加载头像</span>
            <input v-model="form.preloaderAvatar" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/images/avatar.jpg" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">右侧按钮组</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.rightsideEnableOrder = !form.rightsideEnableOrder">
            <span class="text-sm text-text">启用自定义排序</span>
            <span class="text-sm text-muted">{{ form.rightsideEnableOrder ? '开启' : '关闭' }}</span>
          </button>

          <div>
            <p class="mb-3 text-sm font-medium text-text">显示按钮</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in rightsideOptions"
                :key="`show-${option.value}`"
                type="button"
                class="rounded-2xl border px-4 py-3 text-sm transition"
                :class="form.rightsideShow.includes(option.value)
                  ? 'border-primary/30 bg-primary/8 text-primary'
                  : 'border-border bg-background/75 text-text hover:border-primary/20'"
                @click="toggleSelection('rightsideShow', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-3 text-sm font-medium text-text">隐藏按钮</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in rightsideOptions"
                :key="`hide-${option.value}`"
                type="button"
                class="rounded-2xl border px-4 py-3 text-sm transition"
                :class="form.rightsideHide.includes(option.value)
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-border bg-background/75 text-text hover:border-rose-200'"
                @click="toggleSelection('rightsideHide', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">导航音乐</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.navMusicEnable = !form.navMusicEnable">
            <span class="text-sm text-text">启用导航音乐</span>
            <span class="text-sm text-muted">{{ form.navMusicEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.navMusicConsoleWidescreen = !form.navMusicConsoleWidescreen">
            <span class="text-sm text-text">宽屏控制台音乐</span>
            <span class="text-sm text-muted">{{ form.navMusicConsoleWidescreen ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">歌单 / 歌曲 ID</span>
            <input v-model="form.navMusicId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">音乐服务商</span>
            <select v-model="form.navMusicServer" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="netease">网易云</option>
              <option value="tencent">QQ 音乐</option>
              <option value="kugou">酷狗</option>
              <option value="xiami">虾米</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">音量</span>
            <input v-model="form.navMusicVolume" type="number" min="0" max="1" step="0.1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">全部歌单入口</span>
            <input v-model="form.navMusicPlaylist" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/music/" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">翻译、提示与右键菜单</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.translateEnable = !form.translateEnable">
            <span class="text-sm text-text">启用翻译</span>
            <span class="text-sm text-muted">{{ form.translateEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.snackbarEnable = !form.snackbarEnable">
            <span class="text-sm text-text">启用消息提醒</span>
            <span class="text-sm text-muted">{{ form.snackbarEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.rightClickMenuEnable = !form.rightClickMenuEnable">
            <span class="text-sm text-text">启用右键菜单</span>
            <span class="text-sm text-muted">{{ form.rightClickMenuEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">默认编码</span>
            <select v-model="form.translateDefaultEncoding" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option :value="1">默认繁体</option>
              <option :value="2">默认简体</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">翻译延迟（毫秒）</span>
            <input v-model="form.translateDelay" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">切换到繁体时按钮文案</span>
            <input v-model="form.translateTraditionalLabel" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">切换到简体时按钮文案</span>
            <input v-model="form.translateSimplifiedLabel" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">右键菜单繁体提示</span>
            <input v-model="form.translateMenuTraditional" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">右键菜单简体提示</span>
            <input v-model="form.translateMenuSimplified" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-3">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">消息位置</span>
            <input v-model="form.snackbarPosition" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="top-center" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">亮色背景</span>
            <input v-model="form.snackbarBgLight" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">暗色背景</span>
            <input v-model="form.snackbarBgDark" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">欢迎语与中控台</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.greetingBoxEnable = !form.greetingBoxEnable">
            <span class="text-sm text-text">启用欢迎弹层</span>
            <span class="text-sm text-muted">{{ form.greetingBoxEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleEnable = !form.centerConsoleEnable">
            <span class="text-sm text-text">启用右侧设置面板</span>
            <span class="text-sm text-muted">{{ form.centerConsoleEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">默认欢迎语</span>
          <input v-model="form.greetingBoxDefault" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </label>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">欢迎语时间段 `greetingBox.list`</span>
          <textarea v-model="form.greetingBoxListJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </label>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">右侧设置面板 `centerConsole`</span>
          <textarea v-model="form.centerConsoleJson" rows="10" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </label>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">高级扩展 JSON</h2>
        <p class="mt-2 text-sm text-muted">特效、AI 摘要、协议弹窗和友链朋友圈仍保留 JSON 入口，便于继续对齐安知鱼原始配置。</p>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">动效合集</span>
            <textarea v-model="form.effectsJson" rows="10" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">AI 摘要配置</span>
            <textarea v-model="form.aiSummaryJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">协议弹窗配置</span>
            <textarea v-model="form.agreementPopupJson" rows="7" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">友链朋友圈配置</span>
            <textarea v-model="form.friendsVueJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button type="button" class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary" :disabled="loading || saving" @click="refresh">
        刷新
      </button>
      <button type="button" class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60" :disabled="loading || saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存增强功能配置' }}
      </button>
    </div>
  </div>
</template>
