<script setup lang="ts">
defineProps<{
  summary?: string
  gptName?: string
  btnLink?: string
}>()

const collapsed = ref(false)
const needsCollapse = ref(false)
const summaryRef = ref<HTMLElement | null>(null)

function checkCollapseNeeded() {
  if (!summaryRef.value) {
    return
  }

  // If the content height exceeds 160px, enable collapse by default
  needsCollapse.value = summaryRef.value.scrollHeight > 160
  if (needsCollapse.value) {
    collapsed.value = true
  }
}

onMounted(() => {
  checkCollapseNeeded()
})
</script>

<template>
  <div v-if="summary" class="post-ai-description mx-auto mb-8 max-w-[980px] px-4">
    <div class="ai-summary-card relative overflow-hidden rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] shadow-[var(--anzhiyu-shadow-border)]">
      <div class="ai-gradient-bar" aria-hidden="true" />

      <div class="p-5 md:p-6">
        <div class="ai-title mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="anzhiyufont anzhiyu-icon-lightbulb text-lg text-[var(--anzhiyu-main)]" />
            <span class="text-sm font-semibold text-[var(--anzhiyu-fontcolor)]">AI 摘要</span>
            <span class="rounded-full bg-[var(--anzhiyu-main-op-deep)] px-2.5 py-0.5 text-xs text-[var(--anzhiyu-main)]">
              {{ gptName || 'GPT' }}
            </span>
          </div>
          <button
            v-if="needsCollapse"
            class="cursor-pointer border-none bg-transparent text-xs text-[var(--anzhiyu-secondtext)] transition-colors hover:text-[var(--anzhiyu-main)]"
            @click="collapsed = !collapsed"
          >
            {{ collapsed ? '展开' : '收起' }}
          </button>
        </div>

        <div
          ref="summaryRef"
          class="ai-explanation rounded-2xl bg-[var(--anzhiyu-secondbg)]/70 px-4 py-4 text-sm leading-8 text-[var(--anzhiyu-fontcolor)]"
          :class="{ 'ai-collapsed': collapsed && needsCollapse }"
        >
          {{ summary }}
        </div>
        <div v-if="btnLink" class="mt-4 flex justify-end">
          <a :href="btnLink" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full bg-[var(--anzhiyu-main-op-deep)] px-4 py-2 text-xs font-semibold text-[var(--anzhiyu-main)] no-underline transition-all hover:-translate-y-0.5 hover:bg-[var(--anzhiyu-main-op)]">
            <i class="anzhiyufont anzhiyu-icon-sparkles" />
            <span>查看 AI 能力说明</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-gradient-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 40%, var(--anzhiyu-card-bg)));
  border-radius: 28px 0 0 28px;
}

.ai-collapsed {
  max-height: 160px;
  overflow: hidden;
  position: relative;
}

.ai-collapsed::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 40px;
  background: linear-gradient(180deg, transparent, var(--anzhiyu-secondbg));
  pointer-events: none;
}
</style>