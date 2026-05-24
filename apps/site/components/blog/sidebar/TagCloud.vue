<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core'

interface TagItem {
  id: number
  name: string
  slug: string
  color: string | null
  count: number
}

const { data } = await useFetch<{ code: number; data: TagItem[] }>('/api/tags')
const tags = computed(() => data.value?.data ?? [])

const isMounted = ref(false)
const containerRef = ref<HTMLElement>()
const { elementX, elementY, isOutside } = useMouseInElement(containerRef)

interface Tag3D extends TagItem {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
}

// Distribute tags on sphere using Fibonacci sphere algorithm
const radius = 100
const tags3D = computed<Tag3D[]>(() => {
  const n = tags.value.length
  if (n === 0) return []

  const goldenRatio = (1 + Math.sqrt(5)) / 2
  return tags.value.map((tag, i) => {
    const theta = Math.acos(1 - 2 * (i + 0.5) / n)
    const phi = 2 * Math.PI * i / goldenRatio
    return {
      ...tag,
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
      scale: 1,
      opacity: 1,
    }
  })
})

// Rotation based on mouse position, auto-rotate when mouse outside
let animationFrame: number
const rotation = ref({ x: 0, y: 0 })
const targetRotation = ref({ x: 0, y: 0 })

function animate() {
  if (isOutside.value) {
    targetRotation.value.y += 0.005 // auto-rotate
  } else {
    // Mouse-driven rotation
    const centerX = (containerRef.value?.clientWidth || 0) / 2
    const centerY = (containerRef.value?.clientHeight || 0) / 2
    const mouseX = elementX.value - centerX
    const mouseY = elementY.value - centerY
    targetRotation.value.y = mouseX * 0.0001
    targetRotation.value.x = -mouseY * 0.0001
  }

  // Smooth interpolation
  rotation.value.x += (targetRotation.value.x - rotation.value.x) * 0.05
  rotation.value.y += (targetRotation.value.y - rotation.value.y) * 0.05

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  isMounted.value = true
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

function transformStyle(tag: Tag3D) {
  const cosX = Math.cos(rotation.value.x)
  const sinX = Math.sin(rotation.value.x)
  const cosY = Math.cos(rotation.value.y)
  const sinY = Math.sin(rotation.value.y)

  // Rotate around Y axis
  const x1 = tag.x * cosY - tag.z * sinY
  const z1 = tag.z * cosY + tag.x * sinY

  // Rotate around X axis
  const y1 = tag.y * cosX - z1 * sinX
  const z2 = z1 * cosX + tag.y * sinX

  // Scale and opacity based on z-depth
  const scale = (z2 + radius * 2) / (radius * 3)
  const opacity = 0.3 + scale * 0.7

  return {
    transform: `translate(-50%, -50%) translate3d(${x1}px, ${y1}px, 0) scale(${scale})`,
    opacity,
    zIndex: Math.floor(z2 + radius * 2),
  }
}

// Tag cloud list mode (AnZhiYu style)
const tagListMode = ref(false)

function getTagColor(tag: TagItem) {
  return tag.color || 'var(--anzhiyu-main)'
}

function getTagBgColor(tag: TagItem) {
  const color = tag.color || 'var(--anzhiyu-main)'
  return `color-mix(in srgb, ${color} 10%, transparent)`
}
</script>

<template>
  <div class="card-widget card-tags">
    <div class="item-headline">
      <i class="anzhiyufont anzhiyu-icon-tags" />
      <span>标签</span>
      <button class="card-more-btn" title="切换显示模式" @click.stop="tagListMode = !tagListMode">
        <i :class="tagListMode ? 'anzhiyufont anzhiyu-icon-list' : 'anzhiyufont anzhiyu-icon-globe'" />
        <span class="btn-label">{{ tagListMode ? '列表' : '3D' }}</span>
      </button>
    </div>

    <div v-if="!tags.length" class="empty-state">暂无标签</div>

    <!-- 3D Tag Cloud Sphere — client-only to avoid hydration mismatch -->
    <ClientOnly>
      <div v-if="!tagListMode && tags.length && isMounted" ref="containerRef" class="card-tag-cloud tag-cloud-3d">
        <NuxtLink
          v-for="tag in tags3D"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="tag-item-3d"
          :style="{ ...transformStyle(tag), color: tag.color || undefined }"
        >
          {{ tag.name }}
          <sup>{{ tag.count }}</sup>
        </NuxtLink>
      </div>
      <div v-else-if="!tagListMode && tags.length && !isMounted" class="card-tag-cloud tag-cloud-3d tag-cloud-loading">
        <span class="loading-text">标签球体加载中...</span>
      </div>
    </ClientOnly>

    <!-- Flat Tag Cloud List (AnZhiYu style) -->
    <div v-if="tagListMode && tags.length" class="card-tag-cloud tag-cloud-list">
      <NuxtLink
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="tag-chip"
        :style="{ '--tag-color': getTagColor(tag), '--tag-bg': getTagBgColor(tag), fontSize: `${0.8 + Math.min(tag.count / 8, 0.6)}rem` }"
      >
        {{ tag.name }}
        <span class="tag-chip-count">{{ tag.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 12px;
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
}

.card-widget:hover {
  box-shadow: var(--anzhiyu-shadow-main);
  border: var(--style-border-hover);
}

.item-headline {
  padding-bottom: 0;
  margin-bottom: 0.6rem;
  margin-left: 8px;
  font-size: 1em;
  font-weight: bold;
  display: flex;
  align-items: center;

  > i {
    margin-right: 6px;
  }

  > span {
    margin-left: 6px;
  }
}

.card-more-btn {
  color: var(--anzhiyu-fontcolor);
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  cursor: pointer;
  padding: 2px 10px;
  border-radius: 8px;
  transition: 0.3s;
  font-size: 0.78rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;

  &:hover {
    color: var(--anzhiyu-main);
    border-color: var(--anzhiyu-main);
    background: color-mix(in srgb, var(--anzhiyu-main) 6%, transparent);
  }

  .btn-label {
    font-size: 0.72rem;
  }
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 0.75rem 0;
}

/* 3D Tag Cloud */
.tag-cloud-3d {
  position: relative;
  width: 100%;
  height: 220px;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.tag-cloud-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
}

.tag-item-3d {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  font-size: 13px;
  transition: background 0.3s, color 0.3s;
  will-change: transform, opacity;
  white-space: nowrap;

  &:hover {
    background: var(--anzhiyu-main);
    color: var(--anzhiyu-white);
  }
}

sup {
  opacity: 0.55;
  font-size: 10px;
  font-weight: normal;
}

/* Flat Tag Cloud List (AnZhiYu card-tag-cloud style) */
.tag-cloud-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--tag-bg);
  color: var(--tag-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.08);
    background: var(--tag-color);
    color: var(--anzhiyu-white);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--tag-color) 25%, transparent);
  }
}

.tag-chip-count {
  font-size: 0.75em;
  opacity: 0.7;
  font-weight: normal;
}
</style>
