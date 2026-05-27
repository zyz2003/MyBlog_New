<script setup lang="ts">
interface Props {
  mode?: 'card' | 'list' | 'text' | 'sidebar'
  lineCount?: number
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'card',
  lineCount: 3,
  count: 1,
})

const textWidths = ['100%', '85%', '70%', '90%', '75%']

function textLineWidth(index: number): string {
  return textWidths[index % textWidths.length]
}
</script>

<template>
  <div class="skeleton-wrapper">
    <template v-for="n in count" :key="n">
      <!-- Card mode: cover + title + text lines + meta -->
      <div v-if="mode === 'card'" class="skeleton-card">
        <div class="skeleton-block skeleton-cover" />
        <div class="skeleton-card-content">
          <div class="skeleton-block skeleton-title" />
          <div class="skeleton-block skeleton-text-line" />
          <div class="skeleton-block skeleton-text-line short" />
          <div class="skeleton-block skeleton-meta" />
        </div>
      </div>

      <!-- List mode: thumbnail + title + text -->
      <div v-else-if="mode === 'list'" class="skeleton-list">
        <div class="skeleton-block skeleton-thumbnail" />
        <div class="skeleton-list-text">
          <div class="skeleton-block skeleton-title" />
          <div class="skeleton-block skeleton-text-line short" />
        </div>
      </div>

      <!-- Text mode: N lines of varying width -->
      <div v-else-if="mode === 'text'" class="skeleton-text">
        <div
          v-for="i in lineCount"
          :key="i"
          class="skeleton-block skeleton-text-line"
          :style="{ width: textLineWidth(i - 1) }"
        />
      </div>

      <!-- Sidebar mode: vertical stack of rounded blocks -->
      <div v-else-if="mode === 'sidebar'" class="skeleton-sidebar">
        <div class="skeleton-block skeleton-sidebar-block" />
        <div class="skeleton-block skeleton-sidebar-block" />
        <div class="skeleton-block skeleton-sidebar-block" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  display: contents;
}

.skeleton-block {
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--anzhiyu-secondbg) 25%,
    color-mix(in srgb, var(--anzhiyu-secondbg) 70%, white 30%) 50%,
    var(--anzhiyu-secondbg) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Card mode */
.skeleton-card {
  border-radius: 12px;
  overflow: hidden;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
}

.skeleton-cover {
  height: 12rem;
  width: 100%;
  border-radius: 0;
}

.skeleton-card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 1.25rem;
  width: 75%;
}

.skeleton-text-line {
  height: 1rem;
  width: 100%;
}

.skeleton-text-line.short {
  width: 66%;
}

.skeleton-meta {
  height: 0.75rem;
  width: 50%;
  margin-top: 0.25rem;
}

/* List mode */
.skeleton-list {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-thumbnail {
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.skeleton-list-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* Text mode */
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* Sidebar mode */
.skeleton-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-sidebar-block {
  height: 8rem;
  border-radius: 0.75rem;
}

/* Shimmer animation — uses keyframe from transitions.css */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}
</style>
