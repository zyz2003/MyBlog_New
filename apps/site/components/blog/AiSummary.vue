<script setup lang="ts">
defineProps<{
  summary?: string
  gptName?: string
}>()

const collapsed = ref(false)
</script>

<template>
  <div v-if="summary" class="post-ai-description max-w-[800px] mx-auto px-4 mb-8">
    <div class="rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-5">
      <!-- Header -->
      <div class="ai-title flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="anzhiyufont anzhiyu-icon-bilibili text-[var(--anzhiyu-main)] text-lg" />
          <span class="text-sm font-semibold text-[var(--anzhiyu-fontcolor)]">AI 摘要</span>
          <span class="text-xs px-2 py-0.5 rounded bg-[var(--anzhiyu-main)]/10 text-[var(--anzhiyu-main)]">
            {{ gptName || 'GPT' }}
          </span>
        </div>
        <button
          class="text-xs text-[var(--anzhiyu-secondtext)] hover:text-[var(--anzhiyu-main)] cursor-pointer border-none bg-transparent transition-colors"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '展开' : '收起' }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="!collapsed" class="ai-explanation text-sm text-[var(--anzhiyu-fontcolor)] leading-relaxed">
        {{ summary }}
      </div>
    </div>
  </div>
</template>
