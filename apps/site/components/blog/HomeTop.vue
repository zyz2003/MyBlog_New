<script setup lang="ts">
interface CategoryConfig {
  name: string
  path: string
  icon?: string
  shadow?: string
  bgColor?: string
}

interface SwiperArticle {
  id: number
  title: string
  path: string
  cover: string
  date: string
  description?: string
  excerpt?: string
}

interface TopArticle {
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

interface SkillItem {
  name: string
  icon: string
  color: string
}

interface PeopleCanvasConfig {
  enable?: boolean
  img?: string
}

interface TopImageConfig {
  disableTopImg?: boolean
  indexImg?: string
  defaultTopImg?: string
  siteInfoTop?: string
  topImgHeight?: string
}

defineProps<{
  enabled: boolean
  title?: string
  subTitle?: string
  siteText?: string
  skills?: SkillItem[]
  peopleCanvas?: PeopleCanvasConfig
  topImage?: TopImageConfig
  swiperEnabled?: boolean
  swiperList?: SwiperArticle[]
  topPostList?: TopArticle[]
  topGroupList?: TopArticle[]
  todayCard?: TodayCardConfig
  categories?: CategoryConfig[]
}>()

const emit = defineEmits<{
  'random-post': []
}>()

function toRandomPost() {
  emit('random-post')
}
</script>

<template>
  <section v-if="enabled" id="home_top" class="home-top">
    <div class="swiper_container_card">
      <div class="home-top-inner" :class="swiperEnabled ? 'swiper-mode' : 'top-mode'">
        <BlogBannerGroup
          :title="title"
          :sub-title="subTitle"
          :site-text="siteText"
          :skills="skills"
          :people-canvas="peopleCanvas"
          :top-image="topImage"
          @random-post="toRandomPost"
        >
          <template #categories>
            <BlogCategoryItem
              v-for="cat in (categories || [])"
              :key="cat.name"
              :name="cat.name"
              :path="cat.path"
              :icon="cat.icon"
              :shadow="cat.shadow"
              :bg-color="cat.bgColor"
            />
          </template>
        </BlogBannerGroup>

        <BlogSlider
          v-if="swiperEnabled"
          :swiper-list="swiperList"
          :top-post-list="topPostList"
        />
        <BlogTopGroup
          v-else
          :top-group-list="topGroupList"
          :today-card="todayCard"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-top {
  width: 100%;
  margin: 0 0 1rem;
  animation: slide-in 0.6s 0.1s backwards;
}

.swiper_container_card {
  width: 100%;
  height: auto;
}

.home-top-inner {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: stretch;
}

.home-top-inner.swiper-mode > :deep(.banner-group) {
  width: calc(100% - 600px - 1rem);
  flex: none;
}

.home-top-inner.swiper-mode > :deep(#swiper_container_blog),
.home-top-inner.swiper-mode > :deep(.swiper-container-blog) {
  width: 600px;
  flex: none;
}

.home-top-inner.top-mode > :deep(.banner-group) {
  width: calc(100% - 600px - 1rem);
  flex: none;
}

.home-top-inner.top-mode > :deep(.top-group-container) {
  width: 600px;
  flex: none;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .home-top-inner {
    display: block;
  }
}
</style>
