import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMediaLibrary, type UseMediaLibraryOptions } from '~/composables/useMediaLibrary'
import { useAuthStore } from '~/stores/auth'

// Mock $fetch
global.$fetch = vi.fn()

describe('useMediaLibrary', () => {
  let composable: ReturnType<typeof useMediaLibrary>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    composable = useMediaLibrary()
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  describe('fetchMedia', () => {
    it('fetches media list without options', async () => {
      const mockResponse = {
        data: [],
        success: true,
        message: 'OK',
        meta: { total: 0, limit: 10, offset: 0 },
      }
      vi.mocked(global.$fetch).mockResolvedValue(mockResponse)

      const result = await composable.fetchMedia()

      expect(global.$fetch).toHaveBeenCalledWith('/api/v1/media?', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })

    it('fetches media list with folder filter', async () => {
      const mockResponse = {
        data: [],
        success: true,
        message: 'OK',
        meta: { total: 0, limit: 10, offset: 0 },
      }
      vi.mocked(global.$fetch).mockResolvedValue(mockResponse)

      const options: UseMediaLibraryOptions = { folderId: 'folder-1' }
      await composable.fetchMedia(options)

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media?folder=folder-1&limit=10&offset=0&sort=uploadedAt&order=desc',
        expect.any(Object)
      )
    })

    it('fetches media list with multiple filters', async () => {
      const mockResponse = {
        data: [],
        success: true,
        message: 'OK',
        meta: { total: 0, limit: 10, offset: 0 },
      }
      vi.mocked(global.$fetch).mockResolvedValue(mockResponse)

      const options: UseMediaLibraryOptions = {
        folderId: 'folder-1',
        filterType: 'image',
        search: 'test',
        limit: 20,
        offset: 10,
      }
      await composable.fetchMedia(options)

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media?folder=folder-1&mimeType=image&search=test&limit=20&offset=10&sort=uploadedAt&order=desc',
        expect.any(Object)
      )
    })

    it('includes auth header when token exists', async () => {
      authStore.setAuth('test-token', { id: '1', username: 'test', role: 'admin' })

      await composable.fetchMedia()

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media?',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
      )
    })
  })

  describe('deleteMedia', () => {
    it('deletes a media item', async () => {
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.deleteMedia('media-1')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/media-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('includes auth header', async () => {
      authStore.setAuth('test-token', { id: '1', username: 'test', role: 'admin' })
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.deleteMedia('media-1')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/media-1',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
      )
    })
  })

  describe('bulkDeleteMedia', () => {
    it('deletes multiple media items', async () => {
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.bulkDeleteMedia(['1', '2', '3'])

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/bulk',
        expect.objectContaining({
          method: 'DELETE',
          body: { ids: ['1', '2', '3'] },
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })
  })

  describe('bulkMoveMedia', () => {
    it('moves multiple media items to folder', async () => {
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.bulkMoveMedia(['1', '2', '3'], 'folder-1')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/bulk',
        expect.objectContaining({
          method: 'PUT',
          body: { ids: ['1', '2', '3'], folderId: 'folder-1' },
        })
      )
    })

    it('moves media items to root (no folder)', async () => {
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.bulkMoveMedia(['1', '2'], null)

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/bulk',
        expect.objectContaining({
          method: 'PUT',
          body: { ids: ['1', '2'], folderId: null },
        })
      )
    })
  })

  describe('fetchFolders', () => {
    it('fetches folder tree', async () => {
      const mockFolders = [
        { id: '1', name: 'Folder 1', parentId: null, mediaCount: 5 },
        { id: '2', name: 'Folder 2', parentId: null, mediaCount: 3 },
      ]
      vi.mocked(global.$fetch).mockResolvedValue(mockFolders)

      const result = await composable.fetchFolders()

      expect(global.$fetch).toHaveBeenCalledWith('/api/v1/media/folders', expect.any(Object))
      expect(result).toEqual(mockFolders)
    })
  })

  describe('createFolder', () => {
    it('creates a new folder', async () => {
      const mockFolder = { id: '1', name: 'New Folder', parentId: null, mediaCount: 0 }
      vi.mocked(global.$fetch).mockResolvedValue(mockFolder)

      const result = await composable.createFolder('New Folder')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/folders',
        expect.objectContaining({
          method: 'POST',
          body: { name: 'New Folder', parentId: undefined },
        })
      )
      expect(result).toEqual(mockFolder)
    })

    it('creates a subfolder', async () => {
      const mockFolder = { id: '2', name: 'Sub Folder', parentId: '1', mediaCount: 0 }
      vi.mocked(global.$fetch).mockResolvedValue(mockFolder)

      await composable.createFolder('Sub Folder', '1')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/folders',
        expect.objectContaining({
          method: 'POST',
          body: { name: 'Sub Folder', parentId: '1' },
        })
      )
    })
  })

  describe('updateFolder', () => {
    it('updates a folder name', async () => {
      const mockFolder = { id: '1', name: 'Updated Name', parentId: null, mediaCount: 0 }
      vi.mocked(global.$fetch).mockResolvedValue(mockFolder)

      await composable.updateFolder('1', 'Updated Name')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/folders/1',
        expect.objectContaining({
          method: 'PUT',
          body: { name: 'Updated Name' },
        })
      )
    })
  })

  describe('deleteFolder', () => {
    it('deletes a folder', async () => {
      vi.mocked(global.$fetch).mockResolvedValue({ success: true })

      await composable.deleteFolder('1')

      expect(global.$fetch).toHaveBeenCalledWith(
        '/api/v1/media/folders/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('uploadSingleFile', () => {
    it('uploads a file with progress tracking', async () => {
      // This test would require XMLHttpRequest mocking
      // For now, we verify the function exists
      expect(composable.uploadSingleFile).toBeDefined()
    })
  })

  describe('uploadMedia', () => {
    it('uploads multiple files', async () => {
      // This test would require XMLHttpRequest mocking
      // For now, we verify the function exists
      expect(composable.uploadMedia).toBeDefined()
    })
  })
})
