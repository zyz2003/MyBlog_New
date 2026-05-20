<script setup lang="ts">
const emit = defineEmits<{
  'random-post': []
}>()

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

const defaultSkills: SkillItem[] = [
  { name: 'Vue', icon: 'i-logos-vue', color: '#57b6e6' },
  { name: 'JavaScript', icon: 'i-logos-javascript', color: '#f7c955' },
  { name: 'TypeScript', icon: 'i-logos-typescript-icon', color: '#4082f7' },
  { name: 'Docker', icon: 'i-logos-docker-icon', color: '#57b6e6' },
  { name: 'Git', icon: 'i-logos-git-icon', color: '#f0744d' },
  { name: 'CSS3', icon: 'i-logos-css-3', color: '#2c90ff' },
]

const props = defineProps<{
  title?: string
  subTitle?: string
  siteText?: string
  skills?: SkillItem[]
  peopleCanvas?: PeopleCanvasConfig
  topImage?: TopImageConfig
}>()

const displaySkills = computed(() => {
  const source = props.skills?.length ? props.skills.slice(0, 6) : defaultSkills
  return source.map((item, index) => ({
    ...item,
    bgColor: item.color || defaultSkills[index % defaultSkills.length].color,
  }))
})

const skillPairs = computed(() => {
  const evenSkills = displaySkills.value.filter((_, index) => index % 2 === 0)
  const oddSkills = displaySkills.value.filter((_, index) => index % 2 === 1)

  return evenSkills.map((left, index) => ({
    left,
    right: oddSkills[index] || left,
  }))
})

const duplicatedPairs = computed(() => [...skillPairs.value, ...skillPairs.value])
const showPeopleCanvas = computed(() => Boolean(props.peopleCanvas?.enable && props.peopleCanvas?.img))
const defaultTitle = '安知鱼'
const defaultSiteText = '生活明朗，万物可爱'
const randomExploreText = '随便逛逛'

const bannerImage = computed(() => {
  if (props.topImage?.disableTopImg) {
    return ''
  }

  return props.topImage?.indexImg || props.topImage?.defaultTopImg || ''
})

const bannerStyle = computed(() => ({
  backgroundImage: bannerImage.value
    ? `linear-gradient(120deg, rgba(255,255,255,0.9), rgba(255,255,255,0.76)), url(${bannerImage.value})`
    : undefined,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  height: props.topImage?.topImgHeight || undefined,
}))

const titleStyle = computed(() => ({
  top: props.topImage?.siteInfoTop || undefined,
}))

function getSkillInitial(name: string) {
  return name.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || name.slice(0, 1).toUpperCase()
}
</script>

