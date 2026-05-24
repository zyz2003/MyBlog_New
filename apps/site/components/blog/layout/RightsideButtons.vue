<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

type ButtonId = 'readmode' | 'translate' | 'darkmode' | 'hide-aside-btn' | 'mobile-toc-button' | 'to_comment'

const { isDark, toggleDark } = useTheme()
const {
  rightsideButtons,
  settings,
  darkmodeConfig,
  translateConfig,
  readmodeEnabled,
  centerConsole,
} = useSiteSettings()

const isMounted = ref(false)
const configExpanded = ref(false)
const actionButtonClass = 'rightside-button'
const currentLanguage = useState<'simplified' | 'traditional'>('site-language-mode', () =>
  translateConfig.value.defaultEncoding === 1 ? 'traditional' : 'simplified',
)

// Layout toggle
const isDoubleColumn = ref(false)

onMounted(() => {
  isMounted.value = true
  const savedLayout = localStorage.getItem('homepage_layout')
  isDoubleColumn.value = savedLayout === 'double'
})

function toggleLayout() {
  isDoubleColumn.value = !isDoubleColumn.value
  localStorage.setItem('homepage_layout', isDoubleColumn.value ? 'double' : 'single')
  // Update the post grid class
  const grid = document.getElementById('recent-posts')?.querySelector('.post-grid')
  if (grid) {
    grid.classList.toggle('post-grid-double', isDoubleColumn.value)
  }
}

function normalizeButtonId(id: string): ButtonId | 'go-up' | 'chat' | '' {
  const aliasMap: Record<string, ButtonId | 'go-up' | 'chat'> = {
    readmode: 'readmode',
    translate: 'translate',
    darkmode: 'darkmode',
    hideAside: 'hide-aside-btn',
    'hide-aside-btn': 'hide-aside-btn',
    toc: 'mobile-toc-button',
    'mobile-toc-button': 'mobile-toc-button',
    comment: 'to_comment',
    to_comment: 'to_comment',
    chat: 'chat',
    'go-up': 'go-up',
  }

  return aliasMap[id] || ''
}

const hiddenButtons = computed(() =>
  new Set((rightsideButtons.value.hide || []).map(normalizeButtonId).filter(Boolean)),
)

const rightsideBottom = computed(() => {
  const raw = settings.value['rightside-bottom']
  return typeof raw === 'string' && raw.trim() ? raw.trim() : '100px'
})

const defaultOrder: ButtonId[] = ['readmode', 'translate', 'darkmode', 'hide-aside-btn', 'mobile-toc-button', 'to_comment']

const orderedButtons = computed<ButtonId[]>(() => {
  const raw = rightsideButtons.value.enableOrder
    ? rightsideButtons.value.show
    : defaultOrder

  const sanitized = raw
    .map(normalizeButtonId)
    .filter((id): id is ButtonId => defaultOrder.includes(id as ButtonId))

  const base = sanitized.length ? sanitized : defaultOrder

  return base.filter((id) => {
    if (hiddenButtons.value.has(id)) {
      return false
    }
    if (id === 'translate' && !translateConfig.value.enable) {
      return false
    }
    if (id === 'readmode' && !readmodeEnabled.value) {
      return false
    }
    if (id === 'darkmode' && !darkmodeConfig.value.button) {
      return false
    }
    return true
  })
})

