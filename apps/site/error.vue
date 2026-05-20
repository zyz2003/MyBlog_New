<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { errorPage } = useSiteSettings()

const statusCode = computed(() => props.error?.statusCode || 500)
const title = computed(() => statusCode.value === 404 ? '页面走丢了' : '页面暂时不可用')
const subtitle = computed(() =>
  statusCode.value === 404
    ? errorPage.value.subtitle
    : (props.error?.statusMessage || '请稍后重试或返回首页继续浏览。'),
)

async function backHome() {
  await clearError({ redirect: '/' })
}

function backPrevious() {
  if (import.meta.client) {
    window.history.back()
  }
}
</script>

<template>
  <div class="min-h-screen bg-background px-4 py-10 text-text">
    <div class="mx-auto flex min-h-[80vh] max-w-[1100px] items-center justify-center">
      <div class="grid w-full overflow-hidden rounded-[32px] border border-border/70 bg-surface/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-center px-8 py-10 md:px-12">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">Error {{ statusCode }}</p>
          <h1 class="mt-4 text-4xl font-black tracking-tight md:text-5xl">{{ title }}</h1>
          <p class="mt-4 max-w-[34rem] text-base leading-8 text-muted">{{ subtitle }}</p>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              @click="backHome"
            >
              返回首页
            </button>
            <button
              type="button"
              class="rounded-2xl border border-border bg-background/70 px-6 py-3 text-sm font-semibold text-text transition hover:text-primary"
              @click="backPrevious"
            >
              返回上一页
            </button>
          </div>
        </div>

        <div class="relative min-h-[260px] bg-surface-2">
          <img
            v-if="errorPage.background"
            :src="errorPage.background"
            :alt="title"
            class="h-full w-full object-cover"
          >
          <div
            v-else
            class="flex h-full min-h-[260px] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(66,90,239,0.18),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(245,247,250,0.86))] dark:bg-[radial-gradient(circle_at_top_left,rgba(66,90,239,0.18),transparent_38%),linear-gradient(135deg,rgba(16,20,29,0.96),rgba(20,24,33,0.9))]"
          >
            <div class="text-center">
              <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary/12 text-primary">
                <span class="i-heroicons-face-frown h-12 w-12" />
              </div>
              <p class="mt-5 text-sm font-medium text-muted">配置化 404 背景未设置，已使用默认视觉兜底。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
