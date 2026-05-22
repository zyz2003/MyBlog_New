<script setup lang="ts">
import { useScrollDirection } from '@/composables/frontend/useScrollDirection'
const config = useRuntimeConfig()
const {
  settings,
  mourn,
  refresh,
  displayMode,
  themeFont,
  blogTitleFont,
  hrIcon,
  beautify,
  preloader,
  busuanzi,
  interactionEffects,
  darkmodeConfig,
  translateConfig,
  readmodeEnabled,
  snackbar,
  diytitle,
  consoleLog,
  greetingBox,
  laConfig,
  umami,
  displayEnhancements,
  pwa,
} = useSiteSettings()
const { resolveAssetUrl } = useCdnAsset()
const { isDark } = useTheme()
const route = useRoute()

const { isScrolledPastThreshold } = useScrollDirection(56)
const navbarHeight = computed(() => isScrolledPastThreshold.value ? '50px' : '64px')

await refresh()

const themePreferenceStorageKey = 'anzhiyu-theme-mode'
const currentLanguage = useState<'simplified' | 'traditional'>('site-language-mode', () =>
  translateConfig.value.defaultEncoding === 1 ? 'traditional' : 'simplified',
)
const snackbarItems = ref<Array<{ id: number, message: string }>>([])
const shortcutHintsOpen = ref(false)
const agreementVisible = ref(false)
let snackbarSeed = 0
let mediaQueryCleanup: (() => void) | null = null
let titleRestoreCleanup: (() => void) | null = null
let removeInjectHead: (() => void) | null = null
let removeInjectBottom: (() => void) | null = null
let removeShortcutListeners: (() => void) | null = null
let shortcutTimer: number | null = null
let shiftTimer: number | null = null

const siteVerificationMeta = computed(() => {
  const fromList = Array.isArray(settings.value.siteVerification)
    ? (settings.value.siteVerification as Array<Record<string, unknown>>)
        .map(item => ({
          name: String(item.name || '').trim(),
          content: String(item.content || '').trim(),
        }))
        .filter(item => item.name && item.content)
    : []

  const fallback = [
    settings.value.googleVerification ? { name: 'google-site-verification', content: String(settings.value.googleVerification).trim() } : null,
    settings.value.baiduVerification ? { name: 'baidu-site-verification', content: String(settings.value.baiduVerification).trim() } : null,
    settings.value.bingVerification ? { name: 'msvalidate.01', content: String(settings.value.bingVerification).trim() } : null,
  ].filter(Boolean) as Array<{ name: string, content: string }>

  return fromList.length > 0 ? fromList : fallback
})

const googleAdsense = computed(() => {
  const raw = (settings.value.googleAdsense as Record<string, unknown> | undefined) ?? {}
  return {
    enable: Boolean(raw.enable),
    js: String(raw.js || 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),
    client: String(raw.client || ''),
  }
})

const themeColorSettings = computed(() => {
  const raw = (settings.value.themeColor as Record<string, unknown> | undefined) ?? {}
  return {
    enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
    main: String(raw.main || ''),
    darkMain: String(raw.dark_main || ''),
    paginator: String(raw.paginator || ''),
    textSelection: String(raw.text_selection || ''),
    linkColor: String(raw.link_color || ''),
    metaColor: String(raw.meta_color || ''),
    hrColor: String(raw.hr_color || ''),
    codeForeground: String(raw.code_foreground || ''),
    codeBackground: String(raw.code_background || ''),
    tocColor: String(raw.toc_color || ''),
    scrollbarColor: String(raw.scrollbar_color || ''),
    metaThemeColorLight: String(raw.meta_theme_color_light || ''),
    metaThemeColorDark: String(raw.meta_theme_color_dark || ''),
  }
})