function emitSnackbar(message: string) {
  window.dispatchEvent(new CustomEvent('site:snackbar', { detail: { message } }))
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToComments() {
  const element = document.getElementById('post-comment')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function scrollToToc() {
  const element = document.getElementById('post-toc')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function toggleSidebar() {
  document.documentElement.classList.toggle('hide-aside')
  emitSnackbar(document.documentElement.classList.contains('hide-aside') ? '已收起侧边栏' : '已展开侧边栏')
}

function toggleReadMode() {
  document.documentElement.classList.toggle('read-mode')
  emitSnackbar(document.documentElement.classList.contains('read-mode') ? '阅读模式已开启' : '阅读模式已关闭')
}

function toggleTranslate() {
  currentLanguage.value = currentLanguage.value === 'simplified' ? 'traditional' : 'simplified'
  window.dispatchEvent(new CustomEvent('site:translate-toggle', {
    detail: { target: currentLanguage.value },
  }))
  emitSnackbar(currentLanguage.value === 'traditional'
    ? (translateConfig.value.rightMenuMsgToTraditionalChinese || '已切换为繁体')
    : (translateConfig.value.rightMenuMsgToSimplifiedChinese || '已切换为简体'))
}

function buttonTitle(id: ButtonId) {
  if (id === 'darkmode') {
    return isDark.value ? '浅色模式' : '深色模式'
  }

  if (id === 'translate') {
    return currentLanguage.value === 'traditional'
      ? (translateConfig.value.msgToSimplifiedChinese || '简')
      : (translateConfig.value.msgToTraditionalChinese || '繁')
  }

  return {
    readmode: '阅读模式',
    'hide-aside-btn': '切换侧栏',
    'mobile-toc-button': '目录',
    to_comment: '评论',
  }[id]
}

function handleAction(id: ButtonId) {
  const actions: Record<ButtonId, () => void> = {
    readmode: toggleReadMode,
    translate: toggleTranslate,
    darkmode: () => {
      toggleDark()
      emitSnackbar(isDark.value ? '深色模式已开启' : '浅色模式已开启')
    },
    'hide-aside-btn': toggleSidebar,
    'mobile-toc-button': scrollToToc,
    to_comment: scrollToComments,
  }

  actions[id]()
}
</script>

<template>
  <div
    v-if="isMounted"
    id="rightside"
    class="rightside-panel"
    :style="{ bottom: rightsideBottom }"
  >
    <div v-show="configExpanded" id="rightside-config-hide" class="rightside-group">
      <button
        v-for="buttonId in orderedButtons"
        :id="buttonId"
        :key="buttonId"
        type="button"
        :title="buttonTitle(buttonId)"
        :aria-label="buttonTitle(buttonId)"
        :class="[actionButtonClass, buttonId === 'mobile-toc-button' ? 'md:hidden' : '']"
        @click="handleAction(buttonId)"
      >
        <svg v-if="buttonId === 'readmode'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5.75A2.75 2.75 0 0 1 6.75 3h11.5A1.75 1.75 0 0 1 20 4.75v12.5A1.75 1.75 0 0 1 18.25 19H8.5a3.5 3.5 0 0 0-3.5 3.5V5.75Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.7" />
          <path d="M8.5 19V6.5A2.5 2.5 0 0 0 6 4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" />
          <path d="M11 8h5M11 11h5M11 14h3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" />
        </svg>

        <svg v-else-if="buttonId === 'translate'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5h9M8.5 4v2.5M6.8 11.5A12.4 12.4 0 0 0 10 6.6M5.6 9.2A16.8 16.8 0 0 1 9.6 14M13.5 8l4.8 12M15.2 15.5h5.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
        </svg>

        <template v-else-if="buttonId === 'darkmode'">
          <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.8A8.98 8.98 0 0 1 11.2 3a9 9 0 1 0 9.8 9.8Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.7" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" stroke-width="1.7" />
            <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.72 5.28l-1.56 1.56M6.84 17.16l-1.56 1.56M18.72 18.72l-1.56-1.56M6.84 6.84 5.28 5.28" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" />
          </svg>
        </template>

        <svg v-else-if="buttonId === 'hide-aside-btn'" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7" />
          <path d="M9 5v14M13 9l3 3-3 3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
        </svg>

        <svg v-else-if="buttonId === 'mobile-toc-button'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6.5h11M8 12h11M8 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9" />
        </svg>

        <svg v-else-if="buttonId === 'to_comment'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 18.5H4.5A1.5 1.5 0 0 1 3 17V6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v7A2.5 2.5 0 0 1 18.5 16H10l-3 2.5Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.7" />
          <path d="M8 9h8M8 12.5h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" />
        </svg>
      </button>
    </div>

    <button
      v-if="centerConsole.enable"
      id="rightside-config"
      type="button"
      title="设置"
      aria-label="设置"
      :class="actionButtonClass"
      @click="configExpanded = !configExpanded"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.25A3.75 3.75 0 1 0 12 15.75A3.75 3.75 0 1 0 12 8.25Z" fill="none" stroke="currentColor" stroke-width="1.7" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.05.05a1 1 0 0 1 0 1.42l-1.12 1.12a1 1 0 0 1-1.42 0l-.05-.05a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V20a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.08a1 1 0 0 0-.6-.92 1 1 0 0 0-1.1.2l-.05.05a1 1 0 0 1-1.42 0l-1.12-1.12a1 1 0 0 1 0-1.42l.05-.05a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H4a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1h.08a1 1 0 0 0 .92-.6 1 1 0 0 0-.2-1.1l-.05-.05a1 1 0 0 1 0-1.42l1.12-1.12a1 1 0 0 1 1.42 0l.05.05a1 1 0 0 0 1.1.2h.02a1 1 0 0 0 .58-.92V4a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v.08a1 1 0 0 0 .6.92 1 1 0 0 0 1.1-.2l.05-.05a1 1 0 0 1 1.42 0l1.12 1.12a1 1 0 0 1 0 1.42l-.05.05a1 1 0 0 0-.2 1.1v.02a1 1 0 0 0 .92.58H20a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1h-.08a1 1 0 0 0-.92.6Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" />
      </svg>
    </button>

    <button
      type="button"
      title="切换布局"
      aria-label="切换布局"
      :class="actionButtonClass"
      @click="toggleLayout"
    >
      <svg v-if="isDoubleColumn" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="8" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7" />
        <rect x="13" y="5" width="8" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7" />
        <path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="1.7" />
      </svg>
    </button>

    <button
      v-if="!hiddenButtons.has('go-up')"
      id="go-up"
      type="button"
      title="回到顶部"
      aria-label="回到顶部"
      :class="actionButtonClass"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.rightside-panel {
  position: fixed;
  right: 0.75rem;
  bottom: 100px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  transition: all 0.3s;
}

.rightside-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.rightside-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 16px;
  border: 1px solid var(--style-border-always);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--anzhiyu-card-bg) 92%, white 8%), var(--anzhiyu-card-bg));
  color: var(--anzhiyu-fontcolor);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.rightside-button:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  border-color: var(--anzhiyu-main);
  transform: translateY(-1px);
}

.rightside-button svg {
  width: 1.15rem;
  height: 1.15rem;
  flex: none;
}
</style>
