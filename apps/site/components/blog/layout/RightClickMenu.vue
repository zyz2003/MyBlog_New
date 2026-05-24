<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { isDark, toggleDark } = useTheme()
const { rightClickMenu, translateConfig } = useSiteSettings()

const isMounted = ref(false)
const visible = ref(false)
const x = ref(0)
const y = ref(0)
const currentLanguage = useState<'simplified' | 'traditional'>('site-language-mode', () =>
  translateConfig.value.defaultEncoding === 1 ? 'traditional' : 'simplified',
)

function emitSnackbar(message: string) {
  window.dispatchEvent(new CustomEvent('site:snackbar', { detail: { message } }))
}

function onContextMenu(event: MouseEvent) {
  if (!rightClickMenu.value.enable || window.innerWidth < 768) {
    return
  }
  event.preventDefault()
  x.value = event.clientX
  y.value = event.clientY
  visible.value = true
}

function close() {
  visible.value = false
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  close()
}

function refreshPage() {
  window.location.reload()
}

function goHome() {
  navigateTo('/')
  close()
}

function scrollToComments() {
  const element = document.getElementById('post-comment')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  close()
}

async function randomPost() {
  try {
    const response = await fetch('/api/articles?pageSize=100')
    const data = await response.json() as { data?: { items?: Array<{ id: number }> } }
    const articles = data.data?.items || []
    if (articles.length > 0) {
      const random = articles[Math.floor(Math.random() * articles.length)]
      navigateTo(`/articles/${random.id}`)
    }
  }
  catch {
    // no-op
  }
  close()
}

function toggleTranslate() {
  currentLanguage.value = currentLanguage.value === 'simplified' ? 'traditional' : 'simplified'
  window.dispatchEvent(new CustomEvent('site:translate-toggle', {
    detail: { target: currentLanguage.value },
  }))
  emitSnackbar(currentLanguage.value === 'traditional'
    ? (translateConfig.value.rightMenuMsgToTraditionalChinese || '已切换为繁体')
    : (translateConfig.value.rightMenuMsgToSimplifiedChinese || '已切换为简体'))
  close()
}

const translateLabel = computed(() =>
  currentLanguage.value === 'traditional'
    ? (translateConfig.value.rightMenuMsgToSimplifiedChinese || '转为简体')
    : (translateConfig.value.rightMenuMsgToTraditionalChinese || '转为繁体'),
)

const posStyle = computed(() => {
  const maxX = typeof window === 'undefined' ? x.value : Math.min(x.value, window.innerWidth - 220)
  const maxY = typeof window === 'undefined' ? y.value : Math.min(y.value, window.innerHeight - 360)
  return { left: `${maxX}px`, top: `${maxY}px` }
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  isMounted.value = true
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('click', close)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('click', close)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isMounted && visible"
      id="rightmenu"
      class="fixed z-[1000] w-[196px] rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] py-2 text-sm shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
      :style="posStyle"
    >
      <button class="rightmenu-item" @click="goHome">
        <i class="anzhiyufont anzhiyu-icon-house-chimney" />
        <span>回到首页</span>
      </button>

      <button class="rightmenu-item" @click="scrollToTop">
        <i class="anzhiyufont anzhiyu-icon-arrow-up" />
        <span>回到顶部</span>
      </button>

      <button class="rightmenu-item" @click="refreshPage">
        <i class="anzhiyufont anzhiyu-icon-arrow-rotate-right" />
        <span>刷新页面</span>
      </button>

      <button class="rightmenu-item" @click="toggleDark(); emitSnackbar(isDark ? '深色模式已开启' : '浅色模式已开启'); close()">
        <i v-if="isDark" class="anzhiyufont anzhiyu-icon-sun" />
        <i v-else class="anzhiyufont anzhiyu-icon-moon" />
        <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
      </button>

      <button v-if="translateConfig.enable" class="rightmenu-item" @click="toggleTranslate">
        <i class="anzhiyufont anzhiyu-icon-language" />
        <span>{{ translateLabel }}</span>
      </button>

      <div class="my-1 border-t border-[var(--style-border-always)]" />

      <button class="rightmenu-item" @click="randomPost">
        <i class="anzhiyufont anzhiyu-icon-dice" />
        <span>随机文章</span>
      </button>

      <button class="rightmenu-item" @click="scrollToComments">
        <i class="anzhiyufont anzhiyu-icon-comments" />
        <span>查看文章评论</span>
      </button>
    </div>
  </Teleport>
</template>

<style>
.rightmenu-item {
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
  transition: background 0.15s, color 0.15s;
}

.rightmenu-item:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 14%, transparent);
  color: var(--anzhiyu-main);
}

.rightmenu-item i {
  width: 16px;
  text-align: center;
  font-size: 14px;
}
</style>
