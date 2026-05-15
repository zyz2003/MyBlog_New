<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleDark } = useTheme()
const visible = ref(false)
const x = ref(0)
const y = ref(0)

function onContextMenu(e: MouseEvent) {
  // Don't show on mobile
  if (window.innerWidth < 768) return
  e.preventDefault()
  x.value = e.clientX
  y.value = e.clientY
  visible.value = true
}

function close() { visible.value = false }

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
  const el = document.getElementById('post-comment')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  close()
}

async function randomPost() {
  try {
    const data = await $fetch('/api/articles', { params: { pageSize: 100 } }) as any
    const articles = data?.data?.items || []
    if (articles.length > 0) {
      const random = articles[Math.floor(Math.random() * articles.length)]
      navigateTo(`/articles/${random.id}`)
    }
  } catch {}
  close()
}

onMounted(() => {
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('click', close)
})

// Prevent menu going off-screen
const posStyle = computed(() => {
  const mx = Math.min(x.value, window.innerWidth - 200)
  const my = Math.min(y.value, window.innerHeight - 320)
  return { left: `${mx}px`, top: `${my}px` }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      id="rightmenu"
      class="fixed z-[1000] w-[180px] rounded-xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] shadow-lg py-1.5 text-sm"
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

      <button class="rightmenu-item" @click="toggleDark">
        <i v-if="isDark" class="anzhiyufont anzhiyu-icon-sun" />
        <i v-else class="anzhiyufont anzhiyu-icon-moon" />
        <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
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
  gap: 8px;
  width: 100%;
  padding: 6px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--anzhiyu-fontcolor);
  font-size: 13px;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.rightmenu-item:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}
.rightmenu-item i {
  width: 16px;
  text-align: center;
  font-size: 14px;
}
</style>
