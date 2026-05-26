export function useSiteStats() {
  const articleCount = useState<number>('stats-article-count', () => 0)
  const categoryCount = useState<number>('stats-category-count', () => 0)
  const tagCount = useState<number>('stats-tag-count', () => 0)
  const pending = useState<boolean>('stats-pending', () => true)

  async function fetchStats() {
    pending.value = true
    try {
      const [articles, categories, tags] = await Promise.all([
        $fetch<{ code: number; data: { total: number } }>('/api/articles?pageSize=1'),
        $fetch<{ code: number; data: Array<unknown> }>('/api/categories'),
        $fetch<{ code: number; data: Array<unknown> }>('/api/tags'),
      ])
      articleCount.value = articles.data?.total ?? 0
      categoryCount.value = Array.isArray(categories.data) ? categories.data.length : 0
      tagCount.value = Array.isArray(tags.data) ? tags.data.length : 0
    }
    finally {
      pending.value = false
    }
  }

  if (import.meta.server) {
    fetchStats()
  }
  else {
    onMounted(fetchStats)
  }

  return { articleCount, categoryCount, tagCount, pending }
}