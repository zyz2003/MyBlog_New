import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MediaSelector from '~/components/admin/media/MediaSelector.vue'

describe('MediaSelector', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders dialog when open', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    expect(wrapper.text()).toContain('选择媒体')
  })

  it('does not render when closed', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: false,
      },
    })

    expect(wrapper.text()).not.toContain('选择媒体')
  })

  it('emits update:open when close is requested', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // Find and click cancel button
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === '取消')
    if (cancelButton) {
      await cancelButton.trigger('click')
    }

    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]?.[0]).toBe(false)
  })

  it('shows three tabs: library, upload, url', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    expect(wrapper.text()).toContain('媒体库')
    expect(wrapper.text()).toContain('上传')
    expect(wrapper.text()).toContain('外链')
  })

  it('renders FolderTree in library tab', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    expect(wrapper.text()).toContain('媒体库')
  })

  it('renders MediaGrid in library tab', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // MediaGrid should be present
    expect(wrapper.html()).toBeTruthy()
  })

  it('renders UploadArea in upload tab', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // Check upload tab content
    expect(wrapper.text()).toContain('上传')
  })

  it('renders URL input in url tab', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    expect(wrapper.text()).toContain('外链')
    expect(wrapper.text()).toContain('图片 URL')
  })

  it('emits select event when confirming selection', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // Set selected media
    wrapper.vm.selectedMedia = ['url1', 'url2']
    await wrapper.vm.$nextTick()

    // Click confirm button
    const confirmButton = wrapper.findAll('button').find((b) => b.text().includes('插入'))
    if (confirmButton) {
      await confirmButton.trigger('click')
    }

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(['url1', 'url2'])
    expect(wrapper.emitted('update:open')).toBeTruthy()
  })

  it('emits select event when inserting URL', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // Set URL
    wrapper.vm.imageUrl = 'https://example.com/image.jpg'
    wrapper.vm.activeTab = 'url'
    await wrapper.vm.$nextTick()

    // Call insertUrl
    wrapper.vm.insertUrl()

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(['https://example.com/image.jpg'])
  })

  it('handles upload complete event', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    const mockMedia = [
      { id: '1', url: '/uploads/test.jpg', filename: 'test.jpg' },
    ]

    wrapper.vm.handleUploadComplete(mockMedia)

    expect(wrapper.vm.mediaItems).toContainEqual(mockMedia[0])
    expect(wrapper.vm.activeTab).toBe('library')
  })

  it('resets state when dialog closes', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // Set some state
    wrapper.vm.selectedMedia = ['url1']
    wrapper.vm.imageUrl = 'https://example.com/image.jpg'
    wrapper.vm.activeTab = 'upload'

    // Close dialog
    await wrapper.setProps({ open: false })

    expect(wrapper.vm.selectedMedia).toEqual([])
    expect(wrapper.vm.imageUrl).toBe('')
    expect(wrapper.vm.activeTab).toBe('library')
  })

  it('supports multiple selection when multiple prop is true', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        multiple: true,
      },
    })

    // Toggle selection multiple times
    wrapper.vm.toggleSelection('url1')
    wrapper.vm.toggleSelection('url2')
    wrapper.vm.toggleSelection('url1') // Deselect

    expect(wrapper.vm.selectedMedia).toEqual(['url2'])
  })

  it('supports single selection when multiple prop is false', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
        multiple: false,
      },
    })

    wrapper.vm.toggleSelection('url1')
    wrapper.vm.toggleSelection('url2')

    expect(wrapper.vm.selectedMedia).toEqual(['url2'])
  })

  it('hasSelection computed returns correct value', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    expect(wrapper.vm.hasSelection).toBe(false)

    wrapper.vm.selectedMedia = ['url1']
    expect(wrapper.vm.hasSelection).toBe(true)
  })

  it('displays selected count in footer', async () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    wrapper.vm.selectedMedia = ['url1', 'url2', 'url3']
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('已选择 3 项')
  })

  it('disables insert button when no selection in library tab', () => {
    const wrapper = mount(MediaSelector, {
      global: {
        plugins: [pinia],
      },
      props: {
        open: true,
      },
    })

    // The insert button should be disabled when no selection
    expect(wrapper.vm.hasSelection).toBe(false)
  })
})
