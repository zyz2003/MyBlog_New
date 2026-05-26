<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useCdnAsset } from '@/composables/frontend/useCdnAsset'

const { navMusic, musicPlayer } = useSiteSettings()
const { resolveAssetUrl } = useCdnAsset()

// ---- State ----
const isExpanded = ref(false)
const isPlaying = ref(false)
const currentTitle = ref('')
const currentArtist = ref('')
const currentCover = ref('')
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(navMusic.value.volume ?? 0.7)
const playlist = ref<Array<{ url: string, title: string, artist: string, cover: string, lrc?: string }>>([])
const currentTrackIndex = ref(0)
const isLoading = ref(false)
const hasError = ref(false)
const assetsLoaded = ref(false)

let audioElement: HTMLAudioElement | null = null

// ---- Computed ----
const isMusicEnabled = computed(() => {
  return musicPlayer.value.enabled && (navMusic.value.enable || navMusic.value.consoleWidescreenMusic) && navMusic.value.id
})

const progressPercent = computed(() => {
  if (duration.value <= 0) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ---- Asset Loading ----
async function loadAsset(tag: 'script' | 'style', url: string) {
  if (tag === 'style') {
    if (document.querySelector(`link[href="${url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
    return
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`)
  if (existing) {
    if (existing.dataset.loaded === 'true') return
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)), { once: true })
    document.head.appendChild(script)
  })
}

