import { defineStore } from 'pinia'
import type { Category } from '@my-blog/database'

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
  depth: number
  articleCount: number
}

interface CategoryAdminState {
  categories: CategoryTreeNode[]
  loading: boolean
  dialogOpen: boolean
  editingCategory: Category | null
}

export const useCategoryAdminStore = defineStore('categoryAdmin', {
  state: (): CategoryAdminState => ({
    categories: [],
    loading: false,
    dialogOpen: false,
    editingCategory: null,
  }),

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        // TODO: Replace with actual API call
        // const data = await $fetch('/api/v1/categories?tree=true')
        // this.categories = data
        console.log('Fetching categories...')
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        this.loading = false
      }
    },

    openCreateDialog() {
      this.editingCategory = null
      this.dialogOpen = true
    },

    openEditDialog(category: Category) {
      this.editingCategory = category
      this.dialogOpen = true
    },

    closeDialog() {
      this.dialogOpen = false
      this.editingCategory = null
    },

    async createCategory(_data: {
      name: string
      slug: string
      parentId?: string | null
      description?: string
      color?: string
    }) {
      // TODO: Replace with actual API call
      // await $fetch('/api/v1/categories', { method: 'POST', body: data })
      await this.fetchCategories()
    },

    async updateCategory(_id: string, _data: {
      name: string
      slug: string
      parentId?: string | null
      description?: string
      color?: string
    }) {
      // TODO: Replace with actual API call
      // await $fetch(`/api/v1/categories/${id}`, { method: 'PUT', body: data })
      await this.fetchCategories()
    },

    async deleteCategory(_id: string) {
      // TODO: Replace with actual API call
      // await $fetch(`/api/v1/categories/${id}`, { method: 'DELETE' })
      await this.fetchCategories()
    },

    async reorderCategories(_fromId: string, _toId: string, _dropPosition: 'before' | 'after' | 'inside') {
      // TODO: Replace with actual API call
      // await $fetch('/api/v1/categories/reorder', {
      //   method: 'POST',
      //   body: { fromId, toId, dropPosition }
      // })
      await this.fetchCategories()
    },
  },
})
