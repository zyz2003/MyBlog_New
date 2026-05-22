<script setup lang="ts">
const isDoubleColumn = ref(false)

const layoutIconClass = computed(() => isDoubleColumn.value ? 'i-heroicons-squares-2x2-solid' : 'i-heroicons-bars-3-bottom-left-solid')
const layoutLabel = computed(() => isDoubleColumn.value ? '双列布局' : '单列布局')

onMounted(() => {
  const savedLayout = localStorage.getItem('homepage_layout')
  isDoubleColumn.value = savedLayout === 'double'
})

function toggleLayout() {
  isDoubleColumn.value = !isDoubleColumn.value
  localStorage.setItem('homepage_layout', isDoubleColumn.value ? 'double' : 'single')
}
</script>

<template>
  <div class="layout-toggle">
    <button
      class="layout-toggle-btn"
      type="button"
      :aria-label="layoutLabel"
      :title="layoutLabel"
      @click="isDoubleColumn = !isDoubleColumn"
    >
      <span :class="layoutIconClass" class="layout-icon" />
    </button>
  </div>
</template>

<style scoped>
.layout-toggle {
  position: fixed;
  right: 2rem;
  bottom: 6rem;
  z-index: 100;
}

.layout-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  box-shadow: var(--anzhiyu-shadow-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.layout-toggle-btn:hover {
  background: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
  transform: scale(1.1);
}

.layout-toggle-btn:hover .layout-icon {
  color: var(--anzhiyu-white);
}

.layout-icon {
  font-size: 20px;
  color: var(--anzhiyu-fontcolor);
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .layout-toggle {
    right: 1rem;
    bottom: 5rem;
  }

  .layout-toggle-btn {
    width: 42px;
    height: 42px;
  }
}
</style>
