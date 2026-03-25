import type { Category } from '@my-blog/database'
import type { CategoryTreeNode } from '~/stores/categoryAdmin'

export interface UseCategoryAdminOptions {
  tree?: boolean
}

export function useCategoryAdmin() {
  /**
   * 获取分类列表
   */
  const fetchCategories = async (options: UseCategoryAdminOptions = {}) => {
    const query = new URLSearchParams()
    if (options.tree) query.append('tree', 'true')

    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/categories?${query.toString()}`)
    console.log('Fetching categories with options:', options)
    return [] as CategoryTreeNode[]
  }

  /**
   * 创建分类
   */
  const createCategory = async (data: {
    name: string
    slug: string
    parentId?: string | null
    description?: string
    color?: string
  }) => {
    // TODO: Replace with actual API call
    // return await $fetch('/api/v1/categories', {
    //   method: 'POST',
    //   body: data
    // })
    console.log('Creating category:', data)
    return {} as Category
  }

  /**
   * 更新分类
   */
  const updateCategory = async (id: string, data: {
    name: string
    slug: string
    parentId?: string | null
    description?: string
    color?: string
  }) => {
    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/categories/${id}`, {
    //   method: 'PUT',
    //   body: data
    // })
    console.log('Updating category:', id, data)
    return {} as Category
  }

  /**
   * 删除分类
   */
  const deleteCategory = async (id: string) => {
    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/categories/${id}`, {
    //   method: 'DELETE'
    // })
    console.log('Deleting category:', id)
    return { success: true }
  }

  /**
   * 重新排序分类
   */
  const reorderCategories = async (
    fromId: string,
    toId: string,
    dropPosition: 'before' | 'after' | 'inside'
  ) => {
    // TODO: Replace with actual API call
    // return await $fetch('/api/v1/categories/reorder', {
    //   method: 'POST',
    //   body: { fromId, toId, dropPosition }
    // })
    console.log('Reordering categories:', { fromId, toId, dropPosition })
    return { success: true }
  }

  /**
   * 检查别名唯一性
   */
  const checkSlug = async (slug: string, excludeId?: string) => {
    const query = new URLSearchParams({ slug })
    if (excludeId) query.append('excludeId', excludeId)

    // TODO: Replace with actual API call
    // return await $fetch(`/api/v1/categories/check-slug?${query.toString()}`)
    console.log('Checking slug:', slug)
    return { available: true }
  }

  return {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    checkSlug,
  }
}
