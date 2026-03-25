import type { Tag } from '@my-blog/database'
import type { TagWithCount } from '~/stores/tagAdmin'

export interface FetchTagsResult {
  items: TagWithCount[]
  total: number
}

export interface UseTagAdminOptions {
  page?: number
  pageSize?: number
  search?: string
}

export function useTagAdmin() {
  /**
   * 获取标签列表
   */
  const fetchTags = async (options: UseTagAdminOptions = {}): Promise<FetchTagsResult> => {
    const query = new URLSearchParams({
      limit: (options.pageSize || 20).toString(),
      offset: ((options.page || 1) - 1) * (options.pageSize || 20),
    })
    if (options.search) query.append('search', options.search)

    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/tags?${query.toString()}`)
    console.log('Fetching tags with options:', options)
    return { items: [], total: 0 }
  }

  /**
   * 创建标签
   */
  const createTag = async (data: {
    name: string
    slug: string
    description?: string
    color: string
  }) => {
    // TODO: Replace with actual API call
    // return await $fetch('/api/v1/tags', {
    //   method: 'POST',
    //   body: data
    // })
    console.log('Creating tag:', data)
    return {} as Tag
  }

  /**
   * 更新标签
   */
  const updateTag = async (id: string, data: {
    name: string
    slug: string
    description?: string
    color: string
  }) => {
    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/tags/${id}`, {
    //   method: 'PUT',
    //   body: data
    // })
    console.log('Updating tag:', id, data)
    return {} as Tag
  }

  /**
   * 删除标签
   */
  const deleteTag = async (id: string) => {
    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/tags/${id}`, {
    //   method: 'DELETE'
    // })
    console.log('Deleting tag:', id)
    return { success: true }
  }

  /**
   * 获取标签云数据
   */
  const fetchTagCloud = async (limit = 50) => {
    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/tags/cloud?limit=${limit}`)
    console.log('Fetching tag cloud with limit:', limit)
    return [] as TagWithCount[]
  }

  /**
   * 检查别名唯一性
   */
  const checkSlug = async (slug: string, excludeId?: string) => {
    const query = new URLSearchParams({ slug })
    if (excludeId) query.append('excludeId', excludeId)

    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/tags/check-slug?${query.toString()}`)
    console.log('Checking slug:', slug)
    return { available: true }
  }

  return {
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    fetchTagCloud,
    checkSlug,
  }
}
