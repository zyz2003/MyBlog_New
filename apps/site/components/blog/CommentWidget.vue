<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { settings } = useSiteSettings()
const route = useRoute()

const twikooConfig = computed(() => settings.value?.comments?.twikoo ?? {})
const envId = computed(() => twikooConfig.value.envId || '')
const region = computed(() => twikooConfig.value.region || '')

const loaded = ref(false)
const error = ref('')

onMounted(() => {
  if (!envId.value) {
    error.value = 'Twikoo 评论未配置'
    return
  }
  loadTwikoo()
})

function loadTwikoo() {
  if (typeof window === 'undefined') return
  // Load twikoo from CDN
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.41/dist/twikoo.all.min.js'
  script.onload = () => {
    try {
      const twikoo = (window as any).twikoo
      if (!twikoo) { error.value = 'Twikoo 加载失败'; return }
      twikoo.init({
        envId: envId.value,
        region: region.value,
        el: '#twikoo-comment',
        path: route.path,
      })
      loaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Twikoo 初始化失败'
    }
  }
  script.onerror = () => { error.value = 'Twikoo CDN 加载失败' }
  document.head.appendChild(script)
}
</script>

<template>
  <div class="comment-widget max-w-[800px] mx-auto px-4 py-8">
    <div class="flex items-center gap-2 mb-6">
      <i class="anzhiyufont anzhiyu-icon-comments text-lg text-[var(--anzhiyu-main)]" />
      <h3 class="text-base font-semibold text-[var(--anzhiyu-fontcolor)] m-0">评论</h3>
    </div>

    <!-- Error/placeholder -->
    <div v-if="error" class="text-center py-8 rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)]">
      <i class="anzhiyufont anzhiyu-icon-comments text-3xl text-[var(--anzhiyu-secondtext)] opacity-30 block mb-2" />
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="!loaded" class="text-center py-8 rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)]">
      <i class="anzhiyufont anzhiyu-icon-spinner animate-spin text-2xl text-[var(--anzhiyu-secondtext)] block mb-2" />
      <p class="text-sm text-[var(--anzhiyu-secondtext)]">加载评论中...</p>
    </div>

    <!-- Twikoo mount point -->
    <div id="twikoo-comment" class="rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-6" />
  </div>
</template>