async function loadMusicAssets() {
  if (assetsLoaded.value) return
  try {
    isLoading.value = true
    await loadAsset('style', resolveAssetUrl('aplayer_css', 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css'))
    await loadAsset('script', resolveAssetUrl('aplayer_js', 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js'))
    await loadAsset('script', resolveAssetUrl('meting_js', 'https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js'))
    assetsLoaded.value = true
  } catch (error) {
    console.error('[MusicPlayer] Failed to load music assets:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

// ---- Audio Playback ----
function initAudio() {
  if (audioElement) return
  audioElement = new Audio()
  audioElement.volume = volume.value

  audioElement.addEventListener('timeupdate', () => {
    if (audioElement) {
      currentTime.value = audioElement.currentTime
    }
  })

  audioElement.addEventListener('loadedmetadata', () => {
    if (audioElement) {
      duration.value = audioElement.duration
    }
  })

  audioElement.addEventListener('ended', () => {
    playNext()
  })

  audioElement.addEventListener('play', () => {
    isPlaying.value = true
    broadcastState()
  })

  audioElement.addEventListener('pause', () => {
    isPlaying.value = false
    broadcastState()
  })

  audioElement.addEventListener('error', () => {
    hasError.value = true
    isPlaying.value = false
    broadcastState()
  })
}

function loadTrack(index: number) {
  if (!audioElement || playlist.value.length === 0) return
  const track = playlist.value[index]
  if (!track) return

  currentTrackIndex.value = index
  currentTitle.value = track.title || 'Unknown'
  currentArtist.value = track.artist || 'Unknown'
  currentCover.value = track.cover || ''
  hasError.value = false

  audioElement.src = track.url
  audioElement.load()
}

function play() {
  if (!audioElement) return
  audioElement.play().catch(() => {
    hasError.value = true
  })
}

function pause() {
  if (!audioElement) return
  audioElement.pause()
}

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function playNext() {
  if (playlist.value.length === 0) return
  const nextIndex = (currentTrackIndex.value + 1) % playlist.value.length
  loadTrack(nextIndex)
  nextTick(() => play())
}

function playPrev() {
  if (playlist.value.length === 0) return
  const prevIndex = (currentTrackIndex.value - 1 + playlist.value.length) % playlist.value.length
  loadTrack(prevIndex)
  nextTick(() => play())
}

function seekTo(e: MouseEvent) {
  if (!audioElement || duration.value <= 0) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioElement.currentTime = percent * duration.value
}

function setVolume(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const newVol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  volume.value = newVol
  if (audioElement) {
    audioElement.volume = newVol
  }
}

// ---- Broadcast State to RightsideButtons ----
function broadcastState() {
  window.dispatchEvent(new CustomEvent('site:music-state', {
    detail: { playing: isPlaying.value },
  }))
}

// ---- Toggle from RightsideButtons ----
function onMusicToggle() {
  if (!isMusicEnabled.value) return
  if (!isExpanded.value) {
    isExpanded.value = true
    if (!isPlaying.value && playlist.value.length > 0) {
      play()
    }
  } else {
    togglePlay()
  }
}

// ---- Expand/Collapse ----
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !isPlaying.value && playlist.value.length > 0) {
    // Don't auto-play on expand click, just show the player
  }
}

function collapse() {
  isExpanded.value = false
}

// ---- MetingJS Integration ----
// The meting-js custom element handles playlist fetching and APlayer creation.
// We listen for the APlayer instance to sync state.
function findAPlayerInstance(): any {
  const metingEl = document.querySelector('meting-js')
  if (metingEl && (metingEl as any).aplayer) {
    return (metingEl as any).aplayer
  }
  return null
}

let aplayerPollTimer: ReturnType<typeof setInterval> | null = null

function pollAPlayerInstance() {
  aplayerPollTimer = setInterval(() => {
    const aplayer = findAPlayerInstance()
    if (aplayer) {
      if (aplayerPollTimer) {
        clearInterval(aplayerPollTimer)
        aplayerPollTimer = null
      }
      syncFromAPlayer(aplayer)
    }
  }, 500)
}

function syncFromAPlayer(aplayer: any) {
  try {
    // Get playlist from APlayer
    const list = aplayer.list
    if (list && list.audios && list.audios.length) {
      playlist.value = list.audios.map((audio: any) => ({
        url: String(audio.url || ''),
        title: String(audio.name || audio.title || ''),
        artist: String(audio.artist || ''),
        cover: String(audio.cover || ''),
        lrc: audio.lrc ? String(audio.lrc) : undefined,
      }))

      // Sync current track info
      const currentIndex = list.index ?? 0
      if (playlist.value[currentIndex]) {
        currentTrackIndex.value = currentIndex
        currentTitle.value = playlist.value[currentIndex].title
        currentArtist.value = playlist.value[currentIndex].artist
        currentCover.value = playlist.value[currentIndex].cover
      }
    }

    // Sync play state
    isPlaying.value = !aplayer.audio.paused
    currentTime.value = aplayer.audio.currentTime || 0
    duration.value = aplayer.audio.duration || 0
    broadcastState()

    // Listen for APlayer events
    aplayer.on('play', () => {
      isPlaying.value = true
      const idx = aplayer.list.index
      if (playlist.value[idx]) {
        currentTrackIndex.value = idx
        currentTitle.value = playlist.value[idx].title
        currentArtist.value = playlist.value[idx].artist
        currentCover.value = playlist.value[idx].cover
      }
      broadcastState()
    })

    aplayer.on('pause', () => {
      isPlaying.value = false
      broadcastState()
    })

    aplayer.on('timeupdate', () => {
      currentTime.value = aplayer.audio.currentTime || 0
      duration.value = aplayer.audio.duration || 0
    })

    // Use APlayer's audio element for seeking/volume
    audioElement = aplayer.audio
  } catch (e) {
    console.warn('[MusicPlayer] Failed to sync with APlayer:', e)
  }
}

// ---- Lifecycle ----
onMounted(async () => {
  if (!isMusicEnabled.value) return

  await loadMusicAssets()

  window.addEventListener('site:music-toggle', onMusicToggle as EventListener)

  // Poll for APlayer instance created by meting-js
  pollAPlayerInstance()

  // Fallback: if APlayer is not found within 10s, try direct MetingJS API
  setTimeout(() => {
    if (playlist.value.length === 0 && !hasError.value) {
      fetchPlaylistFromMetingAPI()
    }
  }, 10000)
})

onUnmounted(() => {
  window.removeEventListener('site:music-toggle', onMusicToggle as EventListener)
  if (aplayerPollTimer) {
    clearInterval(aplayerPollTimer)
    aplayerPollTimer = null
  }
  if (audioElement) {
    audioElement.pause()
    audioElement.src = ''
    audioElement = null
  }
})

// ---- Fallback: Direct MetingJS API ----
async function fetchPlaylistFromMetingAPI() {
  if (!navMusic.value.id) return
  try {
    const server = navMusic.value.server || 'netease'
    const id = navMusic.value.id
    const apiUrl = `https://api.meting.qjqq.cn/?server=${server}&type=playlist&id=${id}`
    const response = await $fetch<Array<{ url: string, title: string, author: string, pic: string, lrc?: string }>>(apiUrl)

    if (Array.isArray(response) && response.length > 0) {
      playlist.value = response.map(item => ({
        url: String(item.url || ''),
        title: String(item.title || ''),
        artist: String(item.author || ''),
        cover: String(item.pic || ''),
        lrc: item.lrc ? String(item.lrc) : undefined,
      }))

      // Initialize audio element for fallback playback
      initAudio()
      loadTrack(0)
    }
  } catch (e) {
    console.warn('[MusicPlayer] Failed to fetch playlist from MetingJS API:', e)
    hasError.value = true
  }
}

// Watch for music toggle from keyboard shortcut
watch(() => navMusic.value, () => {
  // Re-evaluate enabled state
}, { deep: true })
</script>

<template>
  <div
    v-if="isMusicEnabled"
    id="nav-music"
    class="nav-music"
    :class="{
      'nav-music--playing': isPlaying,
      'nav-music--expanded': isExpanded,
      'nav-music--loading': isLoading,
      'nav-music--error': hasError,
    }"
  >
    <!-- MetingJS element (hidden, used for APlayer initialization) -->
    <div v-show="false" class="nav-music__meting">
      <meting-js
        :id="navMusic.id"
        :server="navMusic.server"
        type="playlist"
        mutex="true"
        preload="none"
        theme="var(--anzhiyu-main)"
        data-lrctype="0"
        order="random"
        :volume="String(navMusic.volume)"
      />
    </div>

    <!-- Mini Mode: Floating disc -->
    <div
      v-show="!isExpanded"
      class="nav-music__mini"
      @click="toggleExpand"
    >
      <div class="nav-music__disc" :class="{ 'nav-music__disc--spinning': isPlaying }">
        <img
          v-if="currentCover"
          :src="currentCover"
          alt="Album cover"
          class="nav-music__cover"
        />
        <i v-else class="anzhiyufont anzhiyu-icon-music nav-music__default-icon" />
      </div>
    </div>

    <!-- Expanded Mode: Full player card -->
    <transition name="music-expand">
      <div v-if="isExpanded" class="nav-music__expanded">
        <!-- Header with close button -->
        <div class="nav-music__header">
          <span class="nav-music__label">Now Playing</span>
          <button class="nav-music__close" @click="collapse">
            <i class="anzhiyufont anzhiyu-icon-xmark" />
          </button>
        </div>

        <!-- Album Cover -->
        <div class="nav-music__artwork">
          <img
            v-if="currentCover"
            :src="currentCover"
            alt="Album cover"
            class="nav-music__artwork-img"
            :class="{ 'nav-music__artwork-img--spinning': isPlaying }"
          />
          <div v-else class="nav-music__artwork-placeholder">
            <i class="anzhiyufont anzhiyu-icon-music" />
          </div>
        </div>

        <!-- Track Info -->
        <div class="nav-music__info">
          <div class="nav-music__title">{{ currentTitle || 'No track selected' }}</div>
          <div class="nav-music__artist">{{ currentArtist }}</div>
        </div>

        <!-- Progress Bar -->
        <div class="nav-music__progress" @click="seekTo">
          <div class="nav-music__progress-bar">
            <div
              class="nav-music__progress-filled"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div class="nav-music__progress-time">
            <span>{{ formattedCurrentTime }}</span>
            <span>{{ formattedDuration }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="nav-music__controls">
          <button class="nav-music__ctrl-btn" title="Previous" @click="playPrev">
            <i class="anzhiyufont anzhiyu-icon-arrow-left" />
          </button>
          <button class="nav-music__ctrl-btn nav-music__ctrl-btn--play" :title="isPlaying ? 'Pause' : 'Play'" @click="togglePlay">
            <i :class="isPlaying ? 'anzhiyufont anzhiyu-icon-pause' : 'anzhiyufont anzhiyu-icon-repeat'" />
          </button>
          <button class="nav-music__ctrl-btn" title="Next" @click="playNext">
            <i class="anzhiyufont anzhiyu-icon-arrow-right" />
          </button>
        </div>

        <!-- Volume -->
        <div class="nav-music__volume">
          <i class="anzhiyufont anzhiyu-icon-music nav-music__volume-icon" />
          <div class="nav-music__volume-bar" @click="setVolume">
            <div
              class="nav-music__volume-filled"
              :style="{ width: `${volume * 100}%` }"
            />
          </div>
        </div>

        <!-- Error State -->
        <div v-if="hasError" class="nav-music__error">
          Failed to load music. Please try again later.
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.nav-music {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 45;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left bottom;
}

.nav-music:active {
  transform: scale(0.97);
}

/* ---- Playing Shadow Animation ---- */
.nav-music--playing {
  animation: playing-shadow 5s linear infinite;
}

@keyframes playing-shadow {
  0%, 100% { box-shadow: 0 0 12px -3px transparent; }
  50% { box-shadow: 0 0 12px 0 var(--anzhiyu-main); }
}

/* ---- Mini Mode ---- */
.nav-music__mini {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--anzhiyu-card-bg);
  border: 1px solid var(--style-border-always);
  box-shadow: var(--anzhiyu-shadow-border);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-music--playing .nav-music__mini {
  background: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
  box-shadow: 0 0 14px rgba(66, 90, 239, 0.4);
}

.nav-music__mini:hover {
  transform: scale(1.08);
}

/* ---- Disc ---- */
.nav-music__disc {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.nav-music__disc--spinning {
  animation: disc-spin 10s linear infinite;
}

@keyframes disc-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nav-music__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.nav-music__default-icon {
  font-size: 18px;
  color: var(--anzhiyu-fontcolor);
  transition: color 0.3s;
}

.nav-music--playing .nav-music__default-icon {
  color: var(--anzhiyu-white);
}

/* ---- Expanded Mode ---- */
.nav-music__expanded {
  width: 300px;
  padding: 20px;
  border-radius: 22px;
  background: var(--anzhiyu-card-bg);
  border: 1px solid var(--style-border-always);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);
  backdrop-filter: saturate(180%) blur(20px);
}

.nav-music--playing .nav-music__expanded {
  background: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
}

/* ---- Header ---- */
.nav-music__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-music__label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--anzhiyu-secondtext);
  transition: color 0.3s;
}

.nav-music--playing .nav-music__label {
  color: rgba(255, 255, 255, 0.7);
}

.nav-music__close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: var(--anzhiyu-fontcolor);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.nav-music--playing .nav-music__close {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-music__close:hover {
  background: rgba(0, 0, 0, 0.12);
}

/* ---- Artwork ---- */
.nav-music__artwork {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  background: var(--anzhiyu-secondbg);
}

.nav-music__artwork-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.nav-music__artwork-img--spinning {
  animation: artwork-spin 20s linear infinite;
}

@keyframes artwork-spin {
  from { transform: rotate(0deg) scale(1.05); }
  to { transform: rotate(360deg) scale(1.05); }
}

.nav-music__artwork-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--anzhiyu-secondtext);
}

/* ---- Track Info ---- */
.nav-music__info {
  margin-bottom: 12px;
}

.nav-music__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.nav-music--playing .nav-music__title {
  color: white;
}

.nav-music__artist {
  font-size: 13px;
  color: var(--anzhiyu-secondtext);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.nav-music--playing .nav-music__artist {
  color: rgba(255, 255, 255, 0.7);
}

/* ---- Progress ---- */
.nav-music__progress {
  margin-bottom: 12px;
  cursor: pointer;
}

.nav-music__progress-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: background 0.3s;
}

.nav-music--playing .nav-music__progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.nav-music__progress-filled {
  height: 100%;
  border-radius: 2px;
  background: var(--anzhiyu-main);
  transition: width 0.1s linear;
}

.nav-music--playing .nav-music__progress-filled {
  background: white;
}

.nav-music__progress-time {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: var(--anzhiyu-secondtext);
  transition: color 0.3s;
}

.nav-music--playing .nav-music__progress-time {
  color: rgba(255, 255, 255, 0.6);
}

/* ---- Controls ---- */
.nav-music__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.nav-music__ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: var(--anzhiyu-fontcolor);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-music--playing .nav-music__ctrl-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-music__ctrl-btn:hover {
  transform: scale(1.1);
}

.nav-music__ctrl-btn:active {
  transform: scale(0.95);
}

.nav-music__ctrl-btn--play {
  width: 44px;
  height: 44px;
  background: var(--anzhiyu-main);
  color: white;
}

.nav-music--playing .nav-music__ctrl-btn--play {
  background: white;
  color: var(--anzhiyu-main);
}

.nav-music__ctrl-btn--play:hover {
  transform: scale(1.12);
}

/* ---- Volume ---- */
.nav-music__volume {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-music__volume-icon {
  font-size: 14px;
  color: var(--anzhiyu-secondtext);
  transition: color 0.3s;
}

.nav-music--playing .nav-music__volume-icon {
  color: rgba(255, 255, 255, 0.6);
}

.nav-music__volume-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  transition: background 0.3s;
}

.nav-music--playing .nav-music__volume-bar {
  background: rgba(255, 255, 255, 0.2);
}

.nav-music__volume-filled {
  height: 100%;
  border-radius: 2px;
  background: var(--anzhiyu-main);
  transition: width 0.1s linear;
}

.nav-music--playing .nav-music__volume-filled {
  background: white;
}

/* ---- Error ---- */
.nav-music__error {
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 12px;
  text-align: center;
}

/* ---- Transition ---- */
.music-expand-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.music-expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.music-expand-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.music-expand-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* ---- Hidden meting-js container ---- */
.nav-music__meting {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ---- Responsive ---- */
@media (max-width: 1200px) {
  .nav-music {
    display: none;
  }
}
</style>
