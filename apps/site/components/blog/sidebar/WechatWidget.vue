<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { wechat } = useSiteSettings()
</script>

<template>
  <div class="card-widget wechat-widget">
    <div class="card-header">
      <span class="card-title">微信</span>
    </div>

    <div class="flip-container">
      <div class="flipper">
        <!-- Front face -->
        <div class="front">
          <div class="wechat-icon-wrapper">
            <i class="anzhiyufont anzhiyu-icon-weixin" />
          </div>
          <p class="hint-text">点击查看详情</p>
        </div>

        <!-- Back face -->
        <div class="back">
          <div v-if="wechat.qrcode" class="qrcode-wrapper">
            <img :src="wechat.qrcode" alt="微信赞赏码" class="qrcode-image" />
          </div>
          <div v-else class="qrcode-placeholder">
            <i class="anzhiyufont anzhiyu-icon-image" />
          </div>
          <p v-if="wechat.description" class="qrcode-hint">{{ wechat.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-bottom: var(--style-border-always);
}

.card-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
  text-transform: uppercase;
}

/* 3D Flip Container */
.flip-container {
  perspective: 1000px;
  width: 100%;
  height: 200px;
  margin: 1rem auto;
  cursor: pointer;
}

.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-container:hover .flipper {
  transform: rotateY(180deg);
}

.front,
.back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  padding: 1.5rem;
}

/* Front Face */
.front {
  background: linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 10%, white), color-mix(in srgb, var(--anzhiyu-main) 5%, white));
  border: var(--style-border-always);
}

.wechat-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #07c160, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  box-shadow: 0 8px 24px rgba(7, 193, 96, 0.3);
  transition: transform 0.3s ease;
}

.flip-container:hover .wechat-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.hint-text {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--anzhiyu-secondtext);
  opacity: 0.8;
}

/* Back Face */
.back {
  background: linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-main) 8%, white), color-mix(in srgb, var(--anzhiyu-main) 4%, white));
  transform: rotateY(180deg);
  border: var(--style-border-always);
}

.qrcode-wrapper {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid var(--anzhiyu-card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: white;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qrcode-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, white);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--anzhiyu-main);
  font-size: 48px;
  border: 2px dashed var(--anzhiyu-main);
}

.qrcode-hint {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  text-align: center;
  line-height: 1.4;
}

/* Animation for initial load */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.wechat-icon-wrapper {
  animation: float 3s ease-in-out infinite;
}
</style>
