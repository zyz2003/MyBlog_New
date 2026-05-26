<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

interface FriendLink {
  name: string
  url: string
  avatar: string
  description: string
}

interface FriendGroup {
  name: string
  links: FriendLink[]
}

const { data: friendsData } = await useAsyncData(
  'friends-links',
  () => $fetch<{ code: number; data: { groups: FriendGroup[] } }>('/api/friends'),
)

const groups = computed(() => friendsData.value?.data?.groups ?? [])

useSeoMeta({
  title: '友情链接',
  ogTitle: '友情链接',
  description: '友情链接',
  ogDescription: '友情链接',
})
</script>

<template>
  <div class="links-page">
    <section class="page-hero">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--color-text, #0F172A)', fontFamily: 'var(--font-heading, system-ui)' }">
        友情链接
      </h1>
      <p class="mt-2" :style="{ color: 'var(--color-text-muted, #64748B)' }">
        互帮互助，共同进步
      </p>
    </section>

    <div v-if="groups.length">
      <section v-for="group in groups" :key="group.name" class="friend-group">
        <h2 class="group-title">{{ group.name }}</h2>
        <div class="friend-grid">
          <FriendLinkCard
            v-for="link in group.links"
            :key="link.url"
            :name="link.name"
            :url="link.url"
            :avatar="link.avatar"
            :description="link.description"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state" :style="{ color: 'var(--color-text-muted, #94A3B8)' }">
      暂无友链
    </div>
  </div>
</template>

<style scoped>
.links-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-hero {
  padding: 1.25rem 1.35rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
}

.friend-group {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.group-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  padding-left: 0.75rem;
  border-left: 3px solid var(--anzhiyu-main);
  margin: 0;
}

.friend-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

@media (max-width: 768px) {
  .friend-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 769px) and (max-width: 1180px) {
  .friend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>