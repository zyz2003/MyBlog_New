<script setup lang="ts">
import { useRightClickMenu } from '@/composables/frontend/useRightClickMenu'

const { isDark, toggleDark } = useTheme()
const { rightClickMenu, translateConfig } = useSiteSettings()

const {
  visible,
  position,
  isImageTarget,
  imageSrc,
  config,
  closeMenu,
  handleCopyText,
  handleCopyLink,
  handleCopyImageUrl,
  handleViewImage,
  handleDownloadImage,
  handleBack,
  handleForward,
  handlePrint,
} = useRightClickMenu()

const isMounted = ref(false)

// Reading mode state
const readingMode = useState<boolean>('site-reading-mode', () => false)

function toggleReadingMode() {
  readingMode.value = !readingMode.value
  if (import.meta.client) {
    document.body.classList.toggle('reading-mode', readingMode.value)
  }
  window.dispatchEvent(new CustomEvent('site:snackbar', {
    detail: { message: readingMode.value ? '阅读模式已开启' : '阅读模式已关闭' },
  }))
  closeMenu()
}

function toggleDarkMode() {
  toggleDark()
  window.dispatchEvent(new CustomEvent('site:snackbar', {
    detail: { message: isDark.value ? '深色模式已开启' : '浅色模式已开启' },
  }))
  closeMenu()
}

// Translate
const currentLanguage = useState<'simplified' | 'traditional'>('site-language-mode', () =>
  translateConfig.value.defaultEncoding === 1 ? 'traditional' : 'simplified',
)

function toggleTranslate() {
  currentLanguage.value = currentLanguage.value === 'simplified' ? 'traditional' : 'simplified'
  window.dispatchEvent(new CustomEvent('site:translate-toggle', {
    detail: { target: currentLanguage.value },
  }))
  window.dispatchEvent(new CustomEvent('site:snackbar', {
    detail: {
      message: currentLanguage.value === 'traditional'
        ? (translateConfig.value.rightMenuMsgToTraditionalChinese || '已切换为繁体')
        : (translateConfig.value.rightMenuMsgToSimplifiedChinese || '已切换为简体'),
    },
  }))
  closeMenu()
}

const translateLabel = computed(() =>
  currentLanguage.value === 'traditional'
    ? (translateConfig.value.rightMenuMsgToSimplifiedChinese || '转为简体')
    : (translateConfig.value.rightMenuMsgToTraditionalChinese || '转为繁体'),
)

// Random post
async function randomPost() {
  try {
    const response = await fetch('/api/articles?pageSize=100')
    const data = await response.json() as { data?: { items?: Array<{ id: number }> } }
    const articles = data.data?.items || []
    if (articles.length > 0) {
      const random = articles[Math.floor(Math.random() * articles.length)]
      navigateTo(`/articles/${random.id}`)
    }
  } catch {
    // no-op
  }
  closeMenu()
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  closeMenu()
}

function scrollToComments() {
  const element = document.getElementById('post-comment')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  closeMenu()
}

function refreshPage() {
  window.location.reload()
}

// Viewport-clamped position
const menuWidth = 196
const menuHeight = 380

const posStyle = computed(() => {
  const vw = typeof window === 'undefined' ? 9999 : window.innerWidth
  const vh = typeof window === 'undefined' ? 9999 : window.innerHeight

  let x = position.value.x
  let y = position.value.y

  // Clamp horizontal: flip to left side if overflowing right
  if (x + menuWidth > vw) {
    x = Math.max(0, x - menuWidth)
  }
  // Clamp vertical: flip upward if overflowing bottom
  if (y + menuHeight > vh) {
    y = Math.max(0, y - menuHeight)
  }

  return { left: `${x}px`, top: `${y}px` }
})

// Remove the contextmenu listener registered by the composable and
// re-register here so the component controls its own lifecycle fully.
// The composable already registers the listener, but we need to ensure
// the component's own state is also synchronized.
onMounted(() => {
  isMounted.value = true
})

