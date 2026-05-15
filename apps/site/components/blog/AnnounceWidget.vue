<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
const { settings } = useSiteSettings()
const announce = computed(() => settings.value?.announcement ?? { text: '欢迎来到我的博客', icon: 'anzhiyu-icon-bullhorn' })
</script>

<template>
  <div class="card-widget announcement-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="flex items-start gap-3">
      <i class="anzhiyufont text-xl text-[var(--anzhiyu-main)] mt-0.5" :class="announce.icon || 'anzhiyu-icon-bullhorn'" />
      <div class="flex-1">
        <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] mb-1 uppercase tracking-wide">公告</div>
        <div class="text-sm text-[var(--anzhiyu-fontcolor)] leading-relaxed">{{ announce.text }}</div>
      </div>
    </div>
  </div>
</template>
