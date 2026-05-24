<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
  number: string
}

const props = withDefaults(defineProps<{
  content: string
  number?: boolean
  expand?: boolean
  simple?: boolean
  enableAnchor?: boolean
}>(), {
  number: true,
  expand: false,
  simple: false,
  enableAnchor: false,
})

const activeId = ref('')
const expanded = ref(props.expand)

watch(() => props.expand, (value) => {
  expanded.value = value
}, { immediate: true })

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_[\]()#+!>]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'section'
}

const headings = computed<TocItem[]>(() => {
  const items: TocItem[] = []
  const slugCounts = new Map<string, number>()
  const counters = [0, 0, 0, 0]
  const regex = /^(#{1,4})\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = regex.exec(props.content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const baseId = slugifyHeading(text)
    const duplicateCount = slugCounts.get(baseId) ?? 0
    slugCounts.set(baseId, duplicateCount + 1)
    const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`

    counters[level - 1] += 1
    for (let index = level; index < counters.length; index += 1) {
      counters[index] = 0
    }

    const serial = counters.slice(0, level).filter(Boolean).join('.')
    items.push({ id, text, level, number: serial })
  }

  return items
})

let observer: IntersectionObserver | null = null

function updateHash(id: string) {
  if (!props.enableAnchor || !import.meta.client || !id) {
    return
  }

  const url = new URL(window.location.href)
  url.hash = id
  window.history.replaceState({}, '', url.toString())
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          updateHash(entry.target.id)
        }
      }
    },
    { rootMargin: '-80px 0px -80% 0px' },
  )

  nextTick(() => {
    const article = document.querySelector('.article-content')
    if (!article || !observer) {
      return
    }

    article.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
      if (heading.id) {
        observer?.observe(heading)
      }
    })
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    v-if="headings.length"
    class="overflow-hidden rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)]"
    :class="simple ? 'shadow-none' : 'shadow-[var(--anzhiyu-shadow-border)]'"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      @click="expanded = !expanded"
    >
      <span class="text-sm font-semibold text-[var(--anzhiyu-fontcolor)]">文章目录</span>
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--anzhiyu-secondbg)] text-[var(--anzhiyu-secondtext)] transition-transform" :class="{ 'rotate-180': expanded }">
        <i class="anzhiyufont anzhiyu-icon-chevron-down text-xs" />
      </span>
    </button>

    <div v-show="expanded" class="border-t border-[var(--style-border-always)] px-4 py-3">
      <nav class="space-y-1">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          class="block rounded-xl px-3 py-2 text-sm text-[var(--anzhiyu-secondtext)] no-underline transition-colors hover:bg-[var(--anzhiyu-main)]/6 hover:text-[var(--anzhiyu-main)]"
          :class="[
            heading.level === 1 ? 'pl-0' : heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : 'pl-12',
            activeId === heading.id && 'bg-[var(--anzhiyu-main)]/8 font-medium text-[var(--anzhiyu-main)]',
          ]"
        >
          <span v-if="number" class="mr-2 text-xs text-[var(--anzhiyu-main)]">{{ heading.number }}</span>
          <span>{{ heading.text }}</span>
        </a>
      </nav>
    </div>
  </div>
</template>
