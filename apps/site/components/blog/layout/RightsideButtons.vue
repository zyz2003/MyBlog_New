<template>
  <div
    ref="containerRef"
    class="rightside-buttons"
    :class="{
      'rightside-buttons--hidden': isHidden,
      'rightside-buttons--home-hidden': isHomeHidden,
    }"
  >
    <!-- Search -->
    <button
      v-if="config.search"
      class="rightside-btn"
      title="Search"
      @click="handleSearch"
    >
      <span class="rightside-btn__icon">
        <i class="anzhiyufont anzhiyu-icon-magnifying-glass" />
      </span>
      <span class="rightside-btn__ripple" />
    </button>

    <!-- Dark Mode Toggle -->
    <button
      v-if="config.darkMode"
      class="rightside-btn"
      :title="isDark ? 'Light Mode' : 'Dark Mode'"
      @click="handleDarkToggle"
    >
      <span class="rightside-btn__icon">
        <i :class="isDark ? 'anzhiyufont anzhiyu-icon-sun' : 'anzhiyufont anzhiyu-icon-moon'" />
      </span>
      <span class="rightside-btn__ripple" />
    </button>

    <!-- Music Toggle -->
    <button
      v-if="config.music && musicPlayerConfig.enabled"
      class="rightside-btn rightside-btn--music"
      :class="{ 'rightside-btn--music-playing': isMusicPlaying }"
      title="Music"
      @click="handleMusicToggle"
    >
      <span class="rightside-btn__icon">
        <i class="anzhiyufont anzhiyu-icon-music" />
      </span>
      <span class="rightside-btn__ripple" />
    </button>

    <!-- Reading Mode Toggle -->
    <button
      v-if="config.readingMode"
      class="rightside-btn"
      :title="isReadingMode ? 'Exit Reading Mode' : 'Reading Mode'"
      @click="handleReadingMode"
    >
      <span class="rightside-btn__icon">
        <i class="anzhiyufont anzhiyu-icon-book" />
      </span>
      <span class="rightside-btn__ripple" />
    </button>

    <!-- Back to Top -->
    <button
      v-if="config.backToTop"
      class="rightside-btn rightside-btn--back-top"
      :class="{ 'rightside-btn--visible': showBackToTop }"
      title="Back to Top"
      @click="handleBackToTop"
    >
      <span class="rightside-btn__icon">
        <i class="anzhiyufont anzhiyu-icon-arrow-up" />
      </span>
      <span class="rightside-btn__ripple" />
      <span v-if="showBackToTop" class="rightside-btn__percent">{{ scrollPercent }}%</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from '#imports'
import { useSiteSettings } from '~/composables/frontend/useSiteSettings'
import { useTheme } from '~/composables/frontend/useTheme'

const { rightsideButtons, navMusic, musicPlayer } = useSiteSettings()
const { isDark, toggleDark } = useTheme()
const route = useRoute()

const config = computed(() => rightsideButtons.value)
const musicPlayerConfig = computed(() => musicPlayer.value)

// ---- Scroll Direction ----
const scrollDirection = ref<'up' | 'down' | 'idle'>('idle')
const lastScrollY = ref(0)
const isHidden = ref(false)

function onScroll() {
  const currentY = window.scrollY
  const delta = currentY - lastScrollY.value

  if (Math.abs(delta) < 10) return

  if (delta > 0 && currentY > 100) {
    scrollDirection.value = 'down'
    isHidden.value = true
  } else {
    scrollDirection.value = 'up'
    isHidden.value = false
  }

  lastScrollY.value = currentY
  showBackToTop.value = currentY > 300
  scrollPercent.value = Math.min(100, Math.round((currentY / (document.documentElement.scrollHeight - window.innerHeight)) * 100))
}

// ---- Home Page Hide ----
const isHomeHidden = computed(() => {
  return route.path === '/'
})

// ---- Back to Top ----
const showBackToTop = ref(false)
const scrollPercent = ref(0)

function handleBackToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---- Dark Mode ----
function handleDarkToggle() {
  toggleDark()
}

// ---- Search ----
function handleSearch() {
  window.dispatchEvent(new CustomEvent('site:open-search'))
}

