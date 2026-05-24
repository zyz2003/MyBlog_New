<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { announcement } = useSiteSettings()
</script>

<template>
  <div class="card-widget announcement-widget">
    <div class="announcement-icon">
      <i class="anzhiyufont" :class="announcement.icon || 'anzhiyu-icon-bullhorn'" />
    </div>
    <div class="announcement-content">
      <div class="card-title">公告</div>
      <div class="announcement-text">{{ announcement.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  display: flex;
  gap: 0.85rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
}

.announcement-icon {
  width: 2.6rem;
  height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, white);
  color: var(--anzhiyu-main);
  font-size: 1.15rem;
}

.announcement-content {
  min-width: 0;
  flex: 1;
}

.card-title {
  margin-bottom: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
}

.announcement-text {
  color: var(--anzhiyu-fontcolor);
  font-size: 0.9rem;
  line-height: 1.7;
}
</style>
