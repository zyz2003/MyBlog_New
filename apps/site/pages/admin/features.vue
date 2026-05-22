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

interface GreetingItem {
  greeting: string
  startTime: number
  endTime: number
}

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
  greetingBoxList: [] as GreetingItem[],

  centerConsoleEnable: false,
  centerConsoleCardTagsEnable: true,
  centerConsoleCardTagsLimit: 40,
  centerConsoleCardTagsColor: false,
  centerConsoleCardArchivesEnable: true,
  centerConsoleCardArchivesType: 'monthly',
  centerConsoleCardArchivesFormat: 'MMMM YYYY',
  centerConsoleCardArchivesOrder: -1,
  centerConsoleCardArchivesLimit: 8,

  dynamicEffectPostTopWave: true,
  dynamicEffectPostTopRollZoomInfo: false,
  dynamicEffectPageCommentsRollZoom: false,

  canvasRibbonEnable: false,
  canvasFlutteringRibbonEnable: false,
  canvasNestEnable: false,
  fireworksEnable: false,
  fireworksMobile: false,
  clickHeartEnable: false,
  clickHeartMobile: false,
  clickShowTextEnable: false,
  clickShowTextMobile: false,
  activatePowerModeEnable: false,
  activatePowerModeColorful: true,
  activatePowerModeShake: false,
  activatePowerModeMobile: false,
  universeEnable: false,
  bubbleEnable: false,

  aiSummaryEnable: false,
  aiSummaryGptName: 'AnZhiYu',
  aiSummaryMode: 'local',
  aiSummarySwitchBtn: false,
  aiSummaryBtnLink: '',

  agreementPopupEnable: false,
  agreementPopupUrl: '/privacy',

  friendsVueEnable: false,
  friendsVueJs: '',
  friendsVueApiurl: '',
  friendsVueTopTips: '',
  friendsVueTopBackground: '',
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function addGreetingItem() {
  form.greetingBoxList.push({ greeting: '', startTime: 0, endTime: 24 })
}

function removeGreetingItem(index: number) {
  form.greetingBoxList.splice(index, 1)
}

