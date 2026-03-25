import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UploadArea from '~/components/admin/media/UploadArea.vue'

describe('UploadArea', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders drop zone correctly', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('拖拽文件到此处')
    expect(wrapper.text()).toContain('选择文件')
  })

  it('handles drag over and drag leave', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    const dropZone = wrapper.find('[role="button"]')

    // Drag over
    await dropZone.trigger('dragover', {
      dataTransfer: { files: [] },
    })
    expect(wrapper.vm.isDragging).toBe(true)

    // Drag leave
    await dropZone.trigger('dragleave')
    expect(wrapper.vm.isDragging).toBe(false)
  })

  it('handles file drop', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
      props: {
        autoUpload: false,
      },
    })

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    await wrapper.find('[role="button"]').trigger('drop', {
      dataTransfer: dataTransfer,
    })

    expect(wrapper.vm.uploads.length).toBeGreaterThan(0)
    expect(wrapper.vm.uploads[0].name).toBe('test.jpg')
  })

  it('validates file size', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
      props: {
        maxSizeMB: 1,
        autoUpload: false,
      },
    })

    // Create a file larger than 1MB
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })

    const errorHandler = vi.fn()
    wrapper.vm.$on('upload-error', errorHandler)

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(largeFile)

    await wrapper.find('[role="button"]').trigger('drop', {
      dataTransfer: dataTransfer,
    })

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
  })

  it('validates file type', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    // Invalid file type
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' })
    const validation = (wrapper.vm as any).validateFile(invalidFile)

    expect(validation.valid).toBe(false)
    expect(validation.error).toBe('不支持的文件类型')
  })

  it('accepts valid image files', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const validation = (wrapper.vm as any).validateFile(validFile)

    expect(validation.valid).toBe(true)
  })

  it('respects max files limit', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
      props: {
        maxFiles: 2,
        autoUpload: false,
      },
    })

    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
    ]

    const errorHandler = vi.fn()
    wrapper.vm.$on('upload-error', errorHandler)

    const dataTransfer = new DataTransfer()
    files.forEach((f) => dataTransfer.items.add(f))

    await wrapper.find('[role="button"]').trigger('drop', {
      dataTransfer: dataTransfer,
    })

    // Should only accept 2 files
    expect(wrapper.vm.uploads.length).toBe(2)
  })

  it('emits upload-complete event on success', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    // Simulate successful upload
    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 100,
      status: 'success',
      result: {
        id: '1',
        filename: 'test.jpg',
        url: '/uploads/test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      },
    })

    expect(wrapper.emitted('upload-complete')).toBeTruthy()
  })

  it('cancels upload', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 50,
      status: 'uploading',
    })

    await wrapper.vm.cancelUpload(wrapper.vm.uploads[0])

    expect(wrapper.vm.uploads[0].status).toBe('error')
    expect(wrapper.vm.uploads[0].error).toBe('已取消')
  })

  it('removes upload from list', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 0,
      status: 'success',
    })

    await wrapper.vm.removeUpload(0)

    expect(wrapper.vm.uploads.length).toBe(0)
  })

  it('clears completed uploads', async () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push(
      { name: 'test1.jpg', progress: 100, status: 'success' },
      { name: 'test2.jpg', progress: 50, status: 'uploading' },
      { name: 'test3.jpg', progress: 0, status: 'waiting' }
    )

    await wrapper.vm.clearCompleted()

    expect(wrapper.vm.uploads.length).toBe(2)
    expect(wrapper.vm.uploads.every((u) => u.status !== 'success')).toBe(true)
  })

  it('formats file size correctly', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    expect((wrapper.vm as any).formatFileSize(0)).toBe('0 B')
    expect((wrapper.vm as any).formatFileSize(1024)).toBe('1 KB')
    expect((wrapper.vm as any).formatFileSize(1048576)).toBe('1 MB')
  })

  it('shows progress bar for uploading files', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 50,
      status: 'uploading',
    })

    expect(wrapper.html()).toContain('role="progressbar"')
  })

  it('displays error message for failed uploads', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 0,
      status: 'error',
      error: 'Network error',
    })

    expect(wrapper.text()).toContain('Network error')
  })

  it('displays success indicator for completed uploads', () => {
    const wrapper = mount(UploadArea, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.uploads.push({
      name: 'test.jpg',
      progress: 100,
      status: 'success',
      result: {
        id: '1',
        filename: 'test.jpg',
        url: '/uploads/test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      },
    })

    expect(wrapper.text()).toContain('上传完成')
  })
})
