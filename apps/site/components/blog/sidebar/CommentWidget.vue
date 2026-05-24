<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const props = withDefaults(defineProps<{
  allowComment?: boolean
}>(), {
  allowComment: true,
})

const { comments, twikoo, valine, waline, artalk, giscus, visitorMail, settings } = useSiteSettings()
const { resolveAssetUrl } = useCdnAsset()
const route = useRoute()
const currentTheme = ref<'light' | 'dark'>('light')

const shouldShowComments = computed(() => ['true', true, 1, '1'].includes(props.allowComment) && props.allowComment !== false)

const loaded = ref(false)
const initializing = ref(false)
const error = ref('')
const widgetVisible = ref(false)
let visibilityObserver: IntersectionObserver | null = null

type TwikooWindow = Window & {
  twikoo?: {
    init: (options: Record<string, unknown>) => void
  }
  Valine?: new (options: Record<string, unknown>) => unknown
  Waline?: {
    init: (options: Record<string, unknown>) => void
  }
  Artalk?: new (options: Record<string, unknown>) => unknown
  __commentScriptPromises__?: Record<string, Promise<void>>
}

const currentProvider = computed(() => String(comments.value.use || '').trim())
const mountId = computed(() => `comment-mount-${currentProvider.value.toLowerCase() || 'empty'}`)
const hasCommentConfig = computed(() => {
  switch (currentProvider.value) {
    case 'Twikoo':
      return Boolean(twikoo.value.envId)
    case 'Waline':
      return Boolean(waline.value.serverURL)
    case 'Artalk':
      return Boolean(artalk.value.server && artalk.value.site)
    case 'Giscus':
      return Boolean(giscus.value.repo && giscus.value.repoId && giscus.value.categoryId)
    case 'Valine':
      return Boolean(valine.value.appId && valine.value.appKey)
    default:
      return false
  }
})
const dynamicEffect = computed(() => {
  const raw = (settings.value.dynamicEffect as Record<string, unknown> | undefined) ?? {}
  return {
    pageCommentsRollZoom: raw.pageCommentsRollZoom !== undefined ? Boolean(raw.pageCommentsRollZoom) : false,
  }
})

function getScriptCache() {
  const commentWindow = window as TwikooWindow
  if (!commentWindow.__commentScriptPromises__) {
    commentWindow.__commentScriptPromises__ = {}
  }
  return commentWindow.__commentScriptPromises__
}

async function loadScriptOnce(key: string, src: string) {
  if (typeof window === 'undefined') {
    return
  }

  const cache = getScriptCache()
  if (key in cache) {
    return cache[key]
  }

  cache[key] = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[data-comment-script="${key}"]`)
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve()
        return
      }
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error(`${key} script load failed`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.dataset.commentScript = key
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`${key} script load failed`))
    document.head.appendChild(script)
  })

  return cache[key]
}

function ensureStylesheet(id: string, href: string) {
  if (document.querySelector(`link[data-comment-style="${id}"]`)) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.dataset.commentStyle = id
  document.head.appendChild(link)
}

function resetMount() {
  const mountPoint = document.getElementById(mountId.value)
  if (mountPoint) {
    mountPoint.innerHTML = ''
  }
}

async function initTwikoo() {
  await loadScriptOnce('twikoo', resolveAssetUrl('twikoo', 'https://cdn.jsdelivr.net/npm/twikoo@1.6.41/dist/twikoo.all.min.js'))
  const instance = (window as TwikooWindow).twikoo
  if (!instance) {
    throw new Error('Twikoo 未正确加载')
  }
  instance.init({
    envId: twikoo.value.envId,
    region: twikoo.value.region,
    el: `#${mountId.value}`,
    path: route.path,
    ...(twikoo.value.option || {}),
  })
}

async function initWaline() {
  ensureStylesheet('waline', resolveAssetUrl('waline_css', 'https://cdn.jsdelivr.net/npm/@waline/client@3/dist/waline.css'))
  if (waline.value.metaCss) {
    ensureStylesheet('waline-meta', resolveAssetUrl('waline_meta_css', 'https://cdn.jsdelivr.net/npm/@waline/client@3/dist/waline-meta.css'))
  }
  await loadScriptOnce('waline', resolveAssetUrl('waline_js', 'https://cdn.jsdelivr.net/npm/@waline/client@3/dist/waline.js'))
  const instance = (window as TwikooWindow).Waline
  if (!instance) {
    throw new Error('Waline 未正确加载')
  }
  instance.init({
    el: `#${mountId.value}`,
    serverURL: waline.value.serverURL,
    path: route.path,
    pageview: waline.value.pageview,
    imageUploader: waline.value.imageUploader,
    ...(waline.value.option || {}),
  })
}

async function initArtalk() {
  ensureStylesheet('artalk', resolveAssetUrl('artalk_css', 'https://cdn.jsdelivr.net/npm/artalk/dist/Artalk.css'))
  await loadScriptOnce('artalk', resolveAssetUrl('artalk_js', 'https://cdn.jsdelivr.net/npm/artalk/dist/Artalk.js'))
  const ArtalkCtor = (window as TwikooWindow).Artalk
  if (!ArtalkCtor) {
    throw new Error('Artalk 未正确加载')
  }
  new ArtalkCtor({
    el: `#${mountId.value}`,
    pageKey: route.path,
    pageTitle: document.title,
    server: artalk.value.server,
    site: artalk.value.site,
    ...(artalk.value.option || {}),
  })
}

