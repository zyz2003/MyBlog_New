<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
}>()

const activeId = ref('')

const headings = computed<TocItem[]>(() => {
  const items: TocItem[] = []
  const regex = /^(#{1,4})\s+(.+)$/gm
  let match
  while ((match = regex.exec(props.content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w一-鿿]+/g, '-')
      .replace(/^-|-$/g, '')
    items.push({ id, text, level })
  }
  return items
})

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -80% 0px' }
  )

  nextTick(() => {
    const article = document.querySelector('article.prose')
    if (article) {
      article.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
        if (heading.id) observer.observe(heading)
      })
    }
  })

  onUnmounted(() => observer.disconnect())
})

const tocStyle = computed(() => ({
  background: 'var(--color-surface, #fff)',
  border: '1px solid var(--color-border, #E2E8F0)',
  borderRadius: 'var(--radius-medium, 8px)',
}))

const headingStyle = computed(() => ({
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-heading, system-ui)',
}))

const linkStyle = computed(() => ({
  color: 'var(--color-text-muted, #64748B)',
  transition: 'color var(--transition-fast, 0.15s ease)',
}))

const activeLinkStyle = computed(() => ({
  color: 'var(--color-primary, #3B82F6)',
}))
</script>

<template>
  <div v-if="headings.length" class="p-4" :style="tocStyle">
    <h3 class="text-sm font-semibold mb-3" :style="headingStyle">目录</h3>
    <nav class="space-y-1">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        class="block text-sm"
        :style="activeId === heading.id ? { ...linkStyle, ...activeLinkStyle, fontWeight: '500' } : linkStyle"
        :class="[
          heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-4' : 'pl-8'
        ]"
      >
        {{ heading.text }}
      </a>
    </nav>
  </div>
</template>
