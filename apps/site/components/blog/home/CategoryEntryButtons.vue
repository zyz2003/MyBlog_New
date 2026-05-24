<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { homepage } = useSiteSettings()

const categoryList = computed(() => {
  const list = homepage.value?.categories || []
  // Skip the first 3 (already shown as CategoryItem big buttons)
  return list.slice(3, 9)
})
</script>

<template>
  <div v-if="categoryList.length > 0" class="category-entry-bar">
    <NuxtLink
      v-for="cat in categoryList"
      :key="cat.name"
      :to="cat.path"
      class="category-entry-btn"
    >
      <i v-if="cat.icon" :class="cat.icon" class="category-icon" />
      <span class="category-name">{{ cat.name }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.category-entry-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.5rem 0;
}

.category-entry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 14%, transparent);
  color: var(--anzhiyu-fontcolor);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.category-entry-btn:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .category-entry-bar {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .category-entry-bar::-webkit-scrollbar {
    display: none;
  }
}
</style>
