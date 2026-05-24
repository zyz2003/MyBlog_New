<script setup lang="ts">
interface TopGroupItem {
  id: number
  title: string
  path: string
  cover: string
}

interface TodayCardConfig {
  tips?: string
  title?: string
  image?: string
  link?: string
}

defineProps<{
  topGroupList?: TopGroupItem[]
  todayCard?: TodayCardConfig
}>()

const recommendLabel = '荐'
const todayRecommendText = '今日推荐'
const todayMoreText = '查看更多'
const todayMoreRecommendText = '更多推荐'
</script>

<template>
  <div class="top-group-container">
    <div class="topGroup">
      <NuxtLink
        v-for="item in (topGroupList || []).slice(0, 6)"
        :key="item.id"
        :to="item.path"
        class="recent-post-item"
      >
        <div class="post_cover left_radius">
          <span class="recent-post-top-text">{{ recommendLabel }}</span>
          <img :src="item.cover" :alt="item.title" class="post_bg">
        </div>
        <div class="recent-post-info">
          <span class="article-title">{{ item.title }}</span>
        </div>
      </NuxtLink>
    </div>

    <NuxtLink
      v-if="todayCard"
      id="todayCard"
      :to="todayCard.link || '/'"
      class="todayCard"
    >
      <div class="todayCard-info">
        <div class="todayCard-tips">{{ todayCard.tips || todayRecommendText }}</div>
        <div class="todayCard-title">{{ todayCard.title || todayMoreText }}</div>
      </div>
      <img
        v-if="todayCard.image"
        :src="todayCard.image"
        alt="today cover"
        class="todayCard-cover"
      >
      <div class="banner-button-group">
        <div class="banner-button">
          <i class="anzhiyufont anzhiyu-icon-arrow-circle-right" />
          <span class="banner-button-text">{{ todayMoreRecommendText }}</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.top-group-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
}

.topGroup {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.recent-post-item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: var(--style-border-always);
  border-radius: 16px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
  text-decoration: none;
  transition: 0.3s;
  cursor: pointer;
}

.recent-post-item:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
  transform: translateY(-3px);
}

.post_cover {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.left_radius {
  border-radius: 16px 16px 0 0;
}

.post_bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--anzhiyu-secondbg);
  transition: transform 0.4s ease;
}

.recent-post-item:hover .post_bg {
  transform: scale(1.06);
}

.recent-post-top-text {
  position: absolute;
  top: 0;
  left: -40px;
  z-index: 1;
  display: flex;
  padding: 2px 8px;
  border-radius: 12px 0 12px 0;
  background: var(--anzhiyu-theme);
  color: var(--anzhiyu-white);
  font-size: 12px;
  transition: 0.3s;
}

.recent-post-item:hover .recent-post-top-text {
  left: 0;
}

.recent-post-info {
  padding: 0.55rem 0.7rem 0.75rem;
  transition: 0.3s;
}

.recent-post-info .article-title {
  display: -webkit-box;
  overflow: hidden;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recent-post-item:hover .article-title {
  color: var(--anzhiyu-main);
}

.todayCard {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 220px;
  overflow: hidden;
  border-radius: 16px;
  background: var(--anzhiyu-card-bg);
  text-decoration: none;
}

.todayCard::after {
  position: absolute;
  inset: 0;
  content: '';
  box-shadow: inset 0 -109px 133px -9px rgba(0, 0, 0, 0.7);
}

.todayCard-info {
  position: absolute;
  left: 2rem;
  bottom: 2rem;
  z-index: 2;
  max-width: 60%;
  color: var(--anzhiyu-white);
}

.todayCard-tips {
  font-size: 12px;
  opacity: 0.84;
}

.todayCard-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.todayCard-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  transition: 0.3s;
}

.todayCard:hover .todayCard-cover {
  transform: scale(1.04);
}

.banner-button-group {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  z-index: 2;
  display: flex;
}

.banner-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 125px;
  height: 40px;
  padding: 0 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  color: var(--anzhiyu-white);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  transition: 0.3s;
}

.todayCard:hover .banner-button {
  background: var(--anzhiyu-theme);
}

@media (max-width: 768px) {
  .topGroup {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .todayCard {
    min-height: 180px;
  }
}
</style>
