<script setup lang="ts">
const props = withDefaults(defineProps<{
  enabled?: boolean
  author?: string
  articleUrl?: string
  title?: string
  license?: string
  licenseUrl?: string
  location?: string
  authorLink?: string
  avatarSinks?: boolean
}>(), {
  enabled: true,
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  location: '',
  authorLink: '/',
  avatarSinks: false,
})

const config = useRuntimeConfig()

const author = computed(() => props.author || config.public.siteName || '本站作者')
const url = computed(() => {
  if (props.articleUrl?.startsWith('http')) {
    return props.articleUrl
  }

  if (import.meta.client && props.articleUrl) {
    return new URL(props.articleUrl, window.location.origin).toString()
  }

  return props.articleUrl || ''
})

const copied = ref(false)

async function copyPermalink() {
  if (!url.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(url.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // Fallback: do nothing, clipboard API may be blocked
  }
}
</script>

<template>
  <div v-if="enabled" class="post-copyright mx-auto my-8 max-w-[980px] px-4">
    <div
      class="relative overflow-hidden rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-6 py-6 shadow-[var(--anzhiyu-shadow-border)]"
      :class="{ 'copyright-avatar-sinks': avatarSinks }"
    >
      <div class="copyright-cc-box absolute -top-5 -right-3 select-none text-[7rem] text-[var(--anzhiyu-main)] opacity-6">
        <i class="anzhiyufont anzhiyu-icon-copyright" />
      </div>

      <div class="relative z-1">
        <div class="mb-4 flex items-center gap-2 text-[var(--anzhiyu-fontcolor)]">
          <i class="anzhiyufont anzhiyu-icon-copyright text-lg text-[var(--anzhiyu-main)]" />
          <span class="text-base font-semibold">版权声明</span>
        </div>

        <div class="grid gap-3 text-sm text-[var(--anzhiyu-fontcolor)] md:grid-cols-[110px_minmax(0,1fr)]">
          <div class="text-[var(--anzhiyu-secondtext)]">文章作者</div>
          <div class="font-medium">
            <a :href="authorLink" class="text-[var(--anzhiyu-fontcolor)] no-underline hover:text-[var(--anzhiyu-main)]">
              {{ author }}
            </a>
          </div>

          <div v-if="title" class="text-[var(--anzhiyu-secondtext)]">文章标题</div>
          <div v-if="title">{{ title }}</div>

          <div v-if="url" class="text-[var(--anzhiyu-secondtext)]">文章链接</div>
          <div v-if="url" class="flex items-center gap-2">
            <a :href="url" class="min-w-0 break-all text-[var(--anzhiyu-main)] no-underline hover:underline">{{ url }}</a>
            <button
              type="button"
              class="shrink-0 cursor-pointer rounded-full border-none bg-[var(--anzhiyu-main-op-deep)] px-3 py-1 text-xs text-[var(--anzhiyu-main)] transition-all hover:bg-[var(--anzhiyu-main-op)]"
              @click="copyPermalink"
            >
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>

          <div v-if="location" class="text-[var(--anzhiyu-secondtext)]">版权归属</div>
          <div v-if="location">{{ location }}</div>

          <div class="text-[var(--anzhiyu-secondtext)]">使用协议</div>
          <div class="leading-7">
            本站原创文章默认采用
            <a :href="licenseUrl" target="_blank" rel="noreferrer" class="text-[var(--anzhiyu-main)] no-underline hover:underline">{{ license }}</a>
            协议，转载请注明来源与本文链接。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copyright-avatar-sinks {
  transform: translateY(2px);
}
</style>