function hydrateForm() {
  const preloader = toRecord(settings.value.preloader)
  const rightsideItems = toRecord(settings.value.rightsideItems)
  const navMusic = toRecord(settings.value.navMusic)
  const translate = toRecord(settings.value.translate)
  const snackbar = toRecord(settings.value.snackbar)
  const rightClickMenu = toRecord(settings.value.rightClickMenu)
  const greetingBox = toRecord(settings.value.greetingBox)
  const centerConsole = toRecord(settings.value.centerConsole)
  const dynamicEffect = toRecord(settings.value.dynamicEffect)
  const canvasRibbon = toRecord(settings.value.canvasRibbon)
  const canvasFlutteringRibbon = toRecord(settings.value.canvasFlutteringRibbon)
  const canvasNest = toRecord(settings.value.canvasNest)
  const fireworks = toRecord(settings.value.fireworks)
  const clickHeart = toRecord(settings.value.clickHeart)
  const clickShowText = toRecord(settings.value.clickShowText)
  const activatePowerMode = toRecord(settings.value.activatePowerMode)
  const universe = toRecord(settings.value.universe)
  const bubble = toRecord(settings.value.bubble)
  const aiSummary = toRecord(settings.value.aiSummary)
  const agreementPopup = toRecord(settings.value.agreementPopup)
  const friendsVue = toRecord(settings.value.friendsVue)

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
  const rawList = greetingBox.list
  form.greetingBoxList = Array.isArray(rawList)
    ? rawList.map((item: unknown) => {
        const r = item as Record<string, unknown>
        return { greeting: String(r.greeting ?? ''), startTime: Number(r.startTime ?? 0), endTime: Number(r.endTime ?? 24) }
      })
    : []

  const cardTags = toRecord(centerConsole.card_tags ?? centerConsole.cardTags)
  const cardArchives = toRecord(centerConsole.card_archives ?? centerConsole.cardArchives)
  form.centerConsoleEnable = centerConsole.enable !== undefined ? Boolean(centerConsole.enable) : false
  form.centerConsoleCardTagsEnable = cardTags.enable !== undefined ? Boolean(cardTags.enable) : true
  form.centerConsoleCardTagsLimit = Number(cardTags.limit ?? 40) || 40
  form.centerConsoleCardTagsColor = cardTags.color !== undefined ? Boolean(cardTags.color) : false
  form.centerConsoleCardArchivesEnable = cardArchives.enable !== undefined ? Boolean(cardArchives.enable) : true
  form.centerConsoleCardArchivesType = String(cardArchives.type ?? 'monthly')
  form.centerConsoleCardArchivesFormat = String(cardArchives.format ?? 'MMMM YYYY')
  form.centerConsoleCardArchivesOrder = Number(cardArchives.order ?? -1) >= 0 ? 1 : -1
  form.centerConsoleCardArchivesLimit = Number(cardArchives.limit ?? 8) || 8

  form.dynamicEffectPostTopWave = dynamicEffect.postTopWave !== undefined ? Boolean(dynamicEffect.postTopWave) : true
  form.dynamicEffectPostTopRollZoomInfo = dynamicEffect.postTopRollZoomInfo !== undefined ? Boolean(dynamicEffect.postTopRollZoomInfo) : false
  form.dynamicEffectPageCommentsRollZoom = dynamicEffect.pageCommentsRollZoom !== undefined ? Boolean(dynamicEffect.pageCommentsRollZoom) : false

  form.canvasRibbonEnable = canvasRibbon.enable !== undefined ? Boolean(canvasRibbon.enable) : false
  form.canvasFlutteringRibbonEnable = canvasFlutteringRibbon.enable !== undefined ? Boolean(canvasFlutteringRibbon.enable) : false
  form.canvasNestEnable = canvasNest.enable !== undefined ? Boolean(canvasNest.enable) : false
  form.fireworksEnable = fireworks.enable !== undefined ? Boolean(fireworks.enable) : false
  form.fireworksMobile = fireworks.mobile !== undefined ? Boolean(fireworks.mobile) : false
  form.clickHeartEnable = clickHeart.enable !== undefined ? Boolean(clickHeart.enable) : false
  form.clickHeartMobile = clickHeart.mobile !== undefined ? Boolean(clickHeart.mobile) : false
  form.clickShowTextEnable = clickShowText.enable !== undefined ? Boolean(clickShowText.enable) : false
  form.clickShowTextMobile = clickShowText.mobile !== undefined ? Boolean(clickShowText.mobile) : false
  form.activatePowerModeEnable = activatePowerMode.enable !== undefined ? Boolean(activatePowerMode.enable) : false
  form.activatePowerModeColorful = activatePowerMode.colorful !== undefined ? Boolean(activatePowerMode.colorful) : true
  form.activatePowerModeShake = activatePowerMode.shake !== undefined ? Boolean(activatePowerMode.shake) : false
  form.activatePowerModeMobile = activatePowerMode.mobile !== undefined ? Boolean(activatePowerMode.mobile) : false
  form.universeEnable = universe.enable !== undefined ? Boolean(universe.enable) : false
  form.bubbleEnable = bubble.enable !== undefined ? Boolean(bubble.enable) : false

  form.aiSummaryEnable = aiSummary.enable !== undefined ? Boolean(aiSummary.enable) : false
  form.aiSummaryGptName = String(aiSummary.gptName ?? 'AnZhiYu')
  form.aiSummaryMode = String(aiSummary.mode ?? 'local')
  form.aiSummarySwitchBtn = aiSummary.switchBtn !== undefined ? Boolean(aiSummary.switchBtn) : false
  form.aiSummaryBtnLink = String(aiSummary.btnLink ?? '')

  form.agreementPopupEnable = agreementPopup.enable !== undefined ? Boolean(agreementPopup.enable) : false
  form.agreementPopupUrl = String(agreementPopup.url ?? '/privacy')

  form.friendsVueEnable = friendsVue.enable !== undefined ? Boolean(friendsVue.enable) : false
  form.friendsVueJs = String(friendsVue.vue_js ?? friendsVue.vueJs ?? '')
  form.friendsVueApiurl = String(friendsVue.apiurl ?? '')
  form.friendsVueTopTips = String(friendsVue.top_tips ?? friendsVue.topTips ?? '')
  form.friendsVueTopBackground = String(friendsVue.top_background ?? friendsVue.topBackground ?? '')
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

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
        list: form.greetingBoxList,
      },
      centerConsole: {
        enable: form.centerConsoleEnable,
        card_tags: {
          enable: form.centerConsoleCardTagsEnable,
          limit: form.centerConsoleCardTagsLimit,
          color: form.centerConsoleCardTagsColor,
        },
        card_archives: {
          enable: form.centerConsoleCardArchivesEnable,
          type: form.centerConsoleCardArchivesType,
          format: form.centerConsoleCardArchivesFormat.trim(),
          order: form.centerConsoleCardArchivesOrder,
          limit: form.centerConsoleCardArchivesLimit,
        },
      },
      dynamicEffect: {
        postTopWave: form.dynamicEffectPostTopWave,
        postTopRollZoomInfo: form.dynamicEffectPostTopRollZoomInfo,
        pageCommentsRollZoom: form.dynamicEffectPageCommentsRollZoom,
      },
      canvasRibbon: { enable: form.canvasRibbonEnable },
      canvasFlutteringRibbon: { enable: form.canvasFlutteringRibbonEnable },
      canvasNest: { enable: form.canvasNestEnable },
      fireworks: { enable: form.fireworksEnable, mobile: form.fireworksMobile },
      clickHeart: { enable: form.clickHeartEnable, mobile: form.clickHeartMobile },
      clickShowText: { enable: form.clickShowTextEnable, mobile: form.clickShowTextMobile },
      activatePowerMode: {
        enable: form.activatePowerModeEnable,
        colorful: form.activatePowerModeColorful,
        shake: form.activatePowerModeShake,
        mobile: form.activatePowerModeMobile,
      },
      universe: { enable: form.universeEnable },
      bubble: { enable: form.bubbleEnable },
      aiSummary: {
        enable: form.aiSummaryEnable,
        gptName: form.aiSummaryGptName.trim(),
        mode: form.aiSummaryMode.trim(),
        switchBtn: form.aiSummarySwitchBtn,
        btnLink: form.aiSummaryBtnLink.trim(),
      },
      agreementPopup: {
        enable: form.agreementPopupEnable,
        url: form.agreementPopupUrl.trim(),
      },
      friendsVue: {
        enable: form.friendsVueEnable,
        vue_js: form.friendsVueJs.trim(),
        apiurl: form.friendsVueApiurl.trim(),
        top_tips: form.friendsVueTopTips.trim(),
        top_background: form.friendsVueTopBackground.trim(),
      },
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
        管理右侧按钮、预加载、导航音乐、翻译、提示消息、欢迎语、动效和互动增强功能。所有配置项均已可视化，保存后前台立刻生效。
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

    <!-- 欢迎语 + 中控台 -->
    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">欢迎语</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.greetingBoxEnable = !form.greetingBoxEnable">
            <span class="text-sm text-text">启用欢迎弹层</span>
            <span class="text-sm text-muted">{{ form.greetingBoxEnable ? '开启' : '关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">默认欢迎语</span>
            <input v-model="form.greetingBoxDefault" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>

        <div class="mt-5 flex items-center justify-between">
          <span class="text-sm font-medium text-text">时间段列表</span>
          <button type="button" class="rounded-2xl border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/15" @click="addGreetingItem">
            + 添加
          </button>
        </div>
        <div v-if="form.greetingBoxList.length" class="mt-3 space-y-3">
          <div v-for="(item, index) in form.greetingBoxList" :key="index" class="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-muted">时段 #{{ index + 1 }}</span>
              <button type="button" class="rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-500 transition hover:bg-rose-100" @click="removeGreetingItem(index)">
                删除
              </button>
            </div>
            <div class="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label class="block space-y-1">
                <span class="text-xs font-medium text-text">欢迎语</span>
                <input v-model="item.greeting" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="早上好鸭👋" />
              </label>
              <label class="block space-y-1">
                <span class="text-xs font-medium text-text">开始时</span>
                <input v-model.number="item.startTime" type="number" min="0" max="24" class="w-full rounded-2xl border border-border bg-background/80 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </label>
              <label class="block space-y-1">
                <span class="text-xs font-medium text-text">结束时</span>
                <input v-model.number="item.endTime" type="number" min="0" max="24" class="w-full rounded-2xl border border-border bg-background/80 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </label>
            </div>
          </div>
        </div>
        <div v-else class="mt-3 text-sm text-muted">暂无时间段，点击"添加"新增。</div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">中控台</h2>
        <div class="mt-5 space-y-4">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleEnable = !form.centerConsoleEnable">
            <span class="text-sm text-text">启用右侧设置面板</span>
            <span class="text-sm text-muted">{{ form.centerConsoleEnable ? '开启' : '关闭' }}</span>
          </button>

          <div class="rounded-3xl border border-border bg-background/60 p-4">
            <p class="text-sm font-semibold text-text">标签卡片</p>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-white/90 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleCardTagsEnable = !form.centerConsoleCardTagsEnable">
                <span class="text-sm text-text">启用</span>
                <span class="text-sm text-muted">{{ form.centerConsoleCardTagsEnable ? '开启' : '关闭' }}</span>
              </button>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">数量限制</span>
                <input v-model.number="form.centerConsoleCardTagsLimit" type="number" min="0" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </label>
            </div>
            <button type="button" class="mt-3 flex w-full items-center justify-between rounded-2xl border border-border bg-white/90 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleCardTagsColor = !form.centerConsoleCardTagsColor">
              <span class="text-sm text-text">标签着色</span>
              <span class="text-sm text-muted">{{ form.centerConsoleCardTagsColor ? '开启' : '关闭' }}</span>
            </button>
          </div>

          <div class="rounded-3xl border border-border bg-background/60 p-4">
            <p class="text-sm font-semibold text-text">归档卡片</p>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-white/90 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleCardArchivesEnable = !form.centerConsoleCardArchivesEnable">
                <span class="text-sm text-text">启用</span>
                <span class="text-sm text-muted">{{ form.centerConsoleCardArchivesEnable ? '开启' : '关闭' }}</span>
              </button>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">归档维度</span>
                <select v-model="form.centerConsoleCardArchivesType" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                  <option value="monthly">按月</option>
                  <option value="yearly">按年</option>
                </select>
              </label>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">日期格式</span>
                <input v-model="form.centerConsoleCardArchivesFormat" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </label>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-text">数量限制</span>
                <input v-model.number="form.centerConsoleCardArchivesLimit" type="number" min="0" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </label>
            </div>
            <button type="button" class="mt-3 flex w-full items-center justify-between rounded-2xl border border-border bg-white/90 px-4 py-4 text-left transition hover:border-primary/20" @click="form.centerConsoleCardArchivesOrder = form.centerConsoleCardArchivesOrder === -1 ? 1 : -1">
              <span class="text-sm text-text">排序方向</span>
              <span class="text-sm text-muted">{{ form.centerConsoleCardArchivesOrder === -1 ? '最新优先' : '最旧优先' }}</span>
            </button>
          </div>
        </div>
      </article>
    </section>

    <!-- 动效开关 -->
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">页面动效</h2>
      <p class="mt-2 text-sm text-muted">控制文章顶部波浪、滚动缩放、背景彩带、粒子、烟花、点击特效等。</p>
      <div class="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.dynamicEffectPostTopWave = !form.dynamicEffectPostTopWave">
          <span class="text-sm text-text">文章顶部波浪</span>
          <span class="text-sm text-muted">{{ form.dynamicEffectPostTopWave ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.dynamicEffectPostTopRollZoomInfo = !form.dynamicEffectPostTopRollZoomInfo">
          <span class="text-sm text-text">顶部滚动缩放</span>
          <span class="text-sm text-muted">{{ form.dynamicEffectPostTopRollZoomInfo ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.dynamicEffectPageCommentsRollZoom = !form.dynamicEffectPageCommentsRollZoom">
          <span class="text-sm text-text">评论滚动缩放</span>
          <span class="text-sm text-muted">{{ form.dynamicEffectPageCommentsRollZoom ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.canvasRibbonEnable = !form.canvasRibbonEnable">
          <span class="text-sm text-text">静止彩带</span>
          <span class="text-sm text-muted">{{ form.canvasRibbonEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.canvasFlutteringRibbonEnable = !form.canvasFlutteringRibbonEnable">
          <span class="text-sm text-text">飘动彩带</span>
          <span class="text-sm text-muted">{{ form.canvasFlutteringRibbonEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.canvasNestEnable = !form.canvasNestEnable">
          <span class="text-sm text-text">粒子线条</span>
          <span class="text-sm text-muted">{{ form.canvasNestEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.fireworksEnable = !form.fireworksEnable">
          <span class="text-sm text-text">烟花效果</span>
          <span class="text-sm text-muted">{{ form.fireworksEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.fireworksMobile = !form.fireworksMobile">
          <span class="text-sm text-text">烟花移动端</span>
          <span class="text-sm text-muted">{{ form.fireworksMobile ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.clickHeartEnable = !form.clickHeartEnable">
          <span class="text-sm text-text">点击爱心</span>
          <span class="text-sm text-muted">{{ form.clickHeartEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.clickHeartMobile = !form.clickHeartMobile">
          <span class="text-sm text-text">爱心移动端</span>
          <span class="text-sm text-muted">{{ form.clickHeartMobile ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.clickShowTextEnable = !form.clickShowTextEnable">
          <span class="text-sm text-text">点击文字</span>
          <span class="text-sm text-muted">{{ form.clickShowTextEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.clickShowTextMobile = !form.clickShowTextMobile">
          <span class="text-sm text-text">文字移动端</span>
          <span class="text-sm text-muted">{{ form.clickShowTextMobile ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.activatePowerModeEnable = !form.activatePowerModeEnable">
          <span class="text-sm text-text">打字粒子</span>
          <span class="text-sm text-muted">{{ form.activatePowerModeEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.activatePowerModeColorful = !form.activatePowerModeColorful">
          <span class="text-sm text-text">粒子彩色</span>
          <span class="text-sm text-muted">{{ form.activatePowerModeColorful ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.activatePowerModeShake = !form.activatePowerModeShake">
          <span class="text-sm text-text">打字震动</span>
          <span class="text-sm text-muted">{{ form.activatePowerModeShake ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.activatePowerModeMobile = !form.activatePowerModeMobile">
          <span class="text-sm text-text">粒子移动端</span>
          <span class="text-sm text-muted">{{ form.activatePowerModeMobile ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.universeEnable = !form.universeEnable">
          <span class="text-sm text-text">深色粒子</span>
          <span class="text-sm text-muted">{{ form.universeEnable ? '开' : '关' }}</span>
        </button>
        <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.bubbleEnable = !form.bubbleEnable">
          <span class="text-sm text-text">气泡上升</span>
          <span class="text-sm text-muted">{{ form.bubbleEnable ? '开' : '关' }}</span>
        </button>
      </div>
    </section>

    <!-- AI摘要 + 协议弹窗 + 友链朋友圈 -->
    <section class="grid gap-6 xl:grid-cols-3">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">AI 摘要</h2>
        <div class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.aiSummaryEnable = !form.aiSummaryEnable">
              <span class="text-sm text-text">启用 AI 摘要</span>
              <span class="text-sm text-muted">{{ form.aiSummaryEnable ? '开启' : '关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.aiSummarySwitchBtn = !form.aiSummarySwitchBtn">
              <span class="text-sm text-text">显示切换按钮</span>
              <span class="text-sm text-muted">{{ form.aiSummarySwitchBtn ? '开启' : '关闭' }}</span>
            </button>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">GPT 名称</span>
            <input v-model="form.aiSummaryGptName" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="AnZhiYu" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">模式</span>
            <select v-model="form.aiSummaryMode" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="local">本地</option>
              <option value="tianli">天理</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">切换按钮链接</span>
            <input v-model="form.aiSummaryBtnLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="https://..." />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">协议弹窗</h2>
        <div class="mt-5 space-y-4">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.agreementPopupEnable = !form.agreementPopupEnable">
            <span class="text-sm text-text">启用协议弹窗</span>
            <span class="text-sm text-muted">{{ form.agreementPopupEnable ? '开启' : '关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">协议页面路径</span>
            <input v-model="form.agreementPopupUrl" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/privacy" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">友链朋友圈</h2>
        <div class="mt-5 space-y-4">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.friendsVueEnable = !form.friendsVueEnable">
            <span class="text-sm text-text">启用友链朋友圈</span>
            <span class="text-sm text-muted">{{ form.friendsVueEnable ? '开启' : '关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">Vue JS 地址</span>
            <input v-model="form.friendsVueJs" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="https://cdn.../friends/index.js" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">朋友圈后端地址</span>
            <input v-model="form.friendsVueApiurl" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">顶部提示语</span>
            <input v-model="form.friendsVueTopTips" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">顶部背景图</span>
            <input v-model="form.friendsVueTopBackground" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
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
