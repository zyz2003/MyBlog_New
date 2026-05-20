<script setup lang="ts">
const props = defineProps<{ articles?: number; categories?: number; tags?: number }>()
const { sidebarCards, busuanzi } = useSiteSettings()

function parseRuntimeDate(raw: string) {
  const value = raw.trim()
  if (!value) {
    return null
  }
  const date = new Date(value.replace(/\//g, '-'))
  return Number.isNaN(date.getTime()) ? null : date
}

const runtimeText = computed(() => {
  if (!sidebarCards.value.runtimeShow.enable) {
    return ''
  }
  const start = parseRuntimeDate(sidebarCards.value.runtimeShow.publishDate || '')
  if (!start) {
    return ''
  }
  const diff = Date.now() - start.getTime()
  if (diff < 0) {
    return ''
  }
  const days = Math.floor(diff / 86400000)
  const years = Math.floor(days / 365)
  return `${years} 年 ${days % 365} 天`
})
</script>

<template>
  <div class="card-widget stats-widget">
    <div class="stats-grid">
      <div v-if="sidebarCards.webinfo.postCount" class="stats-item">
        <div class="stats-value">{{ props.articles ?? 0 }}</div>
        <div class="stats-label">文章</div>
      </div>
      <div class="stats-item">
        <div class="stats-value">{{ props.categories ?? 0 }}</div>
        <div class="stats-label">分类</div>
      </div>
      <div class="stats-item">
        <div class="stats-value">{{ props.tags ?? 0 }}</div>
        <div class="stats-label">标签</div>
      </div>
    </div>

    <div v-if="runtimeText || busuanzi.siteUv || busuanzi.sitePv" class="stats-extra">
      <div v-if="runtimeText" class="stats-extra-item">
        <span>运行时间</span>
        <strong>{{ runtimeText }}</strong>
      </div>
      <div v-if="busuanzi.siteUv" class="stats-extra-item">
        <span>访客</span>
        <strong id="busuanzi_value_site_uv">0</strong>
      </div>
      <div v-if="busuanzi.sitePv" class="stats-extra-item">
        <span>访问</span>
        <strong id="busuanzi_value_site_pv">0</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stats-item {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-radius: 14px;
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
}

.stats-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--anzhiyu-main);
}

.stats-label {
  margin-top: 0.25rem;
  font-size: 0.74rem;
  color: var(--anzhiyu-secondtext);
}

.stats-extra {
  margin-top: 0.9rem;
  display: grid;
  gap: 0.5rem;
}

.stats-extra-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.85rem;
  border-radius: 14px;
  background: color-mix(in srgb, var(--anzhiyu-main) 4%, white);
  color: var(--anzhiyu-secondtext);
  font-size: 0.8rem;
}

.stats-extra-item strong {
  color: var(--anzhiyu-fontcolor);
  font-size: 0.88rem;
}
</style>
