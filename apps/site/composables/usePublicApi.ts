/**
 * Public API composable for frontend data fetching
 * Wraps all public API calls used by blog pages
 * Uses $fetch (Nuxt built-in) for SSR + client compatibility
 */
export function usePublicApi() {
  /** Fetch published articles with pagination and filters */
  async function getArticles(params: {
    page?: number
    pageSize?: number
    categoryId?: number
    tagId?: number
    keyword?: string
  } = {}) {
    return $fetch('/api/articles', {
      params: { ...params, status: 'published' },
    })
  }

  /** Fetch single article by ID (public) */
  async function getArticle(id: number) {
    return $fetch(`/api/articles/${id}`)
  }

  /** Fetch category tree */
  async function getCategoryTree() {
    return $fetch('/api/categories/tree')
  }

  /** Fetch all tags */
  async function getTags() {
    return $fetch('/api/tags')
  }

  /** Fetch single article by slug (public) */
  async function getArticleBySlug(slug: string) {
    return $fetch(`/api/articles/by-slug/${slug}`)
  }

  return { getArticles, getArticle, getArticleBySlug, getCategoryTree, getTags }
}
