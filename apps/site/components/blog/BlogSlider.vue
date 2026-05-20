<script setup lang="ts">
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

const activeSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const safeSwiperList = computed(() => props.swiperList || [])
const activeItem = computed(() => safeSwiperList.value[activeSlide.value])

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % (safeSwiperList.value.length || 1)
}

function startAutoplay() {
  if (safeSwiperList.value.length <= 1) {
    return
  }

  stopAutoplay()
  autoplayTimer = setInterval(nextSlide, 3000)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(startAutoplay)
onBeforeUnmount(stopAutoplay)

watch(() => props.swiperList?.length, () => {
  if (activeSlide.value >= safeSwiperList.value.length) {
    activeSlide.value = 0
  }
  startAutoplay()
})
</script>

<template>
  <div id="swiper_container_blog" class="swiper-container-blog">
    <div
      id="swiper_container"
      class="blog-slider"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
    >
      <div class="blog-slider__wrp">
        <div
          v-for="(item, index) in safeSwiperList"
          :key="item.id"
          class="blog-slider__item"
          :class="{ 'swiper-slide-active': index === activeSlide }"
        >
          <NuxtLink :to="item.path" class="blog-slider__img">
            <img :src="item.cover" :alt="item.title">
          </NuxtLink>
          <div class="blog-slider__content">
            <span class="blog-slider__code">{{ item.date }}</span>
            <NuxtLink :to="item.path" class="blog-slider__title">
              {{ item.title }}
            </NuxtLink>
            <div class="blog-slider__text">
              {{ item.description || item.excerpt }}
            </div>
            <NuxtLink :to="item.path" class="blog-slider__button">
              详情
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="blog-slider__pagination">
        <span
          v-for="(_, index) in safeSwiperList"
          :key="index"
          class="pagination-bullet"
          :class="{ active: index === activeSlide }"
          @click="activeSlide = index"
        />
      </div>
    </div>

    <div id="topPostGroup" class="top-post-group">
      <NuxtLink
        v-for="item in (topPostList || []).slice(0, 4)"
        :key="item.id"
        :to="item.path"
        class="top-group-list-item"
      >
        <div class="post_cover left_radius">
          <span class="top-group-text">荐</span>
          <img :src="item.cover" :alt="item.title" class="post_bg">
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

.blog-slider {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border: var(--style-border-always);
  border-radius: 12px 8px 8px 12px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
}

.blog-slider:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
}

.blog-slider__wrp {
  position: relative;
  height: 100%;
}

.blog-slider__item {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.blog-slider__item.swiper-slide-active {
  opacity: 1;
  pointer-events: auto;
}

.blog-slider__img {
  width: 290px;
  min-width: 290px;
  height: 200px;
  padding: 10px;
  overflow: hidden;
  border-radius: 5px;
}

.blog-slider__img img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 5px;
  opacity: 0;
  transition: all 0.3s;
}

.blog-slider__content {
  min-width: 0;
  flex: 1;
  padding: 0 50px;
}

.blog-slider__content > * {
  opacity: 0;
  transform: translateY(25px);
  transition: all 0.4s;
}

.swiper-slide-active .blog-slider__img img {
  opacity: 1;
  transition-delay: 0.3s;
}

.swiper-slide-active .blog-slider__content > * {
  opacity: 1;
  transform: none;
}

.swiper-slide-active .blog-slider__content > :nth-child(1) {
  transition-delay: 0.3s;
}

.swiper-slide-active .blog-slider__content > :nth-child(2) {
  transition-delay: 0.4s;
}

.swiper-slide-active .blog-slider__content > :nth-child(3) {
  transition-delay: 0.5s;
}

.swiper-slide-active .blog-slider__content > :nth-child(4) {
  transition-delay: 0.6s;
}

.blog-slider__code {
  display: block;
  margin-bottom: 0;
  color: var(--anzhiyu-fontcolor);
  font-weight: 500;
}

.blog-slider__title {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 15px;
  color: var(--anzhiyu-fontcolor);
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.blog-slider__text {
  display: -webkit-box;
  overflow: hidden;
  width: 100%;
  height: 50px;
  margin-bottom: 15px;
  color: var(--anzhiyu-fontcolor);
  line-height: 1.5em;
  text-overflow: ellipsis;
  word-break: break-all;
  word-wrap: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.blog-slider__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 8px;
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  font-weight: 500;
  letter-spacing: 1px;
  text-decoration: none;
}

.blog-slider__pagination {
  position: absolute;
  top: 50%;
  right: 20px;
  z-index: 21;
  display: flex;
  flex-direction: column;
  width: 11px !important;
  transform: translateY(-50%);
}

.pagination-bullet {
  width: 11px;
  height: 11px;
  margin: 8px 0;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 38%, white);
  background: color-mix(in srgb, var(--anzhiyu-main) 18%, white);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  opacity: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-bullet.active {
  height: 30px;
  border-color: var(--anzhiyu-main);
  background: var(--anzhiyu-main);
  box-shadow: none;
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
  transition: 0.3s;
}

.top-group-list-item:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
  transform: scale(1.03);
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
  transition: 0.3s;
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
</style>
