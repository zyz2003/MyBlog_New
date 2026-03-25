import type { Media } from '@my-blog/database'
import { useAuthStore } from '~/stores/auth'

export interface MediaListResponse {
  data: Media[]
  success: boolean
  message: string
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface UseMediaLibraryOptions {
  folderId?: string | null
  filterType?: string
  search?: string
  limit?: number
  offset?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface UploadProgress {
  filename: string
  progress: number
}

export function useMediaLibrary() {
  const authStore = useAuthStore()

  /**
   * Fetch media list with pagination and filters
   */
  const fetchMedia = async (options: UseMediaLibraryOptions = {}): Promise<MediaListResponse> => {
    const query = new URLSearchParams()

    if (options.folderId !== undefined && options.folderId !== null) {
      query.append('folder', options.folderId)
    }
    if (options.filterType) {
      query.append('mimeType', options.filterType)
    }
    if (options.search) {
      query.append('search', options.search)
    }
    if (options.limit) {
      query.append('limit', options.limit.toString())
    }
    if (options.offset !== undefined) {
      query.append('offset', options.offset.toString())
    }
    if (options.sort) {
      query.append('sort', options.sort)
    }
    if (options.order) {
      query.append('order', options.order)
    }

    return await $fetch(`/api/v1/media?${query.toString()}`, {
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      },
    })
  }

  /**
   * Upload a single file with progress tracking
   */
  const uploadSingleFile = async (
    file: File,
    folderId?: string,
    onProgress?: (filename: string, progress: number) => void
  ): Promise<Media> => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) {
      formData.append('folderId', folderId)
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100)
          onProgress(file.name, progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response.data)
          } catch {
            reject(new Error('Failed to parse response'))
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.message || 'Upload failed'))
          } catch {
            reject(new Error('Upload failed'))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.open('POST', '/api/v1/media')
      if (authStore.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
      }
      xhr.send(formData)
    })
  }

  /**
   * Upload multiple files with progress tracking
   */
  const uploadMedia = async (
    files: File[],
    folderId?: string,
    onProgress?: (filename: string, progress: number) => void
  ): Promise<Media[]> => {
    const results: Media[] = []
    const maxConcurrent = 5 // Limit concurrent uploads
    let completed = 0

    return new Promise((resolve) => {
      const processNext = async () => {
        if (completed >= files.length) {
          resolve(results)
          return
        }

        const index = completed
        completed++

        try {
          const result = await uploadSingleFile(files[index], folderId, onProgress)
          results.push(result)
        } catch (err) {
          // Continue with other uploads even if one fails
          console.error(`Failed to upload ${files[index].name}:`, err)
        }

        processNext()
      }

      // Start initial batch
      const initialBatch = Math.min(maxConcurrent, files.length)
      for (let i = 0; i < initialBatch; i++) {
        processNext()
      }
    })
  }

  /**
   * Delete a media item
   */
  const deleteMedia = async (id: string): Promise<void> => {
    return await $fetch(`/api/v1/media/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      },
    })
  }

  /**
   * Delete multiple media items (bulk delete)
   */
  const bulkDeleteMedia = async (ids: string[]): Promise<void> => {
    return await $fetch('/api/v1/media/bulk', {
      method: 'DELETE',
      body: { ids },
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Move multiple media items to a folder (bulk update)
   */
  const bulkMoveMedia = async (ids: string[], folderId: string | null): Promise<void> => {
    return await $fetch('/api/v1/media/bulk', {
      method: 'PUT',
      body: { ids, folderId },
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Fetch folder tree
   */
  const fetchFolders = async (): Promise<MediaFolder[]> => {
    return await $fetch('/api/v1/media/folders', {
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      },
    })
  }

  /**
   * Create a new folder
   */
  const createFolder = async (name: string, parentId?: string | null): Promise<MediaFolder> => {
    return await $fetch('/api/v1/media/folders', {
      method: 'POST',
      body: { name, parentId },
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Update a folder
   */
  const updateFolder = async (id: string, name: string): Promise<MediaFolder> => {
    return await $fetch(`/api/v1/media/folders/${id}`, {
      method: 'PUT',
      body: { name },
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Delete a folder
   */
  const deleteFolder = async (id: string): Promise<void> => {
    return await $fetch(`/api/v1/media/folders/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      },
    })
  }

  return {
    fetchMedia,
    uploadMedia,
    uploadSingleFile,
    deleteMedia,
    bulkDeleteMedia,
    bulkMoveMedia,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  }
}

// Folder type for the composable
interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  children?: MediaFolder[]
  mediaCount: number
}
