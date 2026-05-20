<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { wechat } = useSiteSettings()
</script>

<template>
  <div class="card-widget wechat-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] mb-3 uppercase tracking-wide text-center">微信</div>

    <div class="flex flex-col items-center gap-3">
      <div v-if="wechat.qrcode" class="w-36 h-36 rounded-xl overflow-hidden border border-[var(--style-border-always)]">
        <img :src="wechat.qrcode" alt="微信赞赏码" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-36 h-36 rounded-xl bg-[var(--anzhiyu-main)]/5 flex items-center justify-center text-4xl text-[var(--anzhiyu-secondtext)] select-none">
        <i class="anzhiyufont anzhiyu-icon-weixin" />
      </div>
      <span class="text-xs text-[var(--anzhiyu-secondtext)]">{{ wechat.description }}</span>
    </div>
  </div>
</template>