// ---- Music ----
const isMusicPlaying = ref(false)

function handleMusicToggle() {
  window.dispatchEvent(new CustomEvent('site:music-toggle'))
  isMusicPlaying.value = !isMusicPlaying.value
}

// Listen for music state changes from MusicPlayer
function onMusicStateChange(e: Event) {
  const ce = e as CustomEvent
  if (typeof ce.detail?.playing === 'boolean') {
    isMusicPlaying.value = ce.detail.playing
  }
}

// ---- Reading Mode ----
const isReadingMode = ref(false)

function handleReadingMode() {
  isReadingMode.value = !isReadingMode.value
  window.dispatchEvent(new CustomEvent('site:reading-mode-toggle', {
    detail: { active: isReadingMode.value },
  }))
  document.body.classList.toggle('reading-mode', isReadingMode.value)
}

// ---- Click Ripple Animation ----
function addRipple(e: MouseEvent) {
  const btn = (e.currentTarget as HTMLElement)
  const ripple = btn.querySelector('.rightside-btn__ripple') as HTMLElement
  if (!ripple) return

  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.remove('rightside-btn__ripple--active')
  // Force reflow
  void ripple.offsetWidth
  ripple.classList.add('rightside-btn__ripple--active')
}

// ---- Lifecycle ----
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('site:music-state', onMusicStateChange)

  // Attach ripple to all buttons
  const btns = document.querySelectorAll('.rightside-btn')
  btns.forEach(btn => btn.addEventListener('click', addRipple as EventListener))
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('site:music-state', onMusicStateChange)

  const btns = document.querySelectorAll('.rightside-btn')
  btns.forEach(btn => btn.removeEventListener('click', addRipple as EventListener))
})

// Sync music playing state on mount
watch(() => navMusic.value, () => {
  // Reset if nav music config changes
}, { deep: true })
</script>

<style scoped>
.rightside-buttons {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  opacity: 1;
}

.rightside-buttons--hidden {
  transform: translateX(60px);
  opacity: 0;
}

.rightside-buttons--home-hidden {
  transform: translateX(60px);
  opacity: 0;
  pointer-events: none;
}

/* ---- Button ---- */
.rightside-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--style-border-always);
  background: var(--anzhiyu-card-bg);
  color: var(--anzhiyu-fontcolor);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.rightside-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rightside-btn:active {
  transform: scale(0.95);
}

.rightside-btn__icon {
  position: relative;
  z-index: 2;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.rightside-btn:hover .rightside-btn__icon {
  transform: scale(1.15);
}

/* ---- Ripple ---- */
.rightside-btn__ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--anzhiyu-main);
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
  z-index: 1;
}

.rightside-btn__ripple--active {
  animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
  0% {
    opacity: 0.3;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}

/* ---- Music Button ---- */
.rightside-btn--music.rightside-btn--music-playing .rightside-btn__icon {
  animation: music-rotate 2s linear infinite;
}

@keyframes music-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ---- Back to Top ---- */
.rightside-btn--back-top {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.25s ease;
  pointer-events: none;
}

.rightside-btn--back-top.rightside-btn--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.rightside-btn--back-top:hover {
  transform: translateY(0) scale(1.1) !important;
}

.rightside-btn__percent {
  position: absolute;
  bottom: -2px;
  font-size: 10px;
  font-weight: 600;
  color: var(--anzhiyu-fontcolor);
  z-index: 2;
  line-height: 1;
}

/* ---- Dark Mode Icon Transition ---- */
.rightside-btn__icon .anzhiyu-icon-sun,
.rightside-btn__icon .anzhiyu-icon-moon {
  transition: transform 0.3s ease;
}

.rightside-btn:hover .anzhiyu-icon-sun {
  transform: rotate(30deg) scale(1.15);
}

.rightside-btn:hover .anzhiyu-icon-moon {
  transform: rotate(-15deg) scale(1.15);
}

/* ---- Reading Mode Active State ---- */
.reading-mode-active .rightside-btn {
  background: var(--anzhiyu-main);
  color: #fff;
}
</style>
