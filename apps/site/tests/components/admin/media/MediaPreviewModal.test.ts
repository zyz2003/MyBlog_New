import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MediaPreviewModal from '~/components/admin/media/MediaPreviewModal.vue'

const mockMedia = {
  id: '1',
  filename: 'test-image.jpg',
  originalName: 'My Test Image.jpg',
  path: '/uploads/test-image.jpg',
  url: '/uploads/test-image.jpg',
  mimeType: 'image/jpeg',
  size: 204800,
  width: 1920,
  height: 1080,
  altText: 'Test alt text',
  thumbnailPath: '/uploads/thumbs/test-image.jpg',
  folderId: null,
  uploadedBy: 'user1',
  uploadedAt: new Date('2024-01-15T10:30:00Z'),
}

describe('MediaPreviewModal', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders dialog when open', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    expect(wrapper.text()).toContain('媒体预览')
    expect(wrapper.text()).toContain('My Test Image.jpg')
  })

  it('does not render content when closed', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: false,
        media: mockMedia,
      },
    })

    expect(wrapper.text()).not.toContain('My Test Image.jpg')
  })

  it('emits update:open when close button is clicked', async () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    const closeButton = wrapper.find('button[type="button"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]?.[0]).toBe(false)
  })

  it('displays image for image mime types', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/uploads/test-image.jpg')
  })

  it('displays video player for video mime types', () => {
    const videoMedia = { ...mockMedia, mimeType: 'video/mp4' }
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: videoMedia,
      },
    })

    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
  })

  it('displays file icon for document mime types', () => {
    const docMedia = { ...mockMedia, mimeType: 'application/pdf' }
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: docMedia,
      },
    })

    expect(wrapper.text()).toContain('此文件类型不支持预览')
  })

  it('displays media information correctly', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    expect(wrapper.text()).toContain('image/jpeg')
    expect(wrapper.text()).toContain('200 KB')
    expect(wrapper.text()).toContain('1920 x 1080')
  })

  it('allows editing alt text', async () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    // Click edit button
    const editButton = wrapper.findAll('button').find((b) => b.text() === '编辑')
    if (editButton) {
      await editButton.trigger('click')
    }

    // Check if input is shown
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
  })

  it('saves alt text', async () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    // Edit alt text
    const newAltText = 'New alt text'
    wrapper.vm.altText = newAltText
    await wrapper.vm.saveAltText()

    expect(wrapper.vm.currentMedia.altText).toBe(newAltText)
    expect(wrapper.vm.isEditingAlt).toBe(false)
  })

  it('copies link to clipboard', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    await wrapper.vm.copyLink()

    expect(mockClipboard.writeText).toHaveBeenCalledWith('/uploads/test-image.jpg')
    expect(wrapper.vm.copied).toBe(true)
  })

  it('emits insert event when insert button is clicked', async () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
        showInsert: true,
      },
    })

    wrapper.vm.insertIntoPost()

    expect(wrapper.emitted('insert')).toBeTruthy()
    expect(wrapper.emitted('insert')?.[0]?.[0]).toBe('/uploads/test-image.jpg')
    expect(wrapper.emitted('update:open')).toBeTruthy()
  })

  it('emits delete event when delete is confirmed', async () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    wrapper.vm.handleDelete()

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]?.[0]).toBe('1')
    expect(wrapper.emitted('update:open')).toBeTruthy()
  })

  it('navigates to previous media', async () => {
    const allMedia = [
      { ...mockMedia, id: '1' },
      { ...mockMedia, id: '2' },
      { ...mockMedia, id: '3' },
    ]

    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: allMedia[1],
        allMedia,
      },
    })

    wrapper.vm.goToPrevious()

    expect(wrapper.vm.currentMedia.id).toBe('1')
  })

  it('navigates to next media', async () => {
    const allMedia = [
      { ...mockMedia, id: '1' },
      { ...mockMedia, id: '2' },
      { ...mockMedia, id: '3' },
    ]

    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: allMedia[1],
        allMedia,
      },
    })

    wrapper.vm.goToNext()

    expect(wrapper.vm.currentMedia.id).toBe('3')
  })

  it('handles keyboard navigation', async () => {
    const allMedia = [
      { ...mockMedia, id: '1' },
      { ...mockMedia, id: '2' },
    ]

    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: allMedia[0],
        allMedia,
      },
    })

    // Simulate ArrowRight key
    await wrapper.vm.handleKeyDown({ key: 'ArrowRight' } as KeyboardEvent)

    expect(wrapper.vm.currentMedia.id).toBe('2')

    // Simulate Escape key
    await wrapper.vm.handleKeyDown({ key: 'Escape' } as KeyboardEvent)

    expect(wrapper.emitted('update:open')).toBeTruthy()
  })

  it('formats file size correctly', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    expect((wrapper.vm as unknown).formatFileSize(0)).toBe('0 B')
    expect((wrapper.vm as unknown).formatFileSize(1024)).toBe('1 KB')
    expect((wrapper.vm as unknown).formatFileSize(204800)).toBe('200 KB')
  })

  it('formats date correctly', () => {
    const wrapper = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: mockMedia,
      },
    })

    const dateStr = (wrapper.vm as unknown).formatDate(new Date('2024-01-15T10:30:00Z'))
    expect(dateStr).toBeTruthy()
  })

  it('shows hasPrevious and hasNext computed properties correctly', () => {
    const allMedia = [
      { ...mockMedia, id: '1' },
      { ...mockMedia, id: '2' },
      { ...mockMedia, id: '3' },
    ]

    // First item
    const wrapper1 = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: allMedia[0],
        allMedia,
      },
    })

    expect(wrapper1.vm.hasPrevious).toBe(false)
    expect(wrapper1.vm.hasNext).toBe(true)

    // Last item
    const wrapper2 = mount(MediaPreviewModal, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        media: allMedia[2],
        allMedia,
      },
    })

    expect(wrapper2.vm.hasPrevious).toBe(true)
    expect(wrapper2.vm.hasNext).toBe(false)
  })
})
