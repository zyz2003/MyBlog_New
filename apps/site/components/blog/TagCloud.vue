<script setup lang="ts">
const { data } = await useFetch<{ code: number; data: Array<{ id: number; name: string; slug: string; count: number }> }>('/api/tags')
const tags = computed(() => (data.value as any)?.data ?? [])
</script>

<template>
  <div class="card-widget">
    <div class="card-title">标签</div>
    <div v-if="!tags.length" class="empty-state">暂无标签</div>
    <div v-else class="tag-cloud">
      <NuxtLink
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="tag-item"
      >
        {{ tag.name }}
        <sup>{{ tag.count || 0 }}</sup>
      </NuxtLink>
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

.card-title {
  margin-bottom: 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 0.75rem 0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.38rem 0.75rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  transition: 0.3s;
}

.tag-item:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  box-shadow: var(--anzhiyu-shadow-main);
}

sup {
  opacity: 0.5;
}
</style>
