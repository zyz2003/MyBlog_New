<script setup lang="ts">
const { data } = await useFetch<{ code: number; data: Array<{ id: number; name: string; slug: string; count: number }> }>('/api/categories')
const categories = computed(() => data.value?.data ?? [])
</script>

<template>
  <div class="card-widget">
    <div class="card-title">分类</div>

    <div v-if="categories.length === 0" class="empty-state">
      暂无分类
    </div>

    <div v-else class="category-list">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.slug}`"
        class="category-item"
      >
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count || 0 }}</span>
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

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.category-item {
  display: flex;
  width: calc(50% - 0.25rem);
  flex-direction: column;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  border: var(--style-border-always);
  background: color-mix(in srgb, var(--anzhiyu-main) 4%, white);
  text-decoration: none;
  transition: 0.3s;
}

.category-item:hover {
  background: var(--anzhiyu-main);
  border: 1px solid transparent;
  box-shadow: var(--anzhiyu-shadow-main);
}

.category-name {
  font-size: 0.82rem;
  color: var(--anzhiyu-secondtext);
  transition: 0.3s;
}

.category-count {
  margin-top: 0.15rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  transition: 0.3s;
}

.category-item:hover .category-name,
.category-item:hover .category-count {
  color: var(--anzhiyu-white);
}
</style>
