import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FolderTree from '~/components/admin/media/FolderTree.vue'

const mockFolders = [
  {
    id: '1',
    name: '图片',
    parentId: null,
    mediaCount: 5,
    children: [
      {
        id: '1-1',
        name: '风景',
        parentId: '1',
        mediaCount: 3,
        children: [],
      },
      {
        id: '1-2',
        name: '人物',
        parentId: '1',
        mediaCount: 2,
        children: [],
      },
    ],
  },
  {
    id: '2',
    name: '文档',
    parentId: null,
    mediaCount: 10,
    children: [],
  },
  {
    id: '3',
    name: '视频',
    parentId: null,
    mediaCount: 0,
    children: [],
  },
]

describe('FolderTree', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders folder tree correctly', () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    expect(wrapper.text()).toContain('所有媒体')
    expect(wrapper.text()).toContain('图片')
    expect(wrapper.text()).toContain('文档')
    expect(wrapper.text()).toContain('视频')
  })

  it('displays media count badges', () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('10')
  })

  it('emits select event when folder is clicked', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Find and click the folder item
    const folderItems = wrapper.findAll('.folder-tree-item')
    await folderItems[0].find('div[role="button"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('emits select event with null when "All Media" is clicked', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Click "All Media" (first item)
    const allMediaItem = wrapper.findAll('div')[0]
    await allMediaItem.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe(null)
  })

  it('toggles folder expansion', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Find expand button (ChevronRight)
    const expandButton = wrapper.find('button:has(.lucide-chevron-right)')
    await expandButton.trigger('click')

    // Folder should be expanded (ChevronDown should appear)
    expect(wrapper.find('button:has(.lucide-chevron-down)').exists()).toBe(true)
  })

  it('shows nested children when expanded', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Initially children should not be visible
    expect(wrapper.text()).not.toContain('风景')

    // Expand the "图片" folder
    const expandButton = wrapper.find('button:has(.lucide-chevron-right)')
    await expandButton.trigger('click')

    // Children should now be visible
    expect(wrapper.text()).toContain('风景')
    expect(wrapper.text()).toContain('人物')
  })

  it('opens create dialog when "新建子文件夹" is clicked', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Open context menu and click "新建子文件夹"
    // Note: In actual implementation, this would require more complex mocking
    wrapper.vm.openCreateDialog('1')

    expect(wrapper.vm.isCreateDialogOpen).toBe(true)
  })

  it('opens rename dialog when "重命名" is clicked', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.openRenameDialog(mockFolders[0])

    expect(wrapper.vm.isRenameDialogOpen).toBe(true)
    expect(wrapper.vm.renameFolderName).toBe('图片')
  })

  it('opens delete dialog when "删除" is clicked', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.openDeleteDialog(mockFolders[0])

    expect(wrapper.vm.isDeleteDialogOpen).toBe(true)
    expect(wrapper.vm.targetFolder).toEqual(mockFolders[0])
  })

  it('emits create event when new folder is created', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.newFolderName = '新文件夹'
    wrapper.vm.contextMenuTarget = {
      folder: { id: 'new', name: '', parentId: '1' } as unknown,
      parentId: '1',
    }
    wrapper.vm.handleCreate()

    expect(wrapper.emitted('create')).toBeTruthy()
    expect(wrapper.emitted('create')?.[0]?.[0]).toBe('新文件夹')
    expect(wrapper.emitted('create')?.[0]?.[1]).toBe('1')
  })

  it('emits rename event when folder is renamed', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.targetFolder = mockFolders[0]
    wrapper.vm.renameFolderName = '新名称'
    wrapper.vm.handleRename()

    expect(wrapper.emitted('rename')).toBeTruthy()
    expect(wrapper.emitted('rename')?.[0]?.[0]).toBe('1')
    expect(wrapper.emitted('rename')?.[0]?.[1]).toBe('新名称')
  })

  it('emits delete event when folder is deleted', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.targetFolder = mockFolders[0]
    wrapper.vm.handleDelete()

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]?.[0]).toBe('1')
  })

  it('calculates total media count for "All Media"', () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    // Total should be 5 + 3 + 2 + 10 + 0 = 20
    expect(wrapper.vm.totalMediaCount).toBe(20)
  })

  it('highlights selected folder', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
        selectedFolderId: '1',
      },
    })

    // The selected folder should have the bg-primary class
    expect(wrapper.html()).toContain('bg-primary')
  })

  it('shows loading state', () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
        loading: true,
      },
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('shows warning when deleting folder with media', async () => {
    const wrapper = mount(FolderTree, {
      global: {
        plugins: [pinia],
      },
      props: {
        folders: mockFolders,
      },
    })

    wrapper.vm.targetFolder = mockFolders[0]
    wrapper.vm.isDeleteDialogOpen = true

    // Wait for dialog to render
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain('警告')
    expect(wrapper.html()).toContain('5 个媒体文件')
  })
})
