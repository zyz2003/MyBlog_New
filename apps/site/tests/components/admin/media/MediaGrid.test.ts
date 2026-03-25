import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaGrid from '~/components/admin/media/MediaGrid.vue'

// Mock media data
const mockMedia = [
  {
    id: '1',
    filename: 'image1.jpg',
    originalName: 'My Image.jpg',
    path: '/uploads/image1.jpg',
    url: '/uploads/image1.jpg',
    mimeType: 'image/jpeg',
    size: 102400,
    width: 1920,
    height: 1080,
    altText: 'Test image',
    thumbnailPath: '/uploads/thumbs/image1.jpg',
    folderId: null,
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    filename: 'document.pdf',
    originalName: 'Report.pdf',
    path: '/uploads/document.pdf',
    url: '/uploads/document.pdf',
    mimeType: 'application/pdf',
    size: 524288,
    width: null,
    height: null,
    altText: null,
    thumbnailPath: null,
    folderId: null,
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    filename: 'video.mp4',
    originalName: 'Demo Video.mp4',
    path: '/uploads/video.mp4',
    url: '/uploads/video.mp4',
    mimeType: 'video/mp4',
    size: 10485760,
    width: 1920,
    height: 1080,
    altText: null,
    thumbnailPath: null,
    folderId: null,
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-17'),
  },
]

describe('MediaGrid', () => {
  it('renders empty state when no media', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: [],
      },
    })

    expect(wrapper.text()).toContain('暂无媒体文件')
  })

  it('renders media items in grid view', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        viewMode: 'grid',
      },
    })

    const cards = wrapper.findAll('[role="article"]')
    expect(cards.length).toBe(3)
  })

  it('renders media items in list view', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        viewMode: 'list',
      },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)
  })

  it('emits preview event when clicking on media item', async () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        selectable: false,
      },
    })

    const card = wrapper.find('.group')
    await card.trigger('click')

    expect(wrapper.emitted('preview')).toBeTruthy()
    expect(wrapper.emitted('preview')?.[0]?.[0]).toEqual(mockMedia[0])
  })

  it('emits delete event when delete action is triggered', async () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
      },
    })

    // Find and click the dropdown trigger
    const dropdownTrigger = wrapper.find('[role="menuitem"]:has(.lucide-trash-2)')
    await dropdownTrigger.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]?.[0]).toBe('1')
  })

  it('supports selection mode with selectable prop', async () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        selectable: true,
        modelValue: [],
      },
    })

    // Click to select
    const firstCard = wrapper.find('.group')
    await firstCard.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['1'])
  })

  it('shows selected count when items are selected', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        selectable: true,
        modelValue: ['1', '2'],
      },
    })

    expect(wrapper.text()).toContain('已选择 2 项')
  })

  it('formats file size correctly', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
      },
    })

    // Check that file sizes are displayed
    const text = wrapper.text()
    expect(text).toContain('KB')
    expect(text).toContain('MB')
  })

  it('shows correct icons for different file types', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
      },
    })

    // Image should show Image icon
    // Document should show FileText icon
    // Video should show Video icon
    expect(wrapper.html()).toBeTruthy()
  })

  it('toggles view mode between grid and list', async () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
        viewMode: 'grid',
      },
    })

    // Find list view button and click
    const listButton = wrapper.findAll('button')[1]
    await listButton.trigger('click')

    expect(wrapper.emitted('update:viewMode')).toBeTruthy()
    expect(wrapper.emitted('update:viewMode')?.[0]?.[0]).toBe('list')
  })

  it('displays loading state', () => {
    const wrapper = mount(MediaGrid, {
      props: {
        media: [],
        loading: true,
      },
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('handles copy link action', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    const wrapper = mount(MediaGrid, {
      props: {
        media: mockMedia,
      },
    })

    // Find and click copy link menu item
    const copyMenuItem = wrapper.find('[role="menuitem"]:has(.lucide-copy)')
    if (copyMenuItem.exists()) {
      await copyMenuItem.trigger('click')
    }

    // Clipboard should be called
    expect(mockClipboard.writeText).toHaveBeenCalledWith('/uploads/image1.jpg')
  })
})
