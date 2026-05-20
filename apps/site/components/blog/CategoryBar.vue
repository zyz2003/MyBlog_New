<script setup lang="ts">
defineProps<{
  categories?: Array<{ id: number; name: string; slug: string }>
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function checkScroll() {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

function scroll(direction: 'left' | 'right') {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -200 : 200,
    behavior: 'smooth',
  })
}

onMounted(checkScroll)
</script>

<template>
  <nav id="categoryBar" class="category-bar">
    <div class="category-bar-inner">
      <button
        v-if="canScrollLeft"
        class="scroll-btn scroll-btn-left"
        @click="scroll('left')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div ref="scrollContainer" class="category-list" @scroll="checkScroll">
        <NuxtLink to="/" class="category-item active">
          首页
        </NuxtLink>
        <NuxtLink
          v-for="cat in (categories || [])"
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          class="category-item"
        >
          {{ cat.name }}
        </NuxtLink>
        <NuxtLink to="/categories/" class="category-item more">
          更多
        </NuxtLink>
      </div>

      <button
        v-if="canScrollRight"
        class="scroll-btn scroll-btn-right"
        @click="scroll('right')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.category-bar {
  margin-top: 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.category-bar:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
}

.category-bar-inner {
  position: relative;
  display: flex;
  align-items: center;
}

.category-list {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.5rem 0.6rem;
  flex: 1;
}

.category-list::-webkit-scrollbar {
  display: none;
}

.category-item {
  flex-shrink: 0;
  padding: 0.55rem 0.95rem;
  font-size: 0.875rem;
  color: var(--anzhiyu-fontcolor);
  background: transparent;
  transition: all 0.2s;
  text-decoration: none;
  border-radius: 8px;
  white-space: nowrap;
  font-weight: 700;
}

.category-item:hover,
.category-item.active {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.category-item.more {
  color: var(--anzhiyu-main);
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 50%;
  color: var(--anzhiyu-secondtext);
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s;
}

.scroll-btn:hover {
  color: var(--anzhiyu-main);
  border-color: color-mix(in srgb, var(--anzhiyu-main) 36%, transparent);
}

.scroll-btn-left {
  left: -0.5rem;
}

.scroll-btn-right {
  right: -0.5rem;
}
</style>
