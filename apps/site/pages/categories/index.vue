<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

interface CategoryItem {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  sortOrder: number
  createdAt: Date
  count: number
}

const { data: categoriesData } = await useAsyncData(
  'categories-index',
  () => $fetch<{ code: number; data: CategoryItem[] }>('/api/categories'),
)

const categories = computed(() => categoriesData.value?.data ?? [])

useSeoMeta({
  title: '分类',
  ogTitle: '分类',
  description: '所有文章分类',
  ogDescription: '所有文章分类',
})

const accentColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
]

function getCardColor(index: number) {
  return accentColors[index % accentColors.length]
}

function getCardBg(color: string) {
  return `color-mix(in srgb, ${color} 15%, var(--anzhiyu-card-bg))`
}

function getCardSize(count: number): 'large' | 'medium' | 'small' {
  if (count >= 10) return 'large'
  if (count >= 3) return 'medium'
  return 'small'
}

function getGridSpan(size: 'large' | 'medium' | 'small') {
  switch (size) {
    case 'large': return 'span 2 / span 2'
    case 'medium': return 'span 1 / span 1'
    case 'small': return 'span 1 / span 1'
  }
}
</script>

<template>
  <div class="categories-page">
    <section class="page-hero">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--color-text, #0F172A)', fontFamily: 'var(--font-heading, system-ui)' }">
        分类
      </h1>
      <p class="mt-2" :style="{ color: 'var(--color-text-muted, #64748B)' }">
        全部 {{ categories.length }} 个分类
      </p>
    </section>

    <!-- CategoryBall: deferred to Phase 6 -->

    <div v-if="categories.length" class="bento-grid">
      <NuxtLink
        v-for="(cat, index) in categories"
        :key="cat.id"
        :to="`/categories/${cat.slug}`"
        class="bento-card"
        :class="[`bento-card-${getCardSize(cat.count)}`]"
        :style="{
          '--accent': getCardColor(index),
          '--accent-bg': getCardBg(getCardColor(index)),
          gridRow: getGridSpan(getCardSize(cat.count)),
          gridColumn: getGridSpan(getCardSize(cat.count)),
        }"
      >
        <div class="card-inner">
          <h3 class="card-name">{{ cat.name }}</h3>
          <span class="card-count">{{ cat.count }}</span>
          <p v-if="cat.description" class="card-desc">{{ cat.description }}</p>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="empty-state" :style="{ color: 'var(--color-text-muted, #94A3B8)' }">
      暂无分类
    </div>
  </div>
</template>

<style scoped>
.categories-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-hero {
  padding: 1.25rem 1.35rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.bento-card {
  display: block;
  border: var(--style-border-always);
  border-radius: 16px;
  background: var(--accent-bg);
  padding: 1.25rem;
  text-decoration: none;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.bento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.bento-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 20%, transparent);
  border-color: var(--accent);
}

.bento-card:hover::before {
  opacity: 1;
}

.card-inner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.bento-card-large .card-inner {
  justify-content: space-between;
  min-height: 120px;
}

.bento-card-medium .card-inner {
  min-height: 80px;
}

.card-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  margin: 0;
  line-height: 1.4;
}

.bento-card-large .card-name {
  font-size: 1.3rem;
}

.card-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 2px 10px;
  min-width: 28px;
  line-height: 1;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--anzhiyu-secondtext);
  margin: 0;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

@media (max-width: 767px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-card,
  .bento-card-large,
  .bento-card-medium,
  .bento-card-small {
    grid-row: span 1 / span 1;
    grid-column: span 1 / span 1;
  }

  .bento-card-large .card-inner {
    min-height: unset;
  }
}

@media (min-width: 768px) and (max-width: 1179px) {
  .bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bento-card-large {
    grid-row: span 1 / span 1;
    grid-column: span 1 / span 1;
  }
}
</style>