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
    <div class="profile-content-area">
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
  </div>
</template>

<style scoped>
.card-widget {
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  padding: 0;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
}

/* Animated gradient background matching AnZhiYu card-info */
.card-widget::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(-25deg, var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 60%, transparent), var(--anzhiyu-main), color-mix(in srgb, var(--anzhiyu-main) 60%, transparent));
  background-size: 400%;
  animation: gradient 15s ease infinite;
  z-index: 0;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.profile-widget {
  position: relative;
  z-index: 1;
}

.profile-cover {
  height: 5.2rem;
  margin: 0;
  background: transparent;
}

.profile-avatar {
  width: 5.25rem;
  height: 5.25rem;
  margin: -2.6rem auto 0.85rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-main);
  position: relative;
  z-index: 2;
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
  color: var(--anzhiyu-white);
  transition: opacity 0.3s ease;
}

.profile-description {
  position: absolute;
  top: 80px;
  left: 0;
  width: 100%;
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

/* Show description on hover */
.profile-widget:hover .profile-description {
  opacity: 1;
}

/* Hide name on hover to make room for description */
.profile-widget:hover .profile-name {
  opacity: 0;
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
  background: rgba(255, 255, 255, 0.15);
  color: var(--anzhiyu-white);
  font-size: 0.75rem;
  line-height: 1.2;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.2);
  color: var(--anzhiyu-white);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-social:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  color: var(--anzhiyu-white);
}

.profile-widget:hover .profile-description {
  opacity: 1;
}

/* Hover: hide avatar and status image, show description — matching AnZhiYu */
.profile-widget:hover .profile-avatar {
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.profile-widget:hover .profile-status-image {
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.profile-widget .profile-avatar {
  transition: all 0.3s ease;
}

.profile-widget .profile-status-image {
  transition: all 0.3s ease;
}

.profile-content-area {
  position: relative;
  z-index: 1;
  padding: 1rem 1.2rem 1.2rem;
  min-height: 320px;
}

@media (max-width: 768px) {
  .card-widget {
    display: none;
  }
}
</style>
