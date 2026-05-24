<script setup lang="ts">
interface CategoryNode {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  sortOrder: number
  count: number
  children: CategoryNode[]
}

const { data } = await useFetch<{ code: number; data: CategoryNode[] }>('/api/categories/tree')
const categories = computed(() => data.value?.data ?? [])

// Compute total including child counts
const totalCount = computed(() => {
  function sum(node: CategoryNode): number {
    return node.count + (node.children?.reduce((s, c) => s + sum(c), 0) || 0)
  }
  return categories.value.reduce((s, c) => s + sum(c), 0)
})

const expanded = ref<Set<number>>(new Set())

function toggle(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

function hasChildren(cat: CategoryNode): boolean {
  return cat.children?.length > 0
}

function isExpanded(cat: CategoryNode): boolean {
  return expanded.value.has(cat.id) || !hasChildren(cat)
}
</script>

<template>
  <div class="card-widget card-categories">
    <div class="item-headline">
      <i class="anzhiyufont anzhiyu-icon-folder-open" />
      <span>分类</span>
      <span class="card-category-count">{{ totalCount }}</span>
    </div>

    <div v-if="categories.length === 0" class="empty-state">暂无分类</div>

    <ul v-else class="card-category-list">
      <li v-for="cat in categories" :key="cat.id" class="card-category-list-item parent">
        <div class="card-category-list-link" :class="{ expand: isExpanded(cat) }">
          <NuxtLink :to="`/categories/${cat.slug}`" class="card-category-list-name">
            {{ cat.name }}
          </NuxtLink>
          <span class="card-category-list-count" @click="toggle(cat.id)">{{ cat.count }}</span>
          <i v-if="hasChildren(cat)" class="anzhiyufont anzhiyu-icon-chevron-right expand-icon" :class="{ rotated: isExpanded(cat) }" @click="toggle(cat.id)" />
        </div>

        <ul v-if="hasChildren(cat) && isExpanded(cat)" class="card-category-list child">
          <li v-for="child in cat.children" :key="child.id" class="card-category-list-item">
            <div class="card-category-list-link child-link">
              <span class="child-dot" />
              <NuxtLink :to="`/categories/${child.slug}`" class="card-category-list-name">
                {{ child.name }}
              </NuxtLink>
              <span class="card-category-list-count">{{ child.count }}</span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.card-widget {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 12px;
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
}

.card-widget:hover {
  box-shadow: var(--anzhiyu-shadow-main);
  border: var(--style-border-hover);
}

.item-headline {
  padding-bottom: 0;
  margin-bottom: 0.6rem;
  margin-left: 8px;
  font-size: 1em;
  font-weight: bold;
  display: flex;
  align-items: center;

  i {
    margin-right: 6px;
  }

  span {
    margin-left: 6px;
  }
}

.card-category-count {
  font-size: 0.8em;
  color: var(--anzhiyu-secondtext);
  font-weight: normal;
  margin-left: auto;
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 0.75rem 0;
}

/* AnZhiYu card-category-list style */
.card-category-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-category-list.child {
  padding: 0 0 0 16px;
}

.card-category-list-item {
  margin: 0;
  padding: 0;

  &.parent > .card-category-list-link {
    font-weight: 600;
    font-size: 0.92rem;
  }
}

.card-category-list-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--anzhiyu-fontcolor);
  transition: all 0.2s;
  cursor: default;

  &:hover {
    background: color-mix(in srgb, var(--anzhiyu-main) 6%, transparent);
  }
}

.card-category-list-name {
  flex: 1;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--anzhiyu-main);
  }
}

.card-category-list-count {
  text-align: right;
  color: var(--anzhiyu-secondtext);
  font-size: 0.78rem;
  font-weight: normal;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;

  &:hover {
    color: var(--anzhiyu-main);
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
}

.expand-icon {
  float: right;
  margin-right: -0.5em;
  padding: 0.5em;
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  transition: transform 0.3s;
  transform: rotate(0);
  cursor: pointer;

  &.rotated {
    transform: rotate(-90deg);
  }

  &:hover {
    color: var(--anzhiyu-main);
  }
}

.child-link {
  font-weight: normal;
  font-size: 0.85rem;
  padding: 4px 10px;
}

.child-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--anzhiyu-main);
  flex-shrink: 0;
  margin-right: 8px;
  opacity: 0.6;
}
</style>