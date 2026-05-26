<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

definePageMeta({ layout: 'frontend-default' })

interface TagItem {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: Date
  count: number
}

const { data: tagsData } = await useAsyncData(
  'tags-index',
  () => $fetch<{ code: number; data: TagItem[] }>('/api/tags'),
)

const tags = computed(() => tagsData.value?.data ?? [])

useSeoMeta({
  title: '标签',
  ogTitle: '标签',
  description: '所有文章标签',
  ogDescription: '所有文章标签',
})

const tagColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF8A5C', '#EA8685', '#778BEB', '#CF6A87',
]

function getTagColor(index: number) {
  return tagColors[index % tagColors.length]
}

function getTagFontSize(count: number) {
  const min = 14
  const max = 32
  const maxCount = Math.max(...tags.value.map(t => t.count), 1)
  const ratio = count / maxCount
  return `${min + ratio * (max - min)}px`
}

const { y: scrollY } = useWindowScroll()

const parallaxOffset = computed(() => {
  return scrollY.value * 0.05
})
</script>

<template>
  <div class="tags-page">
    <section class="page-hero">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--color-text, #0F172A)', fontFamily: 'var(--font-heading, system-ui)' }">
        标签
      </h1>
      <p class="mt-2" :style="{ color: 'var(--color-text-muted, #64748B)' }">
        全部 {{ tags.length }} 个标签
      </p>
    </section>

    <div
      v-if="tags.length"
      class="tag-cloud"
      :style="{ transform: `translateY(${parallaxOffset}px)` }"
    >
      <NuxtLink
        v-for="(tag, index) in tags"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="tag-item"
        :style="{
          '--tag-color': getTagColor(index),
          fontSize: getTagFontSize(tag.count),
          animationDelay: `${index * 0.15}s`,
        }"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </NuxtLink>
    </div>

    <div v-else class="empty-state" :style="{ color: 'var(--color-text-muted, #94A3B8)' }">
      暂无标签
    </div>
  </div>
</template>

<style scoped>
.tags-page {
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.5rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
  transition: transform 0.1s ease-out;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--tag-color);
  color: var(--tag-color);
  text-decoration: none;
  font-weight: 500;
  animation: float 6s ease-in-out infinite;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--tag-color) 30%, transparent);
  color: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, transparent);
}

.tag-count {
  font-size: 0.7em;
  opacity: 0.7;
  font-weight: 400;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

@media (max-width: 768px) {
  .tag-cloud {
    padding: 1rem;
    gap: 0.5rem;
  }

  .tag-item {
    font-size: 13px !important;
    padding: 0.25rem 0.65rem;
  }
}
</style>