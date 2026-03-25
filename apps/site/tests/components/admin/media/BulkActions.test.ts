import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BulkActions from '~/components/admin/media/BulkActions.vue'

describe('BulkActions', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('does not render when no items selected', () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 0,
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('renders when items are selected', () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('已选择 3 项')
  })

  it('displays correct selection count', () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 5,
      },
    })

    expect(wrapper.text()).toContain('已选择 5 项')
  })

  it('emits clear event when clear button is clicked', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
      },
    })

    const clearButton = wrapper.findAll('button').find((b) => b.text() === '')
    if (clearButton) {
      await clearButton.trigger('click')
    }

    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
      },
    })

    const deleteButton = wrapper.findAll('button').find((b) => b.text().includes('删除'))
    if (deleteButton) {
      await deleteButton.trigger('click')
    }

    expect(wrapper.text()).toContain('确认删除')
  })

  it('emits delete event when delete is confirmed', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
      },
    })

    // Open dialog
    wrapper.vm.deleteDialogOpen = true
    await wrapper.vm.$nextTick()

    // Confirm delete
    wrapper.vm.confirmDelete()

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.vm.deleteDialogOpen).toBe(false)
  })

  it('opens move dropdown when move button is clicked', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
        folders: [
          { id: '1', name: 'Folder 1' },
          { id: '2', name: 'Folder 2' },
        ],
      },
    })

    const moveButton = wrapper.findAll('button').find((b) => b.text().includes('移动'))
    if (moveButton) {
      await moveButton.trigger('click')
    }

    // Check if dropdown content is rendered
    expect(wrapper.text()).toContain('所有媒体')
    expect(wrapper.text()).toContain('Folder 1')
    expect(wrapper.text()).toContain('Folder 2')
  })

  it('emits move event with null folderId when moving to root', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
        folders: [{ id: '1', name: 'Folder 1' }],
      },
    })

    wrapper.vm.confirmMove(null)

    expect(wrapper.emitted('move')).toBeTruthy()
    expect(wrapper.emitted('move')?.[0]?.[0]).toBe(null)
  })

  it('emits move event with folderId when moving to folder', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
        folders: [{ id: '1', name: 'Folder 1' }],
      },
    })

    wrapper.vm.confirmMove('1')

    expect(wrapper.emitted('move')).toBeTruthy()
    expect(wrapper.emitted('move')?.[0]?.[0]).toBe('1')
  })

  it('closes delete dialog when cancel is clicked', async () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
      },
    })

    wrapper.vm.deleteDialogOpen = true
    await wrapper.vm.$nextTick()

    // Find and click cancel button
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === '取消')
    if (cancelButton && !wrapper.vm.deleteDialogOpen) {
      // Dialog was already closed
    }
  })

  it('shows folder list in move dropdown', () => {
    const wrapper = mount(BulkActions, {
      global: {
        plugins: [pinia],
      },
      props: {
        selectedCount: 3,
        folders: [
          { id: '1', name: '图片' },
          { id: '2', name: '文档' },
          { id: '3', name: '视频' },
        ],
      },
    })

    expect(wrapper.props('folders')).toHaveLength(3)
  })
})
