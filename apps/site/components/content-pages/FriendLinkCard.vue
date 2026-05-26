<script setup lang="ts">
defineProps<{
  name: string
  url: string
  avatar: string
  description: string
}>()
</script>

<template>
  <a :href="url" target="_blank" rel="noopener noreferrer" class="flip-card">
    <div class="flip-card-inner">
      <div class="flip-card-front">
        <img v-if="avatar" :src="avatar" :alt="name" class="card-avatar" />
        <div v-else class="card-avatar avatar-placeholder">{{ name.charAt(0) }}</div>
        <span class="card-name">{{ name }}</span>
      </div>
      <div class="flip-card-back">
        <span class="card-desc">{{ description }}</span>
      </div>
    </div>
  </a>
</template>

<style>
/* Raw <style> block for 3D CSS — UnoCSS doesn't cover these */
.flip-card {
  perspective: 1000px;
  display: block;
  width: 100%;
  height: 140px;
  cursor: pointer;
  text-decoration: none;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  overflow: hidden;
}

.flip-card-front {
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
}

.flip-card-back {
  background: var(--anzhiyu-main);
  color: white;
  transform: rotateY(180deg);
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--style-border-always);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--anzhiyu-main) 15%, transparent);
  color: var(--anzhiyu-main);
  font-size: 1.2rem;
  font-weight: 700;
}

.card-name {
  color: var(--anzhiyu-fontcolor);
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
}

.card-desc {
  font-size: 0.78rem;
  line-height: 1.5;
  padding: 8px;
}
</style>