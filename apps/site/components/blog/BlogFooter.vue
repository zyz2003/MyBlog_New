<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { footer, profile, settings } = useSiteSettings()
const config = useRuntimeConfig()

const runtimeText = ref('')
const footerSubtitleIndex = ref(0)
const friendLinksRefreshKey = ref(0)
let runtimeTimer: ReturnType<typeof setInterval> | null = null
let footerSubtitleTimer: ReturnType<typeof setInterval> | null = null
let footerSubtitleDelayTimer: ReturnType<typeof setTimeout> | null = null

function parseLaunchTime(raw: string | undefined): Date | null {
  if (!raw) {
    return null
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const direct = new Date(trimmed.replace(/\//g, '-'))
  if (!Number.isNaN(direct.getTime())) {
    return direct
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/)
  if (!match) {
    return null
  }

  const [, month, day, year, hour = '0', minute = '0', second = '0'] = match
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  )
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function calcRuntime(start: Date) {
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  if (diff < 0) {
    return ''
  }

  const days = Math.floor(diff / 86400000)
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  return `本站已运行 ${years} 年 ${remainingDays} 天`
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function isFriendGroup(title: string) {
  return /友链|友情链接|friends/i.test(title)
}

function refreshFriendLinks() {
  friendLinksRefreshKey.value++
}

function iconClass(icon: string) {
  return icon
}

function clearTimers() {
  if (runtimeTimer) {
    clearInterval(runtimeTimer)
    runtimeTimer = null
  }
  if (footerSubtitleTimer) {
    clearInterval(footerSubtitleTimer)
    footerSubtitleTimer = null
  }
  if (footerSubtitleDelayTimer) {
    clearTimeout(footerSubtitleDelayTimer)
    footerSubtitleDelayTimer = null
  }
}

const centerAvatar = computed(() => footer.value.socialBar.centerImg || profile.value.avatar || '')
const siteInitial = computed(() => (config.public.siteName || 'B').slice(0, 1).toUpperCase())
const backToTopText = '返回顶部'
const copyrightAgreementText = '版权协议'
const footerSubtitleList = computed(() => footer.value.footerBar.subTitle.sub || [])
const footerRuntimeStart = computed(() => parseLaunchTime(footer.value.runtime.launch_time))
const isWorkTime = computed(() => {
  const hour = new Date().getHours()
  return hour >= 9 && hour < 18
})
const runtimeImage = computed(() => (
  isWorkTime.value
    ? (footer.value.runtime.work_img || footer.value.runtime.offduty_img || '')
    : (footer.value.runtime.offduty_img || footer.value.runtime.work_img || '')
))
const runtimeDescription = computed(() => (
  isWorkTime.value
    ? (footer.value.runtime.work_description || footer.value.runtime.offduty_description || '')
    : (footer.value.runtime.offduty_description || footer.value.runtime.work_description || '')
))
const footerSubtitleText = computed(() => {
  if (!footer.value.footerBar.subTitle.enable || footerSubtitleList.value.length === 0) {
    return ''
  }

  return footerSubtitleList.value[footerSubtitleIndex.value % footerSubtitleList.value.length] || ''
})
const footerCcLink = computed(() => footer.value.footerBar.cc.link || '/copyright')
const footerBgEnabled = computed(() => Boolean(settings.value.footer_bg))
const footerGroups = computed(() => {
  // Depend on friendLinksRefreshKey so incrementing it forces re-shuffle
  const _refreshKey = friendLinksRefreshKey.value
  void _refreshKey

  const groups = footer.value.list.project || []
  const randomFriends = Number(footer.value.list.randomFriends || 0)

  return groups.map((group) => {
    if (randomFriends <= 0) {
      return group
    }

    const isFriendGroup = /友链|友情链接|friends/i.test(group.title)
    if (!isFriendGroup || group.links.length <= randomFriends) {
      return group
    }

    const shuffled = [...group.links]
      .map(link => ({ link, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, randomFriends)
      .map(item => item.link)

    return {
      ...group,
      links: shuffled,
    }
  })
})

function startSubtitleRotation() {
  if (!footer.value.footerBar.subTitle.enable || footerSubtitleList.value.length <= 1 || !footer.value.footerBar.subTitle.effect) {
    return
  }

  const subTitleConfig = footer.value.footerBar.subTitle
  const startDelay = Math.max(0, Number(subTitleConfig.startDelay || 0))
  const rotateEvery = Math.max(1200, Number(subTitleConfig.typeSpeed || 150) * 8 + Number(subTitleConfig.backSpeed || 50) * 6)

  const rotate = () => {
    footerSubtitleTimer = setInterval(() => {
      const nextIndex = footerSubtitleIndex.value + 1
      if (!subTitleConfig.loop && nextIndex >= footerSubtitleList.value.length) {
        if (footerSubtitleTimer) {
          clearInterval(footerSubtitleTimer)
          footerSubtitleTimer = null
        }
        return
      }
      footerSubtitleIndex.value = nextIndex % footerSubtitleList.value.length
    }, rotateEvery)
  }

  if (startDelay > 0) {
    footerSubtitleDelayTimer = setTimeout(rotate, startDelay)
    return
  }

  rotate()
}

onMounted(() => {
  if (footer.value.runtime.enable && footerRuntimeStart.value) {
    runtimeText.value = calcRuntime(footerRuntimeStart.value)
    runtimeTimer = setInterval(() => {
      if (footerRuntimeStart.value) {
        runtimeText.value = calcRuntime(footerRuntimeStart.value)
      }
    }, 1000)
  }

  startSubtitleRotation()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <footer id="footer" class="footer-shell" :class="{ 'footer-shell-bg': footerBgEnabled }">
    <div id="footer-wrap" class="footer-wrap">
      <div v-if="footer.socialBar.enable" id="footer_deal" class="footer-deal">
        <a
          v-for="(item, index) in footer.socialBar.left"
          :key="`left-${index}`"
          :href="item.link"
          :title="item.title"
          class="deal-link"
        >
          <i :class="iconClass(item.icon)" />
        </a>

        <button class="footer-mini-logo" type="button" :aria-label="backToTopText" @click="scrollToTop">
          <img v-if="centerAvatar" :src="centerAvatar" :alt="config.public.siteName">
          <span v-else class="footer-mini-logo-text">{{ siteInitial }}</span>
        </button>

        <a
          v-for="(item, index) in footer.socialBar.right"
          :key="`right-${index}`"
          :href="item.link"
          :title="item.title"
          class="deal-link"
        >
          <i :class="iconClass(item.icon)" />
        </a>
      </div>

      <div
        v-if="footer.owner.enable && !footer.footerBar.enable"
        class="copyright copyright-main"
      >
        &copy;{{ footer.owner.since ? `${footer.owner.since} - ` : '' }}{{ new Date().getFullYear() }} By {{ config.public.siteName }}
      </div>

      <div v-if="footer.runtime.enable" id="workboard" class="workboard">
        <img
          v-if="runtimeImage"
          :src="runtimeImage"
          :alt="runtimeDescription || 'runtime'"
          :title="runtimeDescription || 'runtime'"
          class="workboard-image"
        >
        <div v-if="runtimeDescription" class="runtime-description">
          {{ runtimeDescription }}
        </div>
        <div id="runtimeTextTip" class="runtime-text">{{ runtimeText }}</div>
      </div>

      <div v-if="footer.custom_text" class="footer-custom-text" v-html="footer.custom_text" />

      <div v-if="footer.list.enable" id="anzhiyu-footer" class="anzhiyu-footer">
        <div
          v-for="(group, index) in footerGroups"
          :key="index"
          class="footer-group"
        >
          <div class="footer-title-group">
            <span>{{ group.title }}</span>
            <button
              v-if="isFriendGroup(group.title) && (footer.list.randomFriends ?? 0) > 0"
              type="button"
              class="friend-refresh-btn"
              :aria-label="'刷新友链'"
              @click="refreshFriendLinks"
            >
              <i class="anzhiyufont anzhiyu-icon-arrow-rotate-right" />
            </button>
          </div>
          <div class="footer-links">
            <a
              v-for="(link, linkIndex) in group.links"
              :key="linkIndex"
              :href="link.link"
              :title="link.title"
              class="footer-item"
            >
              {{ link.title }}
            </a>
          </div>
        </div>
      </div>

      <p v-if="footer.bdageitem.enable" id="ghbdages" class="github-badges">
        <a
          v-for="(badge, index) in footer.bdageitem.list"
          :key="index"
          class="github-badge"
          target="_blank"
          :href="badge.link"
          :data-title="badge.message"
          :title="badge.message"
        >
          <img :src="badge.shields" :alt="badge.message">
        </a>
      </p>
    </div>

    <div v-if="footer.footerBar.enable" id="footer-bar" class="footer-bar">
      <div class="footer-bar-links">
        <div class="footer-bar-left">
          <div class="footer-bar-meta">
            <div class="copyright">
              &copy;{{ footer.owner.since ? `${footer.owner.since} - ` : '' }}{{ new Date().getFullYear() }} By
              <a
                class="footer-bar-link"
                :href="footer.footerBar.authorLink || '/'"
                :title="config.public.siteName"
                target="_blank"
              >
                {{ config.public.siteName }}
              </a>
            </div>

            <div v-if="footerSubtitleText" class="footer-subtitle">
              {{ footerSubtitleText }}
            </div>
          </div>
        </div>

        <div class="footer-bar-right">
          <a
            v-for="(link, index) in footer.footerBar.linkList"
            :key="index"
            class="footer-bar-link"
            :href="link.link"
            :title="link.text"
          >
            {{ link.text }}
          </a>

          <a
            v-if="footer.footerBar.cc.enable"
            class="footer-bar-link footer-bar-cc"
            :href="footerCcLink"
            :title="copyrightAgreementText"
          >
            <i class="anzhiyufont anzhiyu-icon-copyright-line" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-by-line" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-nc-line" />
            <i class="anzhiyufont anzhiyu-icon-creative-commons-nd-line" />
          </a>

          <button class="back-top-button" type="button" @click="scrollToTop">
            {{ backToTopText }}
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-shell {
  position: relative;
  margin-top: 3rem;
  background: linear-gradient(180deg, transparent 0%, var(--anzhiyu-card-bg) 25%);
}

.footer-shell.footer-shell-bg {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent), transparent 24rem),
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 18rem),
    linear-gradient(180deg, transparent 0%, var(--anzhiyu-card-bg) 22%);
}

.footer-wrap {
  position: relative;
  padding: 40px 20px 0;
  text-align: center;
}

.footer-deal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.deal-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 1rem 27px;
  border-radius: 3rem;
  background: var(--anzhiyu-fontcolor);
  color: var(--anzhiyu-card-bg);
  text-decoration: none;
  transition: 0.3s;
}

.deal-link:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.footer-mini-logo {
  width: 50px;
  height: 50px;
  margin: 0 1rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  transition: cubic-bezier(0, 0, 0, 1.29) 0.5s;
}

.footer-mini-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.footer-mini-logo-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 18%, white), var(--anzhiyu-card-bg));
  color: var(--anzhiyu-fontcolor);
  font-size: 1.2rem;
  font-weight: 800;
}

.copyright-main {
  margin-top: 1rem;
  color: var(--anzhiyu-fontcolor);
}

.workboard {
  margin-top: 1rem;
}

.workboard-image {
  display: block;
  margin: 0 auto;
}

.runtime-description {
  margin-top: 0.75rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.95rem;
}

.runtime-text {
  margin-top: 0.5rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.9rem;
}

.footer-custom-text {
  margin-top: 0.75rem;
  color: var(--anzhiyu-fontcolor);
}

.anzhiyu-footer {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 2rem;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.footer-group {
  min-width: 120px;
}

.footer-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  color: var(--anzhiyu-secondtext);
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
}

.friend-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.6;
  color: var(--anzhiyu-secondtext);
  transition: 0.3s;
}

