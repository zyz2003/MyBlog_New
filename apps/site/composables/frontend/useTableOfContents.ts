import type { Ref } from 'vue'

export interface Heading {
  id: string
  text: string
  level: number
}

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

export function useTableOfContents(content: Ref<string>) {
  const activeId = ref('')
  let observer: IntersectionObserver | null = null

  const headings = computed<Heading[]>(() => {
    const items: Heading[] = []
    const slugCounts = new Map<string, number>()
    const regex = /^(#{1,4})\s+(.+)$/gm
    let match: RegExpExecArray | null

    while ((match = regex.exec(content.value)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const baseId = slugifyHeading(text)
      const duplicateCount = slugCounts.get(baseId) ?? 0
      slugCounts.set(baseId, duplicateCount + 1)
      const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`

      items.push({ id, text, level })
    }

    return items
  })

  function observe(container: HTMLElement): void {
    disconnect()

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    )

    container.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
      if (heading.id) {
        observer?.observe(heading)
      }
    })
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = null
  }

  function scrollToHeading(id: string): void {
    if (!import.meta.client || !id) {
      return
    }

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeId.value = id
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    headings,
    activeId,
    scrollToHeading,
    observe,
    disconnect,
  }
}