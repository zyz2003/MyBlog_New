<script setup lang="ts">
import { useTableOfContents } from '@/composables/frontend/useTableOfContents'
import type { Heading } from '@/composables/frontend/useTableOfContents'

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

const emit = defineEmits<{
  (e: 'headings-loaded', headings: Heading[]): void
}>()

const contentRef = computed(() => props.content)
const { headings, activeId, scrollToHeading, observe, disconnect } = useTableOfContents(contentRef)

const expanded = ref(props.expand)

watch(() => props.expand, (value) => {
  expanded.value = value
}, { immediate: true })

function updateHash(id: string) {
  if (!props.enableAnchor || !import.meta.client || !id) {
    return
  }

  const url = new URL(window.location.href)
  url.hash = id
  window.history.replaceState({}, '', url.toString())
}

watch(activeId, (id) => {
  updateHash(id)
})

function handleHeadingClick(id: string) {
  scrollToHeading(id)
  updateHash(id)
}

let mutationObserver: MutationObserver | null = null

function startMutationObserver(container: HTMLElement): void {
  stopMutationObserver()

  mutationObserver = new MutationObserver(() => {
    disconnect()
    nextTick(() => {
      observe(container)
    })
  })

  mutationObserver.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
}

function stopMutationObserver(): void {
  mutationObserver?.disconnect()
  mutationObserver = null
}

function initObservers(): void {
  if (!import.meta.client) {
    return
  }

  nextTick(() => {
    const article = document.querySelector('.article-content') as HTMLElement | null
    if (!article) {
      return
    }

    if (expanded.value) {
      observe(article)
      startMutationObserver(article)
    }

    emit('headings-loaded', headings.value)
  })
}

function handleToggle(): void {
  expanded.value = !expanded.value

  if (!import.meta.client) {
    return
  }

  const article = document.querySelector('.article-content') as HTMLElement | null
  if (!article) {
    return
  }

  if (expanded.value) {
    observe(article)
    startMutationObserver(article)
  }
  else {
    disconnect()
    stopMutationObserver()
  }
}

onMounted(() => {
  initObservers()
})

onBeforeUnmount(() => {
  disconnect()
  stopMutationObserver()
})

// Generate section numbers for headings
const numberedHeadings = computed(() => {
  const counters = [0, 0, 0, 0]
  return headings.value.map((heading) => {
    counters[heading.level - 1] += 1
    for (let index = heading.level; index < counters.length; index += 1) {
      counters[index] = 0
    }

    const serial = counters.slice(0, heading.level).filter(Boolean).join('.')
    return { ...heading, number: serial }
  })
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
      @click="handleToggle"
    >
      <span class="text-sm font-semibold text-[var(--anzhiyu-fontcolor)]">文章目录</span>
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--anzhiyu-secondbg)] text-[var(--anzhiyu-secondtext)] transition-transform" :class="{ 'rotate-180': expanded }">
        <i class="anzhiyufont anzhiyu-icon-chevron-down text-xs" />
      </span>
    </button>

    <div v-show="expanded" class="border-t border-[var(--style-border-always)] px-4 py-3">
      <nav class="space-y-1">
        <a
          v-for="heading in numberedHeadings"
          :key="heading.id"
          href="javascript:void(0)"
          class="block rounded-xl px-3 py-2 text-sm text-[var(--anzhiyu-secondtext)] no-underline transition-colors hover:bg-[var(--anzhiyu-main)]/6 hover:text-[var(--anzhiyu-main)]"
          :class="[
            heading.level === 1 ? 'pl-0' : heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : 'pl-12',
            activeId === heading.id && 'bg-[var(--anzhiyu-main)]/8 font-medium text-[var(--anzhiyu-main)]',
          ]"
          @click.prevent="handleHeadingClick(heading.id)"
        >
          <span v-if="number" class="mr-2 text-xs text-[var(--anzhiyu-main)]">{{ heading.number }}</span>
          <span>{{ heading.text }}</span>
        </a>
      </nav>
    </div>
  </div>
</template>
