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
</script>

<template>
  <div v-if="headings.length" class="rounded-lg border border-gray-200 bg-white p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">目录</h3>
    <nav class="space-y-1">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        class="block text-sm transition-colors hover:text-blue-600"
        :class="[
          activeId === heading.id ? 'text-blue-600 font-medium' : 'text-gray-500',
          heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-4' : 'pl-8'
        ]"
      >
        {{ heading.text }}
      </a>
    </nav>
  </div>
</template>