.friend-refresh-btn:hover {
  color: var(--anzhiyu-main);
  opacity: 1;
}

.footer-links {
  display: flex;
  flex-direction: column;
}

.footer-item {
  max-width: 120px;
  margin: 8px 0;
  margin-right: auto;
  padding: 2px 0;
  overflow: hidden;
  color: var(--anzhiyu-fontcolor);
  font-size: 1rem;
  line-height: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;
  cursor: pointer;
  transition: 0.3s;
}

.footer-item:hover {
  color: var(--anzhiyu-theme, var(--anzhiyu-main));
}

.github-badges {
  margin-top: 1rem;
}

.github-badge {
  display: inline-block;
  margin-inline: 5px;
}

.footer-bar {
  display: flex;
  overflow: hidden;
  z-index: 1002;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--anzhiyu-secondbg);
  color: var(--anzhiyu-fontcolor);
  transition: 0.3s;
}

.footer-bar-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  line-height: 1;
}

.footer-bar-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 32px;
}

.footer-bar-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.footer-bar-right {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.copyright {
  color: var(--anzhiyu-fontcolor);
  font-size: 1rem;
  font-weight: 700;
}

.footer-bar-link {
  margin-top: 8px;
  margin-right: 1rem;
  margin-bottom: 8px;
  color: var(--anzhiyu-fontcolor);
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;
}

.footer-bar-link:hover {
  color: var(--anzhiyu-lighttext, var(--anzhiyu-main));
}

.footer-subtitle {
  color: var(--anzhiyu-secondtext);
  font-size: 0.86rem;
  line-height: 1.6;
}

.footer-bar-cc {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.85rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  color: var(--anzhiyu-main);
}

.footer-bar-cc i {
  font-size: 18px;
}

.back-top-button {
  margin-top: 8px;
  margin-bottom: 8px;
  border: 0;
  border-radius: 999px;
  background: var(--anzhiyu-fontcolor);
  color: var(--anzhiyu-card-bg);
  padding: 0.55rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .footer-wrap {
    padding: 0;
  }

  .footer-deal {
    flex-wrap: wrap;
    flex-direction: row;
  }

  .footer-mini-logo {
    display: none;
  }

  .anzhiyu-footer {
    padding: 0;
    gap: 1rem 1.25rem;
  }
}
</style>
