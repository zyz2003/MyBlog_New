<script setup lang="ts">
const { greetingBox } = useSiteSettings()
const route = useRoute()

const visible = ref(true)

const greetingText = computed(() => {
  if (!greetingBox.value.enable) {
    return ''
  }

  const hour = new Date().getHours()
  const match = greetingBox.value.list.find(item => hour >= item.startTime && hour <= item.endTime)
  return match?.greeting || greetingBox.value.default
})

watch(() => route.fullPath, () => {
  visible.value = true
})
</script>

<template>
  <transition name="greeting-fade">
    <div
      v-if="greetingBox.enable && greetingText && route.path === '/' && visible"
      id="greetingBox"
      class="greeting-box"
    >
      <button type="button" class="greeting-close" aria-label="关闭欢迎语" @click="visible = false">
        <span class="i-heroicons-x-mark h-4 w-4" />
      </button>
      <div class="greeting-label">Greeting</div>
      <p class="greeting-text">{{ greetingText }}</p>
    </div>
  </transition>
</template>

<style scoped>
.greeting-box {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 55;
  width: min(320px, calc(100vw - 2rem));
  padding: 1rem 1rem 0.95rem;
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 18%, transparent);
  border-radius: 22px;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 92%, white 8%);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(16px);
}

.greeting-close {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-fontcolor);
  cursor: pointer;
}

.greeting-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--anzhiyu-main);
}

.greeting-text {
  margin: 0.55rem 0 0;
  padding-right: 1.8rem;
  color: var(--anzhiyu-fontcolor);
  line-height: 1.7;
}

.greeting-fade-enter-active,
.greeting-fade-leave-active {
  transition: all 0.22s ease;
}

.greeting-fade-enter-from,
.greeting-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