<template>
  <div id="bannerGroup" class="banner-group">
    <div id="random-banner" class="random-banner" :style="bannerStyle">
      <div class="banner-overlay" />

      <div class="banners-title" :style="titleStyle">
        <div class="banners-title-big">{{ title || defaultTitle }}</div>
        <div class="banners-title-big">{{ subTitle || 'AnZhiYu' }}</div>
        <div class="banners-title-small">{{ siteText || defaultSiteText }}</div>
      </div>

      <div v-if="!showPeopleCanvas" id="skills-tags-group-all" class="skills-tags-group-all" aria-hidden="true">
        <div class="tags-group-wrapper">
          <div
            v-for="(pair, index) in duplicatedPairs"
            :key="`${pair.left.name}-${pair.right.name}-${index}`"
            class="tags-group-icon-pair"
          >
            <div class="tags-group-icon" :style="{ background: pair.left.bgColor }">
              <span v-if="pair.left.icon" :class="pair.left.icon" class="tags-group-icon-inner" />
              <span class="tags-group-fallback">{{ getSkillInitial(pair.left.name) }}</span>
            </div>

            <div class="tags-group-icon" :style="{ background: pair.right.bgColor }">
              <span v-if="pair.right.icon" :class="pair.right.icon" class="tags-group-icon-inner" />
              <span class="tags-group-fallback">{{ getSkillInitial(pair.right.name) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="peoplecanvas-shell" aria-hidden="true">
        <div class="peoplecanvas-glow" />
        <img :src="peopleCanvas?.img" alt="" class="peoplecanvas-image">
      </div>

      <button id="random-hover" class="random-hover" type="button" @click="emit('random-post')">
        <i class="anzhiyufont anzhiyu-icon-paper-plane random-hover-icon" />
        <div class="banner-text">
          {{ randomExploreText }}
          <i class="anzhiyufont anzhiyu-icon-arrow-right banner-arrow" />
        </div>
      </button>
    </div>

    <div class="categoryGroup">
      <slot name="categories" />
    </div>
  </div>
</template>

<style scoped>
.banner-group {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 340px;
  min-width: 0;
  gap: 0.75rem;
}

.random-banner {
  position: relative;
  display: flex;
  width: 100%;
  height: 76%;
  margin-bottom: 0.5rem;
  flex-direction: column;
  overflow: hidden;
  border: var(--style-border-always);
  border-radius: 18px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
  will-change: transform;
  isolation: isolate;
}

.random-banner:hover {
  box-shadow: var(--anzhiyu-shadow-main);
}

.random-banner:hover .random-hover {
  opacity: 1;
  padding-left: 2rem;
  background: color-mix(in srgb, var(--anzhiyu-main) 82%, rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.banner-overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at right center, rgba(255, 255, 255, 0.22), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
}

.banners-title {
  position: absolute;
  top: 1.9rem;
  left: 2rem;
  z-index: 3;
  max-width: 18rem;
}

.banners-title-big {
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  line-height: 1.04;
  font-weight: 800;
  color: var(--anzhiyu-fontcolor);
}

.banners-title-big + .banners-title-big {
  margin-top: 0.2rem;
}

.banners-title-small {
  margin-top: 0.95rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--anzhiyu-secondtext);
}

.skills-tags-group-all {
  position: absolute;
  top: -120px;
  right: -180px;
  z-index: 1;
  display: flex;
  width: max-content;
  transform: rotate(-30deg);
  transition: 0.3s;
}

.tags-group-wrapper {
  display: flex;
  flex-wrap: nowrap;
  animation: rowup 60s linear infinite;
}

.tags-group-icon-pair {
  margin-left: 1rem;
}

.tags-group-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 30px;
  color: #fff;
  box-shadow: var(--anzhiyu-shadow-blackdeep, 0 20px 40px rgba(0, 0, 0, 0.18));
}

.tags-group-icon:nth-child(even) {
  margin-top: 1rem;
  transform: translateX(-60px);
}

.tags-group-icon-inner {
  display: inline-block;
  width: 60px;
  height: 60px;
  opacity: 0.92;
}

.tags-group-fallback {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.peoplecanvas-shell {
  position: absolute;
  right: 0.5rem;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: min(46%, 22rem);
  height: 100%;
  pointer-events: none;
}

.peoplecanvas-glow {
  position: absolute;
  right: 15%;
  bottom: 2.5rem;
  width: 11rem;
  height: 11rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 24%, transparent);
  filter: blur(42px);
  opacity: 0.72;
}

.peoplecanvas-image {
  position: relative;
  z-index: 1;
  width: 100%;
  max-height: 94%;
  object-fit: contain;
  object-position: bottom right;
  filter: drop-shadow(0 24px 30px rgba(15, 23, 42, 0.18));
}

.random-hover {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.7rem;
  border: 0;
  background: var(--anzhiyu-theme);
  color: var(--anzhiyu-white);
  text-decoration: none;
  opacity: 0;
  transition: cubic-bezier(0.71, 0.15, 0.16, 1.15) 0.6s;
  cursor: pointer;
}

.random-hover-icon {
  font-size: 2rem;
}

.banner-text {
  display: flex;
  align-items: center;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.banner-arrow {
  margin-left: 0.75rem;
  font-size: 2.2rem;
}

.categoryGroup {
  display: flex;
  gap: 0.5rem;
  min-height: 76px;
}

@keyframes rowup {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 1400px) {
  .skills-tags-group-all {
    top: -140px;
    right: -220px;
    transform: rotate(-30deg) scale(0.88);
    transform-origin: top right;
  }
}

@media (max-width: 768px) {
  .banner-group {
    height: auto;
  }

  .random-banner {
    min-height: 280px;
  }

  .banner-text {
    font-size: 2rem;
  }

  .random-hover-icon {
    font-size: 1.4rem;
  }

  .banner-arrow {
    font-size: 1.4rem;
  }
}
</style>
