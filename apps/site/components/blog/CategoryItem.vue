<script setup lang="ts">
defineProps<{
  name: string
  path: string
  icon?: string
  shadow?: string
  bgColor?: string
}>()
</script>

<template>
  <NuxtLink
    :to="path"
    class="category-item"
    :style="{ boxShadow: shadow || '0 12px 24px rgba(15, 23, 42, 0.12)' }"
  >
    <span
      class="category-button"
      :style="{ '--category-bg': bgColor || 'linear-gradient(to right, #358bff, #15c6ff)' }"
    >
      <span class="category-button-text">{{ name }}</span>
      <span class="category-icon">
        <span v-if="icon" :class="icon" class="category-icon-inner" />
        <span v-else class="i-heroicons-folder category-icon-inner" />
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.category-item {
  width: calc(100% / 3 - 0.34rem);
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.8s cubic-bezier(0.65, 0.15, 0.37, 1.19);
  text-decoration: none;
}

.category-button {
  position: relative;
  display: block;
  width: 100%;
  min-height: 76px;
  line-height: 76px;
  text-align: left;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--anzhiyu-white);
  border-radius: 12px;
  overflow: hidden;
  background: var(--category-bg);
  background-size: 200%;
}

.category-button::before {
  content: '';
  position: absolute;
  top: 47px;
  left: 21px;
  width: 1rem;
  height: 2px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1px;
}

.category-button-text {
  padding-left: 21px;
}

.category-icon {
  position: absolute;
  top: 14px;
  right: 0;
  width: 100px;
  text-align: center;
  opacity: 0.2;
  filter: blur(2px);
  transform: rotate(15deg) scale(1);
  transition: 0.3s;
}

.category-icon-inner {
  display: inline-block;
  width: 4.25rem;
  height: 4.25rem;
}

.category-item:hover {
  flex: 1.6 1 0;
}

.category-item:hover .category-icon {
  top: 10px;
  opacity: 0.82;
  filter: blur(0);
  transform: rotate(0deg) scale(0.9);
}
</style>
