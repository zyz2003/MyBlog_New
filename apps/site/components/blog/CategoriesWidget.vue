<script setup lang="ts">
interface CategoryNode {
  id: number
  name: string
  slug: string
  count: number
  children?: CategoryNode[]
}

const { data } = await useFetch<{ code: number; data: CategoryNode[] }>('/api/categories/tree')
const categories = computed(() => data.value?.data ?? [])

const expanded = ref<Set<string>>(new Set())

function toggle(name: string) {
  if (expanded.value.has(name)) {
    expanded.value.delete(name)
  } else {
    expanded.value.add(name)
  }
}
</script>

<template>
  <div class="card-title">分类</div>

  <div v-if="categories.length === 0" class="empty-state">
    暂无分类
  </div>

  <div v-else class="category-tree">
    <template v-for="cat in categories" :key="cat.id">
      <div class="category-node">
        <div class="category-label" @click="toggle(cat.name)">
          <span class="chevron" :class="{ expanded: expanded.has(cat.name) || !cat.children?.length }">
            <i class="anzhiyufont anzhiyu-icon-chevron-right" />
          </span>
          <NuxtLink :to="`/categories/${cat.slug}`" class="category-name">
            {{ cat.name }}
          </NuxtLink>
          <span class="category-count">{{ cat.count || 0 }}</span>
        </div>
        <div v-if="cat.children?.length && expanded.has(cat.name)" class="category-children">
          <template v-for="child in cat.children" :key="child.id">
            <div class="category-child">
              <span class="child-dot" />
              <NuxtLink :to="`/categories/${child.slug}`" class="child-name">
                {{ child.name }}
              </NuxtLink>
              <span class="child-count">{{ child.count || 0 }}</span>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
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

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-node {
  display: flex;
  flex-direction: column;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.category-label:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
}

.chevron {
  display: inline-flex;
  align-items: center;
  color: var(--anzhiyu-secondtext);
  font-size: 12px;
  transition: transform 0.3s ease;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
  color: var(--anzhiyu-fontcolor);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.category-name:hover {
  color: var(--anzhiyu-main);
}

.category-count {
  min-width: 2rem;
  color: var(--anzhiyu-secondtext);
  font-size: 12px;
  text-align: right;
}

.category-children {
  margin-left: 1.5rem;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.category-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem 0.35rem 0.75rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.category-child:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 4%, white);
}

.child-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--anzhiyu-main);
  flex-shrink: 0;
}

.child-name {
  flex: 1;
  color: var(--anzhiyu-fontcolor);
  font-size: 13px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.child-name:hover {
  color: var(--anzhiyu-main);
}

.child-count {
  min-width: 1.5rem;
  color: var(--anzhiyu-secondtext);
  font-size: 11px;
  text-align: right;
}
</style>