const openGraphEnabled = computed(() => settings.value.Open_Graph_meta !== false)
const openGraphMeta = computed(() => (settings.value.openGraphMeta as Record<string, unknown> | undefined) ?? {})
const iconLinks = computed<Array<Record<string, string>>>(() => {
  const links: Array<Record<string, string>> = [
    { rel: 'stylesheet', href: '/api/themes/active.css' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap' },
  ]

  if (displayEnhancements.value.icons.fontawesome) {
    links.push({ rel: 'stylesheet', href: resolveAssetUrl('fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css') })
  }
  if (displayEnhancements.value.icons.fontawesomeAnimationCss) {
    links.push({ rel: 'stylesheet', href: displayEnhancements.value.icons.fontawesomeAnimationCss })
  }
  if (blogTitleFont.value.fontLink.trim()) {
    links.push({ rel: 'stylesheet', href: blogTitleFont.value.fontLink.trim() })
  }
  if (pwa.value.enable) {
    if (pwa.value.appleTouchIcon) {
      links.push({ rel: 'apple-touch-icon', href: pwa.value.appleTouchIcon })
    }
    if (pwa.value.favicon32) {
      links.push({ rel: 'icon', type: 'image/png', sizes: '32x32', href: pwa.value.favicon32 })
    }
    if (pwa.value.favicon16) {
      links.push({ rel: 'icon', type: 'image/png', sizes: '16x16', href: pwa.value.favicon16 })
    }
    if (pwa.value.bookmarkIcon) {
      links.push({ rel: 'shortcut icon', href: pwa.value.bookmarkIcon })
    }
    if (pwa.value.maskIcon) {
      links.push({ rel: 'mask-icon', href: pwa.value.maskIcon, color: themeColorSettings.value.main || '#425AEF' })
    }
    links.push({ rel: 'manifest', href: pwa.value.manifest || '/api/pwa/manifest.webmanifest' })
  }

  return links
})

const analyticsScripts = computed(() => {
  const scripts: Array<Record<string, string | boolean>> = []
  const googleId = String(((settings.value.googleAnalytics as Record<string, unknown> | undefined)?.id) || '').trim()
  const cloudflareId = String(((settings.value.cloudflareAnalytics as Record<string, unknown> | undefined)?.id) || '').trim()
  const clarityId = String(((settings.value.microsoftClarity as Record<string, unknown> | undefined)?.id) || '').trim()

  if (googleAdsense.value.enable && googleAdsense.value.client) {
    scripts.push({
      key: 'adsense-script',
      src: googleAdsense.value.js,
      async: true,
      crossorigin: 'anonymous',
      'data-ad-client': googleAdsense.value.client,
    })
  }

  if (googleId) {
    scripts.push({
      key: 'ga-script',
      src: `https://www.googletagmanager.com/gtag/js?id=${googleId}`,
      async: true,
    })
    scripts.push({
      key: 'ga-inline',
      innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleId}');`,
    })
  }

  if (cloudflareId) {
    scripts.push({
      key: 'cloudflare-script',
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      defer: true,
      'data-cf-beacon': JSON.stringify({ token: cloudflareId }),
    })
  }

  if (clarityId) {
    scripts.push({
      key: 'clarity-inline',
      innerHTML: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`,
    })
  }

  if (laConfig.value.enable && laConfig.value.ck && laConfig.value.LingQueMonitorID) {
    scripts.push({
      key: 'la51-sdk',
      src: 'https://sdk.51.la/js-sdk-pro.min.js',
      defer: true,
    })
    scripts.push({
      key: 'la51-inline',
      innerHTML: `window.addEventListener('load',function(){if(window.LingQue&&window.LingQue.Monitor){new window.LingQue.Monitor().init({id:'${laConfig.value.LingQueMonitorID}',ck:'${laConfig.value.ck}',sendSuspicious:true});}});`,
    })
  }

  if (umami.value.enable && umami.value.apiHost && umami.value.websiteId) {
    scripts.push({
      key: 'umami-script',
      src: `${umami.value.apiHost.replace(/\/$/, '')}/script.js`,
      defer: true,
      'data-website-id': umami.value.websiteId,
    })
  }

  if (busuanzi.value.siteUv || busuanzi.value.sitePv || busuanzi.value.pagePv) {
    scripts.push({
      key: 'busuanzi-script',
      async: true,
      src: resolveAssetUrl('busuanzi', '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'),
    })
  }

  if (displayEnhancements.value.icons.aliIconfontJs) {
    scripts.push({
      key: 'ali-iconfont',
      src: displayEnhancements.value.icons.aliIconfontJs,
      async: true,
    })
  }

  if (displayEnhancements.value.instantpage) {
    scripts.push({
      key: 'instantpage-script',
      type: 'module',
      src: resolveAssetUrl('instantpage', 'https://cdn.jsdelivr.net/npm/instant.page@5.2.0/instantpage.min.js'),
    })
  }

  return scripts
})

const metaThemeColor = computed(() => {
  if (!themeColorSettings.value.enable) {
    return ''
  }
  return isDark.value ? themeColorSettings.value.metaThemeColorDark : themeColorSettings.value.metaThemeColorLight
})
const shortcutConfig = computed(() => {
  const raw = (settings.value.shortcutKey as Record<string, unknown> | undefined) ?? {}
  return {
    enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
    delay: Math.max(0, Number(raw.delay) || 0),
    shiftDelay: Math.max(0, Number(raw.shiftDelay) || 0),
  }
})
const accesskeyConfig = computed(() => {
  const raw = (settings.value.accesskey as Record<string, unknown> | undefined) ?? {}
  return {
    enable: raw.enable !== undefined ? Boolean(raw.enable) : true,
  }
})
const agreementPopupConfig = computed(() => {
  const raw = (settings.value.agreementPopup as Record<string, unknown> | undefined) ?? {}
  return {
    enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
    url: String(raw.url || '/privacy'),
  }
})
const injectMarkup = computed(() => {
  const raw = (settings.value.inject as Record<string, unknown> | undefined) ?? {}
  const normalize = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map(item => String(item).trim()).filter(Boolean).join('\n')
    }
    return typeof value === 'string' ? value.trim() : ''
  }
  return {
    head: normalize(raw.head),
    bottom: normalize(raw.bottom),
  }
})
const shortcutItems = computed(() => [
  { key: 'H', description: '返回首页' },
  { key: 'A', description: '打开归档页' },
  { key: 'F', description: '打开友链页' },
  { key: 'S', description: '打开搜索' },
  { key: 'D', description: '切换明暗模式' },
  { key: 'R', description: '随机文章' },
  { key: 'T', description: '回到顶部' },
  { key: 'Shift + ?', description: '显示快捷键面板' },
])

const todayKey = computed(() => {
  const today = new Date()
  return `${today.getMonth() + 1}-${today.getDate()}`
})

const isMourningDay = computed(() =>
  route.path === '/' && mourn.value.enable && mourn.value.days.includes(todayKey.value),
)

const beautifyScopeClass = computed(() => beautify.value.enable ? (beautify.value.field === 'site' ? 'beautify-site' : 'beautify-post') : '')
const pwaThemeColor = computed(() => {
  const raw = pwa.value.themeColor?.trim()
  if (!raw) {
    return themeColorSettings.value.main || '#425AEF'
  }
  if (raw.startsWith('var(') && import.meta.client) {
    const variableName = raw.slice(4, -1).trim()
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() || themeColorSettings.value.main || '#425AEF'
  }
  return raw
})
const clickTextIndex = ref(0)

function enqueueSnackbar(message: string) {
  if (!snackbar.value.enable || !message.trim()) {
    return
  }
  const item = { id: ++snackbarSeed, message: message.trim() }
  snackbarItems.value.push(item)
  window.setTimeout(() => {
    snackbarItems.value = snackbarItems.value.filter(entry => entry.id !== item.id)
  }, 2600)
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function clearShortcutTimers() {
  if (shortcutTimer) {
    window.clearTimeout(shortcutTimer)
    shortcutTimer = null
  }
  if (shiftTimer) {
    window.clearTimeout(shiftTimer)
    shiftTimer = null
  }
}

function runShortcutAction(key: string) {
  switch (key) {
    case 'h':
      navigateTo('/')
      break
    case 'a':
      navigateTo('/archive')
      break
    case 'f':
      navigateTo('/friends')
      break
    case 's':
      window.dispatchEvent(new CustomEvent('site:open-search'))
      break
    case 'd':
      window.dispatchEvent(new CustomEvent('site:toggle-dark'))
      break
    case 'r':
      window.dispatchEvent(new CustomEvent('site:random-post'))
      break
    case 't':
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case '?':
      shortcutHintsOpen.value = true
      break
  }
}

function syncInjectedMarkup(target: 'head' | 'bottom', html: string) {
  if (!import.meta.client) {
    return () => {}
  }

  const flag = target === 'head' ? 'data-site-inject-head' : 'data-site-inject-bottom'
  document.querySelectorAll(`[${flag}]`).forEach(node => node.remove())

  if (!html.trim()) {
    return () => {}
  }

  const template = document.createElement('template')
  template.innerHTML = html
  const host = target === 'head' ? document.head : document.body
  const appended: Element[] = []

  Array.from(template.content.children).forEach((node) => {
    const cloned = node.cloneNode(true) as Element
    cloned.setAttribute(flag, 'true')
    host.appendChild(cloned)
    appended.push(cloned)
  })

  return () => {
    appended.forEach(node => node.remove())
  }
}

function initAgreementPopup() {
  if (!import.meta.client) {
    return
  }

  const key = `anzhiyu-agreement:${agreementPopupConfig.value.url}`
  agreementVisible.value = agreementPopupConfig.value.enable && window.localStorage.getItem(key) !== 'accepted'
}

function acceptAgreementPopup() {
  if (!import.meta.client) {
    return
  }

  const key = `anzhiyu-agreement:${agreementPopupConfig.value.url}`
  window.localStorage.setItem(key, 'accepted')
  agreementVisible.value = false
}

function applyDisplayMode(mode: 'light' | 'dark') {
  if (!import.meta.client) {
    return
  }
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.dataset.theme = mode
  isDark.value = mode === 'dark'
}

function isNightTime(start: number, end: number, hour: number) {
  if (start === end) {
    return true
  }
  if (start < end) {
    return hour >= start && hour < end
  }
  return hour >= start || hour < end
}

function resolveDisplayMode(): 'light' | 'dark' {
  if (!darkmodeConfig.value.enable) {
    return 'light'
  }

  if (!import.meta.client) {
    return displayMode.value
  }

  const manualPreference = window.localStorage.getItem(themePreferenceStorageKey)
  if (manualPreference === 'light' || manualPreference === 'dark') {
    return manualPreference
  }

  if (darkmodeConfig.value.autoChangeMode === 1 && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  if (darkmodeConfig.value.autoChangeMode === 2) {
    return isNightTime(darkmodeConfig.value.start, darkmodeConfig.value.end, new Date().getHours()) ? 'dark' : 'light'
  }

  return displayMode.value
}

function createFloatingText(text: string, event: MouseEvent) {
  const node = document.createElement('span')
  node.className = 'click-floating-text'
  node.textContent = text
  node.style.left = `${event.clientX}px`
  node.style.top = `${event.clientY}px`
  node.style.fontSize = interactionEffects.value.clickShowText.fontSize || '15px'
  document.body.appendChild(node)
  window.setTimeout(() => node.remove(), 1500)
}

function createHeart(event: MouseEvent) {
  const node = document.createElement('span')
  node.className = 'click-heart-effect'
  node.textContent = '\u2764'
  node.style.left = `${event.clientX}px`
  node.style.top = `${event.clientY}px`
  document.body.appendChild(node)
  window.setTimeout(() => node.remove(), 1200)
}

function createFireworks(event: MouseEvent) {
  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement('span')
    particle.className = 'click-firework-particle'
    const angle = (Math.PI * 2 * index) / 12
    const distance = 18 + Math.random() * 34
    particle.style.left = `${event.clientX}px`
    particle.style.top = `${event.clientY}px`
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`)
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`)
    particle.style.zIndex = String(interactionEffects.value.fireworks.zIndex || 9999)
    document.body.appendChild(particle)
    window.setTimeout(() => particle.remove(), 800)
  }
}

function isMobileViewport() {
  return import.meta.client && window.innerWidth <= 768
}

function handlePointerEffect(event: MouseEvent) {
  const effects = interactionEffects.value
  const mobile = isMobileViewport()

  if (effects.clickHeart.enable && (!mobile || effects.clickHeart.mobile)) {
    createHeart(event)
  }
  if (effects.fireworks.enable && (!mobile || effects.fireworks.mobile)) {
    createFireworks(event)
  }
  if (effects.clickShowText.enable && (!mobile || effects.clickShowText.mobile)) {
    const pool = effects.clickShowText.text.length ? effects.clickShowText.text : ['Hello']
    const text = effects.clickShowText.random
      ? pool[Math.floor(Math.random() * pool.length)]
      : pool[clickTextIndex.value % pool.length]
    clickTextIndex.value += 1
    createFloatingText(text, event)
  }
  if (effects.activatePowerMode.enable && effects.activatePowerMode.shake) {
    document.body.classList.add('power-mode-shake')
    window.setTimeout(() => document.body.classList.remove('power-mode-shake'), 180)
  }
}

async function loadScript(src: string) {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      return
    }
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

async function applyTranslate(target: 'simplified' | 'traditional') {
  if (!import.meta.client || !translateConfig.value.enable) {
    return
  }

  currentLanguage.value = target
  document.documentElement.lang = target === 'traditional' ? 'zh-Hant' : 'zh-CN'

  await loadScript(resolveAssetUrl('opencc_js', 'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js'))
  const win = window as typeof window & {
    OpenCC?: { Converter: (config: { from: string, to: string }) => (value: string) => string }
  }

  const converter = win.OpenCC?.Converter({
    from: target === 'traditional' ? 'cn' : 'tw',
    to: target === 'traditional' ? 'tw' : 'cn',
  })

  if (!converter) {
    return
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const parentTag = node.parentElement?.tagName
    if (!node.textContent?.trim()) {
      continue
    }
    if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT'].includes(parentTag || '')) {
      continue
    }
    textNodes.push(node)
  }

  textNodes.forEach((node) => {
    node.textContent = converter(node.textContent || '')
  })
}

function handleTranslateToggle(event: Event) {
  const detail = (event as CustomEvent<{ target?: 'simplified' | 'traditional' }>).detail
  const target = detail?.target === 'traditional' ? 'traditional' : 'simplified'
  const delay = Math.max(0, Number(translateConfig.value.translateDelay) || 0)
  window.setTimeout(() => {
    applyTranslate(target).catch((error) => {
      console.error('[default layout] Failed to translate page:', error)
    })
  }, delay)
}

function registerAutoThemeWatcher() {
  if (!import.meta.client) {
    return
  }

  mediaQueryCleanup?.()
  mediaQueryCleanup = null

  if (darkmodeConfig.value.autoChangeMode !== 1 || !window.matchMedia) {
    return
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (!window.localStorage.getItem(themePreferenceStorageKey)) {
      applyDisplayMode(resolveDisplayMode())
    }
  }
  query.addEventListener('change', handler)
  mediaQueryCleanup = () => query.removeEventListener('change', handler)
}

async function registerPwa() {
  if (!import.meta.client || !pwa.value.enable || !('serviceWorker' in navigator)) {
    return
  }
  try {
    await navigator.serviceWorker.register('/sw.js')
  }
  catch (error) {
    console.warn('[default layout] Failed to register service worker:', error)
  }
}

useHead({
  titleTemplate: (titleChunk: string | undefined) => titleChunk ? `${titleChunk} - ${config.public.siteName}` : config.public.siteName,
  meta: [
    ...(metaThemeColor.value ? [{ name: 'theme-color', content: metaThemeColor.value }] : []),
    ...(pwa.value.enable ? [{ name: 'apple-mobile-web-app-capable', content: 'yes' }] : []),
    ...(openGraphEnabled.value
      ? [
          { property: 'og:site_name', content: String(settings.value.siteTitle || config.public.siteName) },
          { property: 'og:type', content: 'website' },
          { property: 'og:title', content: String(settings.value.seoTitle || settings.value.siteTitle || config.public.siteName) },
          { property: 'og:description', content: String(settings.value.seoDescription || '') },
          ...(String(openGraphMeta.value.ogImage || '').trim()
            ? [{ property: 'og:image', content: String(openGraphMeta.value.ogImage).trim() }]
            : []),
          { name: 'twitter:card', content: String(openGraphMeta.value.twitterCard || 'summary_large_image') },
        ]
      : []),
    ...siteVerificationMeta.value.map(item => ({ name: item.name, content: item.content })),
  ],
  link: iconLinks.value,
  script: analyticsScripts.value,
  __dangerouslyDisableSanitizersByTagID: {
    'ga-inline': ['innerHTML'],
    'clarity-inline': ['innerHTML'],
    'la51-inline': ['innerHTML'],
  },
} as any)

function registerDynamicTitle() {
  if (!import.meta.client || !diytitle.value.enable) {
    return
  }

  const originalTitle = document.title
  const handleVisibility = () => {
    if (document.hidden && diytitle.value.leaveTitle) {
      document.title = diytitle.value.leaveTitle
      return
    }
    if (!document.hidden && diytitle.value.backTitle) {
      document.title = diytitle.value.backTitle
      window.setTimeout(() => {
        if (!document.hidden) {
          document.title = originalTitle
        }
      }, 1400)
      return
    }
    if (!document.hidden) {
      document.title = originalTitle
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)
  titleRestoreCleanup = () => {
    document.removeEventListener('visibilitychange', handleVisibility)
    document.title = originalTitle
  }
}

function printConsoleInfo() {
  if (!import.meta.client || !consoleLog.value.enable) {
    return
  }

  const siteName = String(settings.value.siteTitle || config.public.siteName || 'My Blog')
  console.groupCollapsed(`%c ${siteName} `, 'background:#425AEF;color:#fff;padding:4px 10px;border-radius:999px;font-weight:700;')
  console.log('%cTheme%c AnZhiYu Runtime', 'color:#425AEF;font-weight:700;', 'color:#64748B;')
  console.log('%cRoute%c %s', 'color:#425AEF;font-weight:700;', 'color:#64748B;', route.fullPath)
  console.groupEnd()
}

if (import.meta.client) {
  onMounted(() => {
    applyDisplayMode(resolveDisplayMode())
    registerAutoThemeWatcher()
    registerPwa().catch(() => {})
    registerDynamicTitle()
    printConsoleInfo()
    document.addEventListener('click', handlePointerEffect)
    window.addEventListener('site:translate-toggle', handleTranslateToggle as EventListener)
    window.addEventListener('site:snackbar', ((event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      if (detail?.message) {
        enqueueSnackbar(detail.message)
      }
    }) as EventListener)

    if (translateConfig.value.enable) {
      applyTranslate(currentLanguage.value).catch(() => {})
    }

    removeInjectHead = syncInjectedMarkup('head', injectMarkup.value.head)
    removeInjectBottom = syncInjectedMarkup('bottom', injectMarkup.value.bottom)
    initAgreementPopup()

    const handleKeydown = (event: KeyboardEvent) => {
      if ((!shortcutConfig.value.enable && !accesskeyConfig.value.enable) || isEditableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'shift') {
        if (!shortcutConfig.value.enable) {
          return
        }
        if (shiftTimer) {
          window.clearTimeout(shiftTimer)
        }
        shiftTimer = window.setTimeout(() => {}, shortcutConfig.value.shiftDelay)
        return
      }

      if (!shortcutConfig.value.enable) {
        return
      }

      const shouldOpenHelp = event.shiftKey && event.key === '?'
      const supported = ['h', 'a', 'f', 's', 'd', 'r', 't']
      if (!shouldOpenHelp && !supported.includes(key)) {
        return
      }

      event.preventDefault()
      if (shortcutTimer) {
        window.clearTimeout(shortcutTimer)
      }
      shortcutTimer = window.setTimeout(() => {
        runShortcutAction(shouldOpenHelp ? '?' : key)
      }, shortcutConfig.value.delay)
    }

    const handleKeyup = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'shift' && shiftTimer) {
        window.clearTimeout(shiftTimer)
        shiftTimer = null
      }
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
    removeShortcutListeners = () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handlePointerEffect)
    window.removeEventListener('site:translate-toggle', handleTranslateToggle as EventListener)
    mediaQueryCleanup?.()
    titleRestoreCleanup?.()
    clearShortcutTimers()
    removeInjectHead?.()
    removeInjectBottom?.()
    removeShortcutListeners?.()
  })

  watchEffect(() => {
    const resolvedMode = resolveDisplayMode()
    applyDisplayMode(resolvedMode)

    const root = document.documentElement
    const themeColor = themeColorSettings.value

    if (!themeColor.enable) {
      root.style.removeProperty('--anzhiyu-main')
      root.style.removeProperty('--anzhiyu-main-dark')
      root.style.removeProperty('--anzhiyu-paginator')
      root.style.removeProperty('--anzhiyu-selection')
      root.style.removeProperty('--anzhiyu-link-color')
      root.style.removeProperty('--anzhiyu-meta-color')
      root.style.removeProperty('--anzhiyu-hr-color')
      root.style.removeProperty('--anzhiyu-code-foreground')
      root.style.removeProperty('--anzhiyu-code-background')
      root.style.removeProperty('--anzhiyu-toc-color')
      root.style.removeProperty('--anzhiyu-scrollbar')
    }
    else {
      if (themeColor.main) root.style.setProperty('--anzhiyu-main', themeColor.main)
      if (themeColor.darkMain) root.style.setProperty('--anzhiyu-main-dark', themeColor.darkMain)
      if (themeColor.paginator) root.style.setProperty('--anzhiyu-paginator', themeColor.paginator)
      if (themeColor.textSelection) root.style.setProperty('--anzhiyu-selection', themeColor.textSelection)
      if (themeColor.linkColor) root.style.setProperty('--anzhiyu-link-color', themeColor.linkColor)
      if (themeColor.metaColor) root.style.setProperty('--anzhiyu-meta-color', themeColor.metaColor)
      if (themeColor.hrColor) root.style.setProperty('--anzhiyu-hr-color', themeColor.hrColor)
      if (themeColor.codeForeground) root.style.setProperty('--anzhiyu-code-foreground', themeColor.codeForeground)
      if (themeColor.codeBackground) root.style.setProperty('--anzhiyu-code-background', themeColor.codeBackground)
      if (themeColor.tocColor) root.style.setProperty('--anzhiyu-toc-color', themeColor.tocColor)
      if (themeColor.scrollbarColor) root.style.setProperty('--anzhiyu-scrollbar', themeColor.scrollbarColor)
    }

    if (themeFont.value.globalFontSize) root.style.setProperty('--global-font-size', themeFont.value.globalFontSize)
    if (themeFont.value.codeFontSize) root.style.setProperty('--code-font-size', themeFont.value.codeFontSize)
    if (themeFont.value.fontFamily) root.style.setProperty('--global-font-family', themeFont.value.fontFamily)
    if (themeFont.value.codeFontFamily) root.style.setProperty('--code-font-family', themeFont.value.codeFontFamily)
    if (blogTitleFont.value.fontFamily) root.style.setProperty('--blog-title-font-family', blogTitleFont.value.fontFamily)
    root.style.setProperty('--hr-icon-content', `"${hrIcon.value.icon}"`)
    root.style.setProperty('--hr-icon-top', hrIcon.value.iconTop?.trim() || '-0.2rem')
    root.style.setProperty('--beautify-icon-content', `"${beautify.value.titlePrefixIcon}"`)
    root.style.setProperty('--beautify-icon-color', beautify.value.titlePrefixIconColor)
  })

  watch(injectMarkup, (value) => {
    removeInjectHead?.()
    removeInjectBottom?.()
    removeInjectHead = syncInjectedMarkup('head', value.head)
    removeInjectBottom = syncInjectedMarkup('bottom', value.bottom)
  }, { deep: true })

  watch(agreementPopupConfig, () => {
    initAgreementPopup()
  }, { deep: true })
}
</script>

<template>
  <ClientOnly fallback-tag="div">
    <BlogPreloader />
  </ClientOnly>

  <div
    class="frontend-shell min-h-screen flex flex-col bg-background transition-colors duration-300"
    :class="[{ 'is-mourn': isMourningDay, 'hr-icon-enabled': hrIcon.enable }, beautifyScopeClass]"
    :style="{ '--navbar-height': navbarHeight }"
  >
    <div class="shell-orb shell-orb-left" />
    <div class="shell-orb shell-orb-right" />

    <BlogNavbar />

    <main class="relative z-1 flex-1 w-full pb-16 main-content-area">
      <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <MountPointsMountPointBodyEnd />
    <BlogFooter />
  </div>

  <div
    v-if="snackbar.enable"
    class="snackbar-stack"
    :class="[`snackbar-${snackbar.position}`]"
  >
    <transition-group name="snackbar-fade">
      <div
        v-for="item in snackbarItems"
        :key="item.id"
        class="snackbar-item"
        :style="{ background: isDark ? snackbar.bgDark : snackbar.bgLight }"
      >
        {{ item.message }}
      </div>
    </transition-group>
  </div>

  <ClientOnly fallback-tag="div">
    <BlogRightsideButtons />
    <BlogChatServices />
    <BlogRightClickMenu />
    <BlogMusicPlayer />
    <BlogGreetingBox v-if="greetingBox.enable" />
  </ClientOnly>

  <Teleport to="body">
    <div v-if="agreementVisible" class="agreement-mask">
      <div class="agreement-dialog">
        <div class="agreement-chip">Privacy Notice</div>
        <h3 class="agreement-title">访问前请先阅读站点协议</h3>
        <p class="agreement-copy">
          当前站点启用了协议确认弹窗，这项能力现在已经与后台 `agreementPopup` 配置同步。
          你可以先查看协议内容，再继续浏览站点。
        </p>
        <div class="agreement-actions">
          <NuxtLink :to="agreementPopupConfig.url" class="agreement-link">查看协议</NuxtLink>
          <button type="button" class="agreement-confirm" @click="acceptAgreementPopup">
            我已阅读并继续
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="shortcutHintsOpen" class="shortcut-mask" @click="shortcutHintsOpen = false">
      <div class="shortcut-panel" @click.stop>
        <div class="shortcut-head">
          <div>
            <p class="shortcut-kicker">Shortcut Keys</p>
            <h3 class="shortcut-title">前台快捷键面板</h3>
          </div>
          <button type="button" class="shortcut-close" @click="shortcutHintsOpen = false">
            关闭
          </button>
        </div>
        <div class="shortcut-grid">
          <div v-for="item in shortcutItems" :key="item.key" class="shortcut-item">
            <kbd>{{ item.key }}</kbd>
            <span>{{ item.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.frontend-shell {
  position: relative;
  overflow-x: clip;
  font-family: var(--global-font-family, inherit);
  font-size: var(--global-font-size, 16px);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--anzhiyu-main) 12%, transparent) 0, transparent 28rem),
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 8%, transparent) 0, transparent 22rem),
    linear-gradient(180deg, color-mix(in srgb, var(--anzhiyu-background) 92%, white 8%) 0%, var(--anzhiyu-background) 22rem, var(--anzhiyu-background) 100%);
}

:global(::selection) {
  background: var(--anzhiyu-selection, color-mix(in srgb, var(--anzhiyu-main) 30%, white));
  color: #fff;
}

:global(::-webkit-scrollbar-thumb) {
  background: var(--anzhiyu-scrollbar, color-mix(in srgb, var(--anzhiyu-main) 28%, transparent));
  border-radius: 999px;
}

:global(code),
:global(pre),
:global(kbd),
:global(samp) {
  font-family: var(--code-font-family, inherit);
}

:global(pre code) {
  font-size: var(--code-font-size, inherit);
}

:global(#site-name .title),
:global(.banners-title-big) {
  font-family: var(--blog-title-font-family, inherit);
}

.frontend-shell.is-mourn {
  filter: grayscale(1);
}

:global(.dark) {
  --anzhiyu-main: var(--anzhiyu-main-dark, var(--anzhiyu-main));
}

:global(.beautify-post #article-container :is(h1,h2,h3,h4,h5,h6)),
:global(.beautify-site main :is(h1,h2,h3,h4,h5,h6)) {
  position: relative;
  padding-left: 1.4rem;
}

:global(.beautify-post #article-container :is(h1,h2,h3,h4,h5,h6)::before),
:global(.beautify-site main :is(h1,h2,h3,h4,h5,h6)::before) {
  content: var(--beautify-icon-content, "");
  position: absolute;
  left: 0;
  top: 0.05em;
  color: var(--beautify-icon-color, var(--anzhiyu-main));
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  font-size: 0.9em;
}

:global(hr) {
  position: relative;
  overflow: visible;
}

:global(hr)::after {
  content: var(--hr-icon-content, "");
  display: none;
  position: absolute;
  top: var(--hr-icon-top, -0.2rem);
  left: 50%;
  transform: translateX(-50%);
  padding: 0 0.6rem;
  background: var(--anzhiyu-background);
  color: var(--anzhiyu-main);
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
}

.hr-icon-enabled :global(hr)::after {
  display: block;
}

:global(.read-mode main .mx-auto) {
  max-width: 920px !important;
}

:global(.read-mode #rightside),
:global(.read-mode .aside-content) {
  opacity: 0;
  pointer-events: none;
}

:global(.click-floating-text) {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  color: var(--anzhiyu-main);
  font-weight: 700;
  animation: float-up 1.5s ease forwards;
}

:global(.click-heart-effect) {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  color: #ff4d6d;
  transform: translate(-50%, -50%);
  animation: heart-pop 1.2s ease forwards;
}

:global(.click-firework-particle) {
  position: fixed;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 65%, white);
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: firework-burst 0.8s ease-out forwards;
}

:global(body.power-mode-shake) {
  animation: power-shake 0.18s linear;
}

.snackbar-stack {
  position: fixed;
  z-index: 120;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.snackbar-top-left { top: 1.5rem; left: 1.5rem; }
.snackbar-top-center { top: 1.5rem; left: 50%; transform: translateX(-50%); }
.snackbar-top-right { top: 1.5rem; right: 1.5rem; }
.snackbar-bottom-left { bottom: 1.5rem; left: 1.5rem; }
.snackbar-bottom-center { bottom: 1.5rem; left: 50%; transform: translateX(-50%); }
.snackbar-bottom-right { bottom: 1.5rem; right: 1.5rem; }

.snackbar-item {
  min-width: 220px;
  max-width: min(80vw, 420px);
  padding: 0.85rem 1rem;
  border-radius: 16px;
  color: #fff;
  font-size: 0.92rem;
  line-height: 1.5;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
}

.snackbar-fade-enter-active,
.snackbar-fade-leave-active {
  transition: all 0.2s ease;
}

.snackbar-fade-enter-from,
.snackbar-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.agreement-mask,
.shortcut-mask {
  position: fixed;
  inset: 0;
  z-index: 140;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(10px);
}

.agreement-dialog,
.shortcut-panel {
  width: min(100%, 560px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 28px;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 92%, white 8%);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
}

.agreement-dialog {
  padding: 1.5rem;
}

.agreement-chip,
.shortcut-kicker {
  margin: 0 0 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--anzhiyu-main);
}

.agreement-title,
.shortcut-title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--anzhiyu-fontcolor);
}

.agreement-copy {
  margin: 0.9rem 0 0;
  color: var(--anzhiyu-secondtext);
  line-height: 1.8;
}

.agreement-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.4rem;
}

.agreement-link,
.agreement-confirm,
.shortcut-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  transition: transform 0.2s ease, background 0.2s ease;
}

.agreement-link {
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 18%, transparent);
  color: var(--anzhiyu-main);
  text-decoration: none;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
}

.agreement-confirm,
.shortcut-close {
  border: none;
  color: white;
  background: linear-gradient(135deg, var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 68%, #0f172a));
}

.agreement-link:hover,
.agreement-confirm:hover,
.shortcut-close:hover {
  transform: translateY(-1px);
}

.shortcut-panel {
  padding: 1.4rem;
}

.shortcut-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.shortcut-grid {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.2rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  border: 1px solid var(--style-border-always);
  border-radius: 20px;
  background: color-mix(in srgb, var(--anzhiyu-secondbg) 72%, transparent);
  padding: 0.95rem 1rem;
  color: var(--anzhiyu-fontcolor);
}

.shortcut-item kbd {
  min-width: 88px;
  padding: 0.45rem 0.7rem;
  border-radius: 14px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  color: var(--anzhiyu-main);
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.shell-orb {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(40px);
  opacity: 0.45;
}

.shell-orb-left {
  top: 6rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
  background: color-mix(in srgb, var(--anzhiyu-main) 24%, transparent);
}

.shell-orb-right {
  top: 10rem;
  right: -5rem;
  width: 16rem;
  height: 16rem;
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

@keyframes float-up {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.96); }
  100% { opacity: 0; transform: translate(-50%, -130%) scale(1.1); }
}

@keyframes heart-pop {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
  100% { opacity: 0; transform: translate(-50%, -160%) scale(1.4) rotate(12deg); }
}

@keyframes firework-burst {
  0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(0.8); }
  100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.1); }
}

@keyframes power-shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, 1px); }
  75% { transform: translate(1px, 1px); }
}

@media (max-width: 640px) {
  .agreement-actions {
    flex-direction: column;
  }

  .agreement-link,
  .agreement-confirm,
  .shortcut-close {
    width: 100%;
  }

  .shortcut-head {
    flex-direction: column;
  }
}

.main-content-area {
  padding-top: calc(var(--navbar-height, 64px) + 12px);
  transition: padding-top 0.3s ease;
}
</style>
