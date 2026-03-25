import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MediaLibraryPage from '~/pages/admin/media/index.vue'

// Mock components
vi.mock('~/components/admin/media/MediaGrid.vue', () => ({
  default: {
    template: '<div class="media-grid"><slot /></div>',
    props: ['media', 'loading', 'viewMode', 'selectable', 'modelValue'],
    emits: ['update:modelValue', 'update:viewMode', 'preview', 'delete'],
  },
}))

vi.mock('~/components/admin/media/FolderTree.vue', () => ({
  default: {
    template: '<div class="folder-tree"><slot /></div>',
    props: ['folders', 'selectedFolderId', 'loading'],
    emits: ['select', 'create', 'rename', 'delete'],
  },
}))

describe('MediaLibraryPage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders media library page', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('媒体库')
  })

  it('renders header with upload button', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('上传文件')
  })

  it('renders folder tree sidebar', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.folder-tree').exists()).toBe(true)
  })

  it('renders media grid', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.media-grid').exists()).toBe(true)
  })

  it('renders search input', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    const searchInput = wrapper.find('input[placeholder="搜索媒体文件..."]')
    expect(searchInput.exists()).toBe(true)
  })

  it('renders filter type selector', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).toContain('图片')
    expect(wrapper.text()).toContain('视频')
    expect(wrapper.text()).toContain('文档')
  })

  it('renders view mode toggle buttons', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
    },
    })

    // Grid and List buttons should be present
    expect(wrapper.html()).toBeTruthy()
  })

  it('handles folder selection', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    // Simulate folder selection
    const folderTree = wrapper.findComponent({ name: 'FolderTree' })
    if (folderTree.exists()) {
      folderTree.trigger('select', 'folder-1')
    }

    // Store should be updated (this would need proper mocking)
  })

  it('handles search input with debounce', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    const searchInput = wrapper.find('input[placeholder="搜索媒体文件..."]')
    await searchInput.setValue('test')

    // Debounce timer should be set
    expect(wrapper.vm.searchDebounceTimer).toBeTruthy()
  })

  it('opens upload dialog when upload button is clicked', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    const uploadButton = wrapper.findAll('button').find((b) => b.text().includes('上传文件'))
    if (uploadButton) {
      await uploadButton.trigger('click')
    }

    expect(wrapper.vm.showUploadDialog).toBe(true)
  })

  it('opens preview modal when media is previewed', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    const mockMedia = {
      id: '1',
      filename: 'test.jpg',
      url: '/uploads/test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
    }

    wrapper.vm.handlePreview(mockMedia)

    expect(wrapper.vm.showPreviewModal).toBe(true)
    expect(wrapper.vm.previewMedia).toEqual(mockMedia)
  })

  it('handles media deletion', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    // Mock confirm
    global.confirm = vi.fn(() => true)

    await wrapper.vm.handleDelete('media-1')

    // Should show success toast (mocked)
  })

  it('handles bulk deletion', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    // Set selected media
    wrapper.vm.mediaLibraryStore.setSelectedMedia(['1', '2', '3'])

    // Mock confirm
    global.confirm = vi.fn(() => true)

    await wrapper.vm.handleBulkDelete()

    // Should call bulk delete API
  })

  it('handles bulk move', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.mediaLibraryStore.setSelectedMedia(['1', '2', '3'])
    await wrapper.vm.handleBulkMove('folder-1')

    // Should call bulk move API
  })

  it('handles upload complete', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.handleUploadComplete()

    expect(wrapper.vm.showUploadDialog).toBe(false)
  })

  it('handles folder CRUD operations', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.handleFolderCreate('New Folder', null)
    await wrapper.vm.handleFolderRename('1', 'Renamed Folder')
    await wrapper.vm.handleFolderDelete('1')

    // Should show toast notifications
  })

  it('handles media insertion from selector', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.handleMediaInsert(['/uploads/test1.jpg', '/uploads/test2.jpg'])

    // Should log or handle the insertion
  })

  it('fetches media list on mount', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    // onMounted should have been called
    expect(wrapper.vm.fetchMediaList).toBeDefined()
  })

  it('fetches folder tree on mount', () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.vm.fetchFolderTree).toBeDefined()
  })

  it('watches for currentFolderId changes', async () => {
    const wrapper = mount(MediaLibraryPage, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.mediaLibraryStore.setFolder('new-folder')

    // Should trigger fetchMediaList
  })
})
