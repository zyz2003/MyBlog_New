import { defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export interface MediaLibraryState {
  currentFolderId: string | null
  viewMode: 'grid' | 'list'
  searchQuery: string
  filterType: 'all' | 'image' | 'video' | 'document'
  selectedMedia: string[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const persistedState = piniaPluginPersistedstate

export const useMediaLibraryStore = defineStore('mediaLibrary', {
  state: (): MediaLibraryState => ({
    currentFolderId: null,
    viewMode: 'grid',
    searchQuery: '',
    filterType: 'all',
    selectedMedia: [],
    pagination: { limit: 20, offset: 0, total: 0 },
  }),

  getters: {
    // Get current filter options
    filterOptions: (state) => ({
      folderId: state.currentFolderId,
      filterType: state.filterType,
      search: state.searchQuery,
      limit: state.pagination.limit,
      offset: state.pagination.offset,
    }),

    // Check if any media is selected
    hasSelection: (state) => state.selectedMedia.length > 0,

    // Get selection count
    selectionCount: (state) => state.selectedMedia.length,

    // Check if all media is selected
    isAllSelected: (state) => (mediaCount: number) => {
      return state.selectedMedia.length === mediaCount
    },
  },

  actions: {
    // Set current folder
    setFolder(id: string | null) {
      this.currentFolderId = id
      this.pagination.offset = 0
    },

    // Set view mode
    setViewMode(mode: 'grid' | 'list') {
      this.viewMode = mode
    },

    // Set search query
    setSearchQuery(query: string) {
      this.searchQuery = query
      this.pagination.offset = 0
    },

    // Set filter type
    setFilterType(type: 'all' | 'image' | 'video' | 'document') {
      this.filterType = type
      this.pagination.offset = 0
    },

    // Set selected media
    setSelectedMedia(ids: string[]) {
      this.selectedMedia = ids
    },

    // Toggle media selection
    toggleMediaSelection(id: string) {
      const index = this.selectedMedia.indexOf(id)
      if (index > -1) {
        this.selectedMedia.splice(index, 1)
      } else {
        this.selectedMedia.push(id)
      }
    },

    // Select all media
    selectAllMedia(ids: string[]) {
      this.selectedMedia = [...ids]
    },

    // Clear selection
    clearSelection() {
      this.selectedMedia = []
    },

    // Set pagination
    setPagination(pagination: Partial<typeof this.pagination>) {
      Object.assign(this.pagination, pagination)
    },

    // Reset to initial state
    reset() {
      this.currentFolderId = null
      this.viewMode: 'grid'
      this.searchQuery = ''
      this.filterType = 'all'
      this.selectedMedia = []
      this.pagination = { limit: 20, offset: 0, total: 0 }
    },

    // Clear search and filters
    clearFilters() {
      this.searchQuery = ''
      this.filterType = 'all'
      this.pagination.offset = 0
    },
  },

  persist: {
    storage: persistedState.localStorage,
    paths: ['viewMode', 'filterType'],
  },
})
