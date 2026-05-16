<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { settings } = useSiteSettings()
const config = useRuntimeConfig()
const profile = computed(() => settings.value?.profile ?? {})
const authorName = computed(() => profile.value.authorName || config.public.siteName)
const avatar = computed(() => profile.value.avatar || '/avatar.png')
const description = computed(() => profile.value.description || '生活明朗，万物可爱')
const socialLinks = computed(() => settings.value?.social ?? [])
</script>

<template>
  <div class="card-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-5 mb-4 text-center">
    <div class="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[var(--anzhiyu-main)]">
      <img :src="avatar" :alt="authorName" class="w-full h-full object-cover" />
    </div>
    <div class="text-base font-bold text-[var(--anzhiyu-fontcolor)] mb-1">{{ authorName }}</div>
    <div class="text-xs text-[var(--anzhiyu-secondtext)] mb-3">{{ description }}</div>
    <div v-if="socialLinks.length > 0" class="flex justify-center gap-3">
      <a
        v-for="(link, i) in socialLinks" :key="i"
        :href="typeof link === 'string' ? link : (link as any).url || '#'"
        class="w-7 h-7 rounded-full flex items-center justify-center text-[var(--anzhiyu-secondtext)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] no-underline transition-colors text-sm"
        target="_blank" rel="noopener"
      >
        <i v-if="typeof link === 'object' && (link as any).icon" class="anzhiyufont" :class="(link as any).icon" />
        <i v-else class="anzhiyufont anzhiyu-icon-link" />
      </a>
    </div>
  </div>
</template>
