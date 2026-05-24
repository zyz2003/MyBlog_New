<script setup lang="ts">
defineProps<{
  name: string
  path: string
  icon?: string
  shadow?: string
  bgColor?: string
  cls?: string
}>()

function resolveIcon(icon: string | undefined) {
  if (!icon) return { type: 'anzhiyu', value: 'anzhiyu-icon-star' }

  if (icon.startsWith('fa')) return { type: 'fa', value: icon }
  if (icon.startsWith('anzhiyu')) return { type: 'anzhiyu', value: icon }
  if (icon.startsWith('icon')) return { type: 'svg', value: icon }
  // i-heroicons-* or other UnoCSS icon classes
  return { type: 'unocss', value: icon }
}
</script>

<template>
  <NuxtLink
    :to="path"
    class="categoryItem"
    :class="cls"
    :style="{ boxShadow: shadow || 'var(--anzhiyu-shadow-blue)' }"
  >
    <span
      class="categoryButton"
      :style="bgColor && !cls ? { '--category-bg': bgColor } : {}"
    >
      <span class="categoryButtonText">{{ name }}</span>

      <!-- Font Awesome icon -->
      <i v-if="resolveIcon(icon).type === 'fa'" :class="resolveIcon(icon).value" class="category-icon" />

      <!-- AnZhiYu font icon -->
      <i v-else-if="resolveIcon(icon).type === 'anzhiyu'" class="anzhiyufont category-icon" :class="resolveIcon(icon).value" />

      <!-- SVG symbol icon (iconfont) -->
      <svg v-else-if="resolveIcon(icon).type === 'svg'" class="icon category-icon" aria-hidden="true">
        <use :xlink:href="`#${resolveIcon(icon).value}`" />
      </svg>

      <!-- UnoCSS icon (i-heroicons-* etc.) -->
      <span v-else-if="resolveIcon(icon).type === 'unocss'" :class="resolveIcon(icon).value" class="category-icon" />
    </span>
  </NuxtLink>
</template>

<style scoped>
/* --- Layout --- */
.categoryItem {
  width: calc(100% / 3 - 0.33rem);
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.8s cubic-bezier(0.65, 0.15, 0.37, 1.19);
  text-decoration: none;
  flex: 1 1 0;
  min-width: 0;
}

.categoryItem:hover {
  flex: 1.6 1 0;
}

/* --- Button --- */
.categoryButton {
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
  background: linear-gradient(to right, #358bff, #15c6ff);
  background-size: 200%;
}

.categoryButton::after {
  content: '';
  position: absolute;
  top: 47px;
  left: 21px;
  width: 1rem;
  height: 2px;
  background: var(--anzhiyu-white);
  border-radius: 1px;
}

.categoryButtonText {
  padding-left: 21px;
}

/* --- Icon (all types share this positioning) --- */
.category-icon {
  font-size: 5rem;
  opacity: 0.2;
  position: absolute;
  right: 0;
  top: 20%;
  width: 100px;
  text-align: center;
  filter: blur(2px);
  transform: scale(1) rotate(15deg);
  transition: 0.3s;
}

.categoryItem:hover .category-icon {
  opacity: 0.8;
  filter: blur(0);
  transform: scale(1.03) rotate(0deg);
  font-size: 2.5rem;
  top: 15%;
}

/* --- AnZhiYu color classes (blue / red / green) --- */
.categoryItem.blue .categoryButton {
  background: linear-gradient(to right, #358bff, #15c6ff);
  background-size: 200%;
}

.categoryItem.red .categoryButton {
  background: linear-gradient(to right, #f65, #ffbf37);
  background-size: 200%;
}

.categoryItem.green .categoryButton {
  background: linear-gradient(to right, #18e7ae, #1eebeb);
  background-size: 200%;
}

/* Custom bgColor via CSS variable (when no cls is set) */
.categoryButton[style*="--category-bg"] {
  background: var(--category-bg);
}

/* --- Dark mode overrides --- */
[data-theme="dark"] .categoryItem.blue .categoryButton {
  background: linear-gradient(to right, #0653b8, #2fcbff);
  background-size: 200%;
}

[data-theme="dark"] .categoryItem.red .categoryButton {
  background: linear-gradient(to right, #e22a16, #da980c);
  background-size: 200%;
}

[data-theme="dark"] .categoryItem.green .categoryButton {
  background: linear-gradient(to right, #099e74, #0ea4a4);
  background-size: 200%;
}

@media (max-width: 768px) {
  .categoryItem {
    display: none;
  }
}
</style>