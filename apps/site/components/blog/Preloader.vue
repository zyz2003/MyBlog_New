<script setup lang="ts">
const config = useRuntimeConfig()
const { preloader, profile } = useSiteSettings()
const isMounted = ref(false)
const visible = ref(true)

const loadingSource = computed(() => Number(preloader.value.source || 3))
const loadingAvatar = computed(() => preloader.value.avatar || profile.value.avatar || '')

onMounted(() => {
  isMounted.value = true
  if (document.readyState === 'complete') {
    fadeOut()
  }
  else {
    window.addEventListener('load', fadeOut)
  }
})

onUnmounted(() => {
  window.removeEventListener('load', fadeOut)
})

function fadeOut() {
  setTimeout(() => { visible.value = false }, 400)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isMounted && visible && preloader.enable"
      id="loading-box"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--anzhiyu-background,#fff)] transition-opacity duration-500"
      :class="visible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <div class="loading-content text-center">
        <div class="loading-image mb-6">
          <img v-if="loadingSource === 3 && loadingAvatar" :src="loadingAvatar" :alt="config.public.siteName" class="loading-avatar mx-auto">
          <div v-else-if="loadingSource === 2" class="loading-pace" />
          <svg v-else class="loading-spinner w-16 h-16 mx-auto" viewBox="0 0 50 50">
            <circle
              class="ring"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="var(--anzhiyu-main, #425AEF)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="90 150"
              stroke-dashoffset="0"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <div class="loading-text text-lg font-bold text-[var(--anzhiyu-fontcolor)]">
          {{ config.public.siteName }}
        </div>
        <div class="mt-2 text-sm text-[var(--anzhiyu-secondtext)]">
          加载中...
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.loading-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 18px 50px rgba(66, 90, 239, 0.22);
}

.loading-pace {
  width: min(18rem, 72vw);
  height: 0.38rem;
  border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--anzhiyu-main) 8%, transparent), var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 8%, transparent));
  background-size: 200% 100%;
  animation: loading-pace 1.2s linear infinite;
}

@keyframes loading-pace {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
