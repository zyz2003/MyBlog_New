<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const { getPageBySlug } = usePublicApi()
const { homepage, errorImage, refresh } = useSiteSettings()

const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : param
})

const isFriendsPage = computed(() => slug.value === 'friends')

await refresh()

const { data } = await useAsyncData(
  () => `page-${slug.value}`,
  () => getPageBySlug(slug.value),
  { watch: [slug] },
)

const pageData = computed(() => data.value?.data)

const friendsHeroTitle = computed(() =>
  homepage.value.linkPageTop.enable && homepage.value.linkPageTop.title
    ? homepage.value.linkPageTop.title
    : (pageData.value?.title || '友情链接'),
)

const friendsApplyText = computed(() =>
  homepage.value.linkPageTop.enable && homepage.value.linkPageTop.addFriendPlaceholder
    ? homepage.value.linkPageTop.addFriendPlaceholder
    : '欢迎交换友链，请通过留言或邮件与我联系。',
)

useSeoMeta({
  title: () => pageData.value?.seoTitle || pageData.value?.title || '',
  ogTitle: () => pageData.value?.seoTitle || pageData.value?.title || '',
  description: () => pageData.value?.seoDescription || '',
  ogDescription: () => pageData.value?.seoDescription || '',
})
</script>

<template>
  <ClientOnly v-if="pageData">
    <div v-if="isFriendsPage" class="friends-shell mx-auto max-w-[1240px] px-4 py-6">
      <section class="friends-hero">
        <div class="friends-hero-copy">
          <span class="friends-badge">Friends</span>
          <h1 class="friends-title">{{ friendsHeroTitle }}</h1>
          <p class="friends-description">{{ pageData.seoDescription || '欢迎交换友链，一起把博客的边界越走越远。' }}</p>
          <div class="friends-apply">
            <p class="friends-apply-label">申请友链</p>
            <p class="friends-apply-text whitespace-pre-line">{{ friendsApplyText }}</p>
          </div>
        </div>

        <div class="friends-hero-media">
          <img
            v-if="errorImage.flink"
            :src="errorImage.flink"
            alt="友情链接插图"
            class="friends-hero-image"
          >
          <div v-else class="friends-hero-fallback">
            <span class="i-heroicons-link h-10 w-10" />
          </div>
        </div>
      </section>

      <section class="friends-content">
        <div class="friends-content-head">
          <div>
            <p class="friends-content-kicker">Link Collection</p>
            <h2 class="friends-content-title">站点与伙伴</h2>
          </div>
          <p class="friends-content-desc">这里收纳我的朋友们，也欢迎认真做内容的站点来交换链接。</p>
        </div>

        <DynamicPageRenderer v-if="pageData.componentCode" :code="pageData.componentCode" />
        <div v-else class="friends-empty-state">
          页面内容为空
        </div>
      </section>
    </div>

    <template v-else>
      <DynamicPageRenderer v-if="pageData.componentCode" :code="pageData.componentCode" />
      <div v-else class="py-12 text-center text-gray-400">
        页面内容为空
      </div>
    </template>

    <template #fallback>
      <div class="py-12 text-center text-gray-400">
        加载中...
      </div>
    </template>
  </ClientOnly>

  <div v-else class="py-12 text-center text-gray-400">
    页面不存在或未发布
  </div>
</template>

<style scoped>
.friends-shell {
  width: 100%;
}

.friends-hero {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  align-items: stretch;
  padding: 1.75rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%), var(--anzhiyu-card-bg)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 16%, transparent) 0, transparent 18rem);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.friends-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.9rem;
}

.friends-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  color: var(--anzhiyu-main);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.friends-title {
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 900;
  line-height: 1.06;
  color: var(--anzhiyu-fontcolor);
}

.friends-description {
  max-width: 40rem;
  color: var(--anzhiyu-secondtext);
  font-size: 1rem;
  line-height: 1.8;
}

.friends-apply {
  padding: 1rem 1.1rem;
  border: 1px dashed color-mix(in srgb, var(--anzhiyu-main) 28%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 72%, white 28%);
}

.friends-apply-label {
  margin-bottom: 0.35rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.92rem;
  font-weight: 700;
}

.friends-apply-text {
  color: var(--anzhiyu-secondtext);
  font-size: 0.95rem;
  line-height: 1.8;
}

.friends-hero-media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 1rem;
  border-radius: 24px;
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent), transparent 68%),
    color-mix(in srgb, var(--anzhiyu-card-bg) 90%, white 10%);
  overflow: hidden;
}

.friends-hero-image {
  width: 100%;
  max-width: 320px;
  max-height: 240px;
  object-fit: contain;
}

.friends-hero-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  color: var(--anzhiyu-main);
}

.friends-content {
  margin-top: 1.4rem;
  padding: 1.4rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
}

.friends-content-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.friends-content-kicker {
  margin-bottom: 0.35rem;
  color: var(--anzhiyu-main);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.friends-content-title {
  color: var(--anzhiyu-fontcolor);
  font-size: 1.7rem;
  font-weight: 800;
}

.friends-content-desc {
  max-width: 32rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.95rem;
  line-height: 1.8;
  text-align: right;
}

.friends-empty-state {
  padding: 2rem 1rem;
  color: var(--anzhiyu-secondtext);
  text-align: center;
}

.friends-content :deep(h2) {
  margin: 1.3rem 0 1rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 1.45rem;
  font-weight: 800;
}

.friends-content :deep(.flink-desc),
.friends-content :deep(p) {
  color: var(--anzhiyu-secondtext);
  line-height: 1.9;
}

.friends-content :deep(.anzhiyu-flink-list),
.friends-content :deep(.flexcard-flink-list),
.friends-content :deep(.telescopic-site-card-group) {
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .friends-hero {
    grid-template-columns: 1fr;
    padding: 1.25rem;
  }

  .friends-hero-media {
    min-height: 180px;
  }

  .friends-content {
    padding: 1.1rem;
  }

  .friends-content-head {
    align-items: start;
    flex-direction: column;
  }

  .friends-content-desc {
    text-align: left;
  }
}
</style>
