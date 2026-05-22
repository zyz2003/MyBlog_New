<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { home } = useSiteSettings()

const todayPick = computed(() => {
  const pick = home.value?.todayCard
  if (!pick) return null
  return {
    title: pick.title,
    path: pick.link || '/',
    excerpt: pick.tips,
    cover: pick.image,
  }
})
</script>

<template>
  <div v-if="todayPick" class="today-pick-banner">
    <NuxtLink :to="todayPick.path" class="today-pick-link">
      <div class="today-pick-badge">
        <i class="anzhiyufont anzhiyu-icon-star" />
        <span>今日推荐</span>
      </div>
      <div class="today-pick-content">
        <h3 class="today-pick-title">{{ todayPick.title }}</h3>
        <p v-if="todayPick.excerpt" class="today-pick-excerpt">
          {{ todayPick.excerpt }}
        </p>
      </div>
      <img v-if="todayPick.cover" :src="todayPick.cover" :alt="todayPick.title" class="today-pick-cover" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.today-pick-banner {
  margin-top: 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 12%, white), color-mix(in srgb, var(--anzhiyu-accent) 10%, white));
  border: var(--style-border-always);
  transition: all 0.3s ease;
}

.today-pick-banner:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border: var(--style-border-hover);
}

.today-pick-link {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  text-decoration: none;
}

.today-pick-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.today-pick-badge i {
  font-size: 14px;
}

.today-pick-content {
  flex: 1;
  min-width: 0;
}

.today-pick-title {
  margin: 0 0 0.5rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.today-pick-excerpt {
  margin: 0;
  overflow: hidden;
  color: var(--anzhiyu-secondtext);
  font-size: 13px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-pick-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .today-pick-link {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .today-pick-cover {
    width: 100%;
    height: 120px;
  }

  .today-pick-excerpt {
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
  }
}
</style>
