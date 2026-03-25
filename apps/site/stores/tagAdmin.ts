import { defineStore } from 'pinia'
import type { Tag } from '@my-blog/database'

export interface TagWithCount extends Tag {
  usageCount: number
}

interface TagAdminState {
  tags: TagWithCount[]
  loading: boolean
  dialogOpen: boolean
  editingTag: Tag | null
  pagination: {
    total: number
    current: number
    pageSize: number
  }
}

export const useTagAdminStore = defineStore('tagAdmin', {
  state: (): TagAdminState => ({
    tags: [],
    loading: false,
    dialogOpen: false,
    editingTag: null,
    pagination: { total: 0, current: 1, pageSize: 20 },
  }),

  actions: {
    async fetchTags(params: { page?: number; search?: string } = {}) {
      this.loading = true
      try {
        // TODO: Replace with actual API call
        // const query = new URLSearchParams({
        //   limit: this.pagination.pageSize.toString(),
        //   offset: ((params.page || 1) - 1) * this.pagination.pageSize,
        // })
        // if (params.search) query.append('search', params.search)
        // const data = await $fetch(`/api/v1/tags?${query.toString()}`)
        // this.tags = data.items
        // this.pagination.total = data.total
        // this.pagination.current = params.page || 1
        console.log('Fetching tags...', params)
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        this.loading = false
      }
    },

    openCreateDialog() {
      this.editingTag = null
      this.dialogOpen = true
    },

    openEditDialog(tag: Tag) {
      this.editingTag = tag
      this.dialogOpen = true
    },

    closeDialog() {
      this.dialogOpen = false
      this.editingTag = null
    },

    async createTag(data: {
      name: string
      slug: string
      description?: string
      color: string
    }) {
      // TODO: Replace with actual API call
      // await $fetch('/api/v1/tags', { method: 'POST', body: data })
      await this.fetchTags()
    },

    async updateTag(id: string, data: {
      name: string
      slug: string
      description?: string
      color: string
    }) {
      // TODO: Replace with actual API call
      // await $fetch(`/api/v1/tags/${id}`, { method: 'PUT', body: data })
      await this.fetchTags()
    },

    async deleteTag(id: string) {
      // TODO: Replace with actual API call
      // await $fetch(`/api/v1/tags/${id}`, { method: 'DELETE' })
      await this.fetchTags()
    },
  },
})
