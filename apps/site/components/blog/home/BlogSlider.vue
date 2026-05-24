<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCreative, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface SwiperItem {
  id: number
  title: string
  path: string
  cover: string
  date: string
  description?: string
  excerpt?: string
}

interface TopPostItem {
  id: number
  title: string
  path: string
  cover: string
}

const props = defineProps<{
  swiperList?: SwiperItem[]
  topPostList?: TopPostItem[]
}>()

const modules = [Autoplay, EffectCreative, Pagination, Navigation]

const safeSwiperList = computed(() => props.swiperList || [])
const activeSlide = ref(0)
const activeItem = computed(() => safeSwiperList.value[activeSlide.value])
</script>

<template>
  <div id="swiper_container_blog" class="swiper-container-blog">
    <ClientOnly>
      <Swiper
        :modules="modules"
        :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }"
        effect="creative"
        :creative-effect="{
          prev: { shadow: true, translate: ['-20%', 0, -1] },
          next: { translate: ['100%', 0, 0] }
        }"
        :pagination="{ clickable: true, dynamicBullets: true }"
        :navigation="true"
        :loop="true"
        class="home-swiper"
      >
        <SwiperSlide v-for="item in safeSwiperList" :key="item.id">
          <NuxtLink :to="item.path" class="slide-link">
            <img :src="item.cover" :alt="item.title" class="slide-image" />
            <div class="slide-overlay">
              <span class="slide-code">{{ item.date }}</span>
              <h2 class="slide-title">{{ item.title }}</h2>
              <p v-if="item.description || item.excerpt" class="slide-excerpt">
                {{ item.description || item.excerpt }}
              </p>
            </div>
          </NuxtLink>
        </SwiperSlide>
      </Swiper>
    </ClientOnly>

    <div id="topPostGroup" class="top-post-group">
      <NuxtLink
        v-for="item in (topPostList || []).slice(0, 4)"
        :key="item.id"
        :to="item.path"
        class="top-group-list-item card-hover"
      >
        <div class="post_cover left_radius">
          <span class="top-group-text">荐</span>
          <img :src="item.cover" :alt="item.title" class="post_bg" />
        </div>
        <div class="top-group-info">
          <span class="article-title">{{ item.title }}</span>
        </div>
      </NuxtLink>
      <div
        v-for="i in Math.max(0, 4 - (topPostList?.length || 0))"
        :key="'ph-' + i"
        class="top-group-list-none"
      />
    </div>
  </div>
</template>

<style scoped>
.swiper-container-blog {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 0.65rem;
}

.home-swiper {
  width: 100%;
  height: 200px;
  border-radius: 12px 8px 8px 12px;
  overflow: hidden;
}

.slide-link {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.slide-code {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
}

.slide-title {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.slide-excerpt {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.4;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.top-post-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.top-group-list-item,
.top-group-list-none {
  width: calc(25% - 0.5rem);
}

.top-group-list-item {
  display: flex;
  height: 128px;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  border: var(--style-border-always);
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.top-group-list-item:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
  transform: translateY(-8px);
}

.post_cover {
  width: 100%;
}

.post_cover a,
.left_radius {
  height: 80px;
  overflow: hidden;
  display: flex;
}

.post_bg {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  background: var(--anzhiyu-secondbg);
}

.top-group-text {
  position: absolute;
  top: 0;
  left: -40px;
  z-index: 1;
  display: flex;
  padding: 2px 8px;
  border-radius: 12px 0 12px 0;
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  font-size: 12px;
  transition: left 0.3s ease;
}

.top-group-list-item:hover .top-group-text {
  left: 0;
}

.top-group-info {
  padding: 0.3rem 0.5rem;
  transition: 0.3s;
}

.top-group-info .article-title {
  display: -webkit-box;
  overflow: hidden;
  padding-top: 0.5rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.top-group-list-item:hover .article-title {
  color: var(--anzhiyu-main);
}

.top-group-list-none {
  visibility: hidden;
}

/* Custom Swiper pagination and navigation colors */
:deep(.swiper-pagination-bullet) {
  background: color-mix(in srgb, var(--anzhiyu-main) 18%, white);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background: var(--anzhiyu-main);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: var(--anzhiyu-main);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-swiper:hover :deep(.swiper-button-next),
.home-swiper:hover :deep(.swiper-button-prev) {
  opacity: 1;
}
</style>