onUnmounted(() => {
  // cleanup handled by composable
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rightmenu-fade">
      <div
        v-if="isMounted && visible"
        id="rightMenu"
        class="rightMenu-container"
        :style="posStyle"
      >
        <!-- Small-icon row (Back, Forward, Refresh, Top) -->
        <div v-if="config.backForward" class="rightMenu-group rightMenu-small">
          <button v-if="config.backForward" class="rightMenu-item" @click="handleBack">
            <i class="anzhiyufont anzhiyu-icon-arrow-left" />
          </button>
          <button v-if="config.backForward" class="rightMenu-item" @click="handleForward">
            <i class="anzhiyufont anzhiyu-icon-arrow-right" />
          </button>
          <button class="rightMenu-item" @click="refreshPage">
            <i class="anzhiyufont anzhiyu-icon-arrow-rotate-right" />
          </button>
          <button class="rightMenu-item" @click="scrollToTop">
            <i class="anzhiyufont anzhiyu-icon-arrow-up" />
          </button>
        </div>

        <!-- Divider -->
        <div class="rightMenu-line" />

        <!-- Copy group -->
        <div class="rightMenu-group rightMenuPlugin">
          <button v-if="config.copyText" class="rightMenu-item" @click="handleCopyText">
            <i class="anzhiyufont anzhiyu-icon-copy" />
            <span>复制选中文本</span>
          </button>
          <button v-if="config.copyLink" class="rightMenu-item" @click="handleCopyLink">
            <i class="anzhiyufont anzhiyu-icon-link" />
            <span>复制链接地址</span>
          </button>

          <!-- Image-specific items (conditional) -->
          <button v-if="isImageTarget && config.copyImageUrl" class="rightMenu-item" @click="handleCopyImageUrl">
            <i class="anzhiyufont anzhiyu-icon-images" />
            <span>复制此图片</span>
          </button>
          <button v-if="isImageTarget && config.viewImage" class="rightMenu-item" @click="handleViewImage">
            <i class="anzhiyufont anzhiyu-icon-image" />
            <span>查看此图片</span>
          </button>
          <button v-if="isImageTarget && config.newTabImage" class="rightMenu-item" @click="handleViewImage">
            <i class="anzhiyufont anzhiyu-icon-window-restore" />
            <span>新窗口打开图片</span>
          </button>
          <button v-if="isImageTarget && config.downloadImage" class="rightMenu-item" @click="handleDownloadImage">
            <i class="anzhiyufont anzhiyu-icon-download" />
            <span>下载此图片</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="rightMenu-line" />

        <!-- Navigation group -->
        <div class="rightMenu-group rightMenuOther">
          <NuxtLink v-if="config.home" class="rightMenu-item menu-link" to="/">
            <i class="anzhiyufont anzhiyu-icon-house-chimney" />
            <span>回到首页</span>
          </NuxtLink>
          <NuxtLink v-if="config.archives" class="rightMenu-item menu-link" to="/archive">
            <i class="anzhiyufont anzhiyu-icon-box-archive" />
            <span>博客归档</span>
          </NuxtLink>
          <NuxtLink v-if="config.tags" class="rightMenu-item menu-link" to="/tags">
            <i class="anzhiyufont anzhiyu-icon-tags" />
            <span>文章标签</span>
          </NuxtLink>
          <NuxtLink v-if="config.categories" class="rightMenu-item menu-link" to="/categories">
            <i class="anzhiyufont anzhiyu-icon-shapes" />
            <span>博客分类</span>
          </NuxtLink>
          <button class="rightMenu-item" @click="randomPost">
            <i class="anzhiyufont anzhiyu-icon-shuffle" />
            <span>随便逛逛</span>
          </button>
          <button class="rightMenu-item" @click="scrollToComments">
            <i class="anzhiyufont anzhiyu-icon-comments" />
            <span>查看评论</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="rightMenu-line" />

        <!-- Utility group -->
        <div class="rightMenu-group rightMenuOther">
          <button v-if="config.darkMode" class="rightMenu-item" @click="toggleDarkMode">
            <i v-if="isDark" class="anzhiyufont anzhiyu-icon-sun" />
            <i v-else class="anzhiyufont anzhiyu-icon-moon" />
            <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
          </button>
          <button v-if="config.print" class="rightMenu-item" @click="handlePrint">
            <i class="anzhiyufont anzhiyu-icon-print" />
            <span>打印页面</span>
          </button>
          <button v-if="config.readingMode" class="rightMenu-item" @click="toggleReadingMode">
            <i class="anzhiyufont anzhiyu-icon-book" />
            <span>{{ readingMode ? '退出阅读模式' : '阅读模式' }}</span>
          </button>
          <button v-if="translateConfig.enable" class="rightMenu-item" @click="toggleTranslate">
            <i class="anzhiyufont anzhiyu-icon-language" />
            <span>{{ translateLabel }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rightMenu-container {
  position: fixed;
  z-index: 2000;
  width: 196px;
  max-height: 380px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid var(--style-border-always);
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 88%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 6px 0;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16);
  font-size: 13px;
  transform-origin: top left;
}

.rightMenu-group {
  display: flex;
  flex-direction: column;
}

.rightMenu-small {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 0;
  padding: 0 8px;
}

.rightMenu-small .rightMenu-item {
  width: auto;
  min-width: 44px;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 8px;
}

.rightMenu-small .rightMenu-item span {
  display: none;
}

.rightMenu-small .rightMenu-item i {
  font-size: 14px;
}

.rightMenu-line {
  margin: 4px 10px;
  border-top: 1px solid var(--style-border-always);
}

.rightMenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--anzhiyu-fontcolor);
  font-size: 13px;
  text-align: left;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  border-radius: 0;
}

.rightMenu-item:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 14%, transparent);
  color: var(--anzhiyu-main);
}

.rightMenu-item i {
  width: 16px;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
}

.rightMenu-item span {
  white-space: nowrap;
}

.menu-link {
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
}

.menu-link:hover {
  color: var(--anzhiyu-main);
}

/* Entry/exit animation */
.rightmenu-fade-enter-active {
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.rightmenu-fade-leave-active {
  transition: transform 0.12s ease-in, opacity 0.12s ease-in;
}

.rightmenu-fade-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.rightmenu-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* Reading mode body class effect */
:global(body.reading-mode) {
  --anzhiyu-main: #425AEF;
}

:global(body.reading-mode main .mx-auto) {
  max-width: 920px !important;
}

:global(body.reading-mode #rightside),
:global(body.reading-mode .aside-content) {
  opacity: 0;
  pointer-events: none;
}
</style>