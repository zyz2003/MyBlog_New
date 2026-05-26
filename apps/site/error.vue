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
          <h1 class="error-title mt-4 text-4xl font-black tracking-tight md:text-5xl">{{ title }}</h1>
          <p class="mt-4 max-w-[34rem] text-base leading-8 text-muted">{{ subtitle }}</p>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              class="error-btn-primary rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition"
              @click="backHome"
            >
              返回首页
            </button>
            <button
              type="button"
              class="error-btn-secondary rounded-2xl border border-border bg-background/70 px-6 py-3 text-sm font-semibold text-text transition"
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
          <div v-else class="error-illustration">
            <div class="space-scene">
              <div class="planet" />
              <div class="astronaut" />
              <div class="star star-1" />
              <div class="star star-2" />
              <div class="star star-3" />
              <div class="star star-4" />
              <div class="star star-5" />
              <div class="star star-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.error-title {
  background: linear-gradient(45deg, var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 70%, #FF6B6B));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--anzhiyu-main) 35%, transparent);
}

.error-btn-secondary:hover {
  transform: translateY(-2px);
  color: var(--anzhiyu-main);
}

.error-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 260px;
  background:
    radial-gradient(circle at top left, rgba(66, 90, 239, 0.18), transparent 38%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(245, 247, 250, 0.86));
  overflow: hidden;
}

.space-scene {
  position: relative;
  width: 200px;
  height: 200px;
}

.planet {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 60%, #4ECDC4), color-mix(in srgb, var(--anzhiyu-main) 30%, #45B7D1));
  animation: rotate-slow 20s linear infinite;
  box-shadow: inset -8px -4px 12px rgba(0, 0, 0, 0.15);
}

.astronaut {
  position: absolute;
  top: 30px;
  left: 30px;
  width: 40px;
  height: 50px;
  border-radius: 50% 50% 40% 40%;
  background: linear-gradient(180deg, #E8EAF0, #C5CAE9);
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.astronaut::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(180deg, #90CAF9, #42A5F5);
}

.star {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--anzhiyu-main) 50%, white);
  animation: twinkle 3s ease-in-out infinite;
}

.star-1 { top: 10%; left: 15%; animation-delay: 0s; }
.star-2 { top: 25%; left: 75%; animation-delay: 0.5s; width: 3px; height: 3px; }
.star-3 { top: 60%; left: 10%; animation-delay: 1s; width: 5px; height: 5px; }
.star-4 { top: 80%; left: 60%; animation-delay: 1.5s; }
.star-5 { top: 45%; left: 90%; animation-delay: 2s; width: 3px; height: 3px; }
.star-6 { top: 70%; left: 40%; animation-delay: 2.5s; width: 5px; height: 5px; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(5deg); }
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}
</style>