async function initValine() {
  await loadScriptOnce('valine', 'https://cdn.jsdelivr.net/npm/valine/dist/Valine.min.js')
  const ValineCtor = (window as TwikooWindow).Valine
  if (!ValineCtor) {
    throw new Error('Valine 未正确加载')
  }

  new ValineCtor({
    el: `#${mountId.value}`,
    appId: valine.value.appId,
    appKey: valine.value.appKey,
    path: route.path,
    placeholder: valine.value.placeholder,
    avatar: valine.value.avatar,
    lang: valine.value.lang,
    pageSize: valine.value.pageSize,
    guest_info: valine.value.guestInfo,
    recordIP: valine.value.recordIP,
    serverURLs: valine.value.serverURLs || undefined,
    emojiCDN: valine.value.emojiCDN || undefined,
    enableQQ: valine.value.enableQQ,
    visitor: valine.value.visitor,
    master: valine.value.master,
    friends: valine.value.friends,
    requiredFields: valine.value.requiredFields.split(',').map(item => item.trim()).filter(Boolean),
    tagMeta: valine.value.tagMeta.split(',').map(item => item.trim()).filter(Boolean),
    ...valine.value.option,
  })
}

function initGiscus() {
  const mountPoint = document.getElementById(mountId.value)
  if (!mountPoint) {
    throw new Error('Giscus 容器不存在')
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', giscus.value.repo)
  script.setAttribute('data-repo-id', giscus.value.repoId)
  script.setAttribute('data-category-id', giscus.value.categoryId)
  if (giscus.value.option.category) {
    script.setAttribute('data-category', giscus.value.option.category)
  }
  if (giscus.value.option.mapping) {
    script.setAttribute('data-mapping', giscus.value.option.mapping)
  }
  if (giscus.value.option.inputPosition) {
    script.setAttribute('data-input-position', giscus.value.option.inputPosition)
  }
  script.setAttribute('data-lang', giscus.value.option.lang || 'zh-CN')
  script.setAttribute('data-theme', currentTheme.value === 'dark' ? giscus.value.theme.dark : giscus.value.theme.light)
  mountPoint.appendChild(script)
}

function applyVisitorMailPreset() {
  if (!visitorMail.value.enable || !visitorMail.value.mail) {
    return
  }

  window.setTimeout(() => {
    const selectors = [
      'input[type="email"]',
      'input[name="mail"]',
      '.vinput[name="mail"]',
      'input[placeholder*="邮箱"]',
    ]

    const input = selectors
      .map(selector => document.querySelector<HTMLInputElement>(`#${mountId.value} ${selector}`))
      .find(Boolean)

    if (!input || input.value.trim()) {
      return
    }

    input.value = visitorMail.value.mail
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, 260)
}

async function initComments() {
  if (!import.meta.client) {
    return
  }

  if (!currentProvider.value || !hasCommentConfig.value) {
    error.value = ''
    loaded.value = false
    initializing.value = false
    return
  }

  initializing.value = true
  error.value = ''
  resetMount()

  try {
    switch (currentProvider.value) {
      case 'Twikoo':
        await initTwikoo()
        break
      case 'Waline':
        await initWaline()
        break
      case 'Artalk':
        await initArtalk()
        break
      case 'Valine':
        await initValine()
        break
      case 'Giscus':
        initGiscus()
        break
      default:
        throw new Error('当前评论服务未实现')
    }

    applyVisitorMailPreset()
    loaded.value = true
  }
  catch (err: unknown) {
    loaded.value = false
    error.value = err instanceof Error ? err.message : '评论系统初始化失败，请稍后再试。'
  }
  finally {
    initializing.value = false
  }
}

onMounted(() => {
  currentTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  initComments()

  if (!dynamicEffect.value.pageCommentsRollZoom) {
    widgetVisible.value = true
    return
  }

  const target = document.getElementById('post-comment')
  if (!target) {
    widgetVisible.value = true
    return
  }

  const observer = new IntersectionObserver((entries) => {
    widgetVisible.value = entries.some(entry => entry.isIntersecting)
  }, { threshold: 0.15 })

  observer.observe(target)
  visibilityObserver = observer
})

onUnmounted(() => {
  visibilityObserver?.disconnect()
})

watch([currentProvider, hasCommentConfig], () => {
  initComments()
})
</script>

<template>
  <div v-if="shouldShowComments" id="post-comment" class="comment-widget mx-auto max-w-[800px] px-4 py-8" :class="{ 'comment-roll-zoom': dynamicEffect.pageCommentsRollZoom, 'comment-roll-zoom-visible': widgetVisible }">
    <div v-if="comments.text !== false" class="mb-6 flex items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-comments text-lg text-[var(--anzhiyu-main)]" />
      <h3 class="m-0 text-base font-semibold text-[var(--anzhiyu-fontcolor)]">评论</h3>
    </div>

    <div
      v-if="!currentProvider"
      class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-6 py-8 text-center"
    >
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">当前站点尚未启用评论系统。</p>
    </div>

    <div
      v-else-if="!hasCommentConfig"
      class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-6 py-8 text-center"
    >
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">已选择 {{ currentProvider }}，但后台配置尚未完整填写。</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-6 py-8 text-center"
    >
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">{{ error }}</p>
    </div>

    <div
      v-else-if="initializing && !loaded"
      class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-6 py-8 text-center"
    >
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">正在加载评论区...</p>
    </div>

    <div
      :id="mountId"
      v-show="currentProvider && !error"
      class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6 transition-all duration-500"
    />
  </div>
</template>

<style scoped>
.comment-roll-zoom {
  opacity: 0.72;
  transform: translateY(28px) scale(0.965);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.comment-roll-zoom-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
