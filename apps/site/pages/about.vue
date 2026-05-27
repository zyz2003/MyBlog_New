<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const { profile, social, settings, refresh } = useSiteSettings()
const { articleCount, categoryCount, tagCount } = useSiteStats()
const { observe, cleanup } = useScrollReveal()

await refresh()

const aboutContent = computed(() => String(settings.value.aboutContent || ''))

// Template refs for about sections
const aboutHeroRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const aboutContentRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    if (aboutHeroRef.value) observe(aboutHeroRef.value)
    if (statsRef.value) observe(statsRef.value)
    if (aboutContentRef.value) observe(aboutContentRef.value)
  })
})

onUnmounted(() => {
  cleanup()
})

useSeoMeta({
  title: '关于',
  ogTitle: '关于',
  description: () => profile.value.description || '关于本站',
  ogDescription: () => profile.value.description || '关于本站',
})
</script>

<template>
  <div class="about-page">
    <section ref="aboutHeroRef" class="about-hero scroll-reveal">
      <div class="author-card">
        <div class="avatar-wrapper">
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            :alt="profile.authorName"
            class="author-avatar"
          />
          <div v-else class="author-avatar avatar-placeholder">
            {{ profile.authorName?.charAt(0) || '?' }}
          </div>
        </div>

        <h1 class="author-name">{{ profile.authorName }}</h1>
        <p v-if="profile.description" class="author-bio">{{ profile.description }}</p>

        <div v-if="social.length" class="social-links">
          <a
            v-for="(link, index) in social"
            :key="index"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            <i v-if="link.icon" :class="link.icon" />
            <span v-else>{{ link.name }}</span>
          </a>
        </div>
      </div>
    </section>

    <section ref="statsRef" class="stats-section scroll-reveal scroll-reveal-delay-1">
      <div class="stat-card">
        <span class="stat-count">{{ articleCount }}</span>
        <span class="stat-label">文章</span>
      </div>
      <div class="stat-card">
        <span class="stat-count">{{ categoryCount }}</span>
        <span class="stat-label">分类</span>
      </div>
      <div class="stat-card">
        <span class="stat-count">{{ tagCount }}</span>
        <span class="stat-label">标签</span>
      </div>
    </section>

    <section v-if="aboutContent" ref="aboutContentRef" class="about-content scroll-reveal scroll-reveal-delay-2">
      <ArticleContent :content="aboutContent" />
    </section>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.about-hero {
  padding: 2rem 1.75rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent) 0, transparent 16rem),
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%), var(--anzhiyu-card-bg));
}

.author-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.avatar-wrapper {
  position: relative;
}

.author-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--anzhiyu-main);
  transition: transform 0.5s ease;
}

.avatar-wrapper:hover .author-avatar {
  transform: rotate(360deg);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--anzhiyu-main) 15%, var(--anzhiyu-card-bg));
  color: var(--anzhiyu-main);
  font-size: 3rem;
  font-weight: 700;
}

.author-name {
  color: var(--anzhiyu-fontcolor);
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
}

.author-bio {
  color: var(--anzhiyu-secondtext);
  font-size: 0.95rem;
  text-align: center;
  max-width: 480px;
  line-height: 1.6;
  margin: 0;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 18%, transparent);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.25rem;
  border: var(--style-border-always);
  border-radius: 16px;
  background: var(--anzhiyu-card-bg);
}

.stat-count {
  color: var(--anzhiyu-main);
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
}

.about-content {
  padding: 1.5rem 1.75rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
}

@media (max-width: 768px) {
  .about-hero {
    padding: 1.5rem 1.25rem;
  }

  .author-avatar {
    width: 90px;
    height: 90px;
  }

  .stats-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.85rem;
  }

  .stat-count {
    font-size: 1.4rem;
  }
}
</style>