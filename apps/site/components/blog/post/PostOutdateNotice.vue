<script setup lang="ts">
const props = withDefaults(defineProps<{
  days: number
  messagePrev?: string
  messageNext?: string
  styleType?: 'simple' | 'flat'
}>(), {
  messagePrev: '距离上次更新已经过去',
  messageNext: '天，文章内容可能已经过时，请注意甄别。',
  styleType: 'flat',
})
</script>

<template>
  <div
    class="rounded-[24px] border px-5 py-4"
    :class="styleType === 'simple'
      ? 'border-amber-200 bg-amber-50/90 text-amber-900'
      : 'border-[color-mix(in_srgb,#f59e0b_30%,white)] bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(251,191,36,0.04))] text-[var(--anzhiyu-fontcolor)]'"
  >
    <div class="flex items-start gap-3">
      <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
        <i class="anzhiyufont anzhiyu-icon-triangle-exclamation text-lg" />
      </span>
      <div class="space-y-1">
        <p class="text-sm font-semibold">文章时效提醒</p>
        <p class="text-sm leading-7">
          {{ messagePrev }}
          <span class="mx-1 font-bold text-amber-600">{{ days }}</span>
          {{ messageNext }}
        </p>
      </div>
    </div>
  </div>
</template>
