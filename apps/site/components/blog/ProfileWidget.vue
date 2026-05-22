<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { profile, social, authorStatus } = useSiteSettings()
const config = useRuntimeConfig()

const authorName = computed(() => profile.value.authorName || config.public.siteName)
const avatar = computed(() => profile.value.avatar || '/avatar.png')
const avatarEffect = computed(() => profile.value.avatarEffect)
const description = computed(() => profile.value.description || '生活明朗，万物可爱')
const authorSkills = computed(() => authorStatus.value.enable ? authorStatus.value.skills : [])
</script>

<template>
  <div class="card-widget profile-widget">
    <div class="profile-cover" />
    <div class="profile-avatar" :class="{ 'is-effect': avatarEffect }">
      <img :src="avatar" :alt="authorName">
    </div>
    <div class="profile-name">{{ authorName }}</div>
    <div class="profile-description">{{ description }}</div>
    <div v-if="authorStatus.enable && authorStatus.statusImg" class="profile-status-image">
      <img :src="authorStatus.statusImg" :alt="authorName">
    </div>
    <div v-if="authorSkills.length > 0" class="profile-skills">
      <span v-for="(skill, index) in authorSkills" :key="index" class="profile-skill">{{ skill }}</span>
    </div>

    <div v-if="social.length > 0" class="profile-socials">
      <a
        v-for="(link, index) in social"
        :key="index"
        :href="link.url || '#'"
        class="profile-social"
        target="_blank"
        rel="noopener"
      >
        <i v-if="link.icon" class="anzhiyufont" :class="link.icon" />
        <i v-else class="anzhiyufont anzhiyu-icon-link" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  padding: 0 1.2rem 1.2rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
}

.profile-cover {
  height: 5.2rem;
  margin: 0 -1.2rem;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 24%, white), transparent 70%),
    linear-gradient(120deg, #7dd3fc 0%, color-mix(in srgb, var(--anzhiyu-main) 40%, #22c55e) 100%);
}

.profile-avatar {
  width: 5.25rem;
  height: 5.25rem;
  margin: -2.6rem auto 0.85rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-main);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.45s ease;
}

.profile-avatar.is-effect:hover img {
  transform: scale(1.1) rotate(-5deg);
  filter: saturate(1.15) brightness(1.05);
}

.profile-avatar.is-effect img {
  animation: avatarRotate 8s ease-in-out infinite;
}

@keyframes avatarRotate {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.05) rotate(2deg);
  }
  75% {
    transform: scale(1.05) rotate(-2deg);
  }
}

.profile-name {
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
}

.profile-description {
  margin-top: 0.45rem;
  text-align: center;
  font-size: 0.84rem;
  line-height: 1.7;
  color: var(--anzhiyu-secondtext);
}

.profile-status-image {
  display: flex;
  justify-content: center;
  margin-top: 0.8rem;
}

.profile-status-image img {
  max-width: 100%;
  width: 5rem;
  height: auto;
  object-fit: contain;
}

.profile-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.profile-skill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  color: var(--anzhiyu-main);
  font-size: 0.75rem;
  line-height: 1.2;
}

.profile-socials {
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 1rem;
}

.profile-social {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  color: var(--anzhiyu-main);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-social:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--anzhiyu-main) 30%, transparent);
}

/* Individual social link colors on hover */
.profile-social:nth-child(1):hover {
  background: linear-gradient(135deg, #07c160, #10b981);
}

.profile-social:nth-child(2):hover {
  background: linear-gradient(135deg, #1da1f2, #0d8bd9);
}

.profile-social:nth-child(3):hover {
  background: linear-gradient(135deg, #ea4c89, #c73e75);
}

.profile-social:nth-child(4):hover {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.profile-social:nth-child(5):hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
</style>
