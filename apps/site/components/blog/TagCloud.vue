<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core'

interface TagItem {
  id: number
  name: string
  slug: string
  count: number
}

const { data } = await useFetch<{ code: number; data: TagItem[] }>('/api/tags')
const tags = computed(() => data.value?.data ?? [])

const containerRef = ref<HTMLElement>()
const { elementX, elementY, isOutside } = useMouseInElement(containerRef)

// Distribute tags on sphere using Fibonacci sphere algorithm
const radius = 100
const tags3D = computed(() => {
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
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

function transformStyle(tag: ReturnType<typeof tags3D.value>[number]) {
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
    transform: `translate3d(${x1}px, ${y1}px, 0) scale(${scale})`,
    opacity,
    zIndex: Math.floor(z2 + radius * 2),
  }
}
</script>

<template>
  <div class="card-title">标签</div>
  <div v-if="!tags.length" class="empty-state">暂无标签</div>
  <div v-else ref="containerRef" class="tag-cloud-3d">
    <NuxtLink
      v-for="tag in tags3D"
      :key="tag.id"
      :to="`/tags/${tag.slug}`"
      class="tag-item-3d"
      :style="transformStyle(tag)"
    >
      {{ tag.name }}
      <sup>{{ tag.count || 0 }}</sup>
    </NuxtLink>
  </div>
</template>

<style scoped>
.card-title {
  margin-bottom: 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 0.75rem 0;
}

.tag-cloud-3d {
  position: relative;
  width: 100%;
  height: 200px;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.tag-item-3d {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  font-size: 13px;
  transition: background 0.3s, color 0.3s;
  will-change: transform, opacity;
  white-space: nowrap;
}

.tag-item-3d:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

sup {
  opacity: 0.6;
  font-size: 10px;
}
</style>
