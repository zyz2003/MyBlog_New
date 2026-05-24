<script setup lang="ts">
const { navMusic } = useSiteSettings()
const { resolveAssetUrl } = useCdnAsset()

async function loadAsset(tag: 'script' | 'style', url: string) {
  if (tag === 'style') {
    if (document.querySelector(`link[href="${url}"]`)) {
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
    return
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`)
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      return
    }
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`failed to load ${url}`)), { once: true })
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
    script.addEventListener('error', () => reject(new Error(`failed to load ${url}`)), { once: true })
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!navMusic.value.enable && !navMusic.value.consoleWidescreenMusic) {
    return
  }

  try {
    await loadAsset('style', resolveAssetUrl('aplayer_css', 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css'))
    await loadAsset('script', resolveAssetUrl('aplayer_js', 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js'))
    await loadAsset('script', resolveAssetUrl('meting_js', 'https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js'))
  }
  catch (error) {
    console.error('[MusicPlayer] Failed to load music assets:', error)
  }
})
</script>

<template>
  <div
    v-if="(navMusic.enable || navMusic.consoleWidescreenMusic) && navMusic.id"
    id="nav-music-wrapper"
    class="nav-music-wrapper"
    :class="{ 'is-console-mode': navMusic.consoleWidescreenMusic && !navMusic.enable }"
  >
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
</template>

<style scoped>
.nav-music-wrapper {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 45;
  width: min(22rem, calc(100vw - 2rem));
}

.nav-music-wrapper.is-console-mode {
  width: min(26rem, calc(100vw - 2rem));
}

.nav-music-wrapper :deep(.aplayer) {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);
}
</style>
