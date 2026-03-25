import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '../../../components/common/EmptyState.vue'

describe('EmptyState', () => {
  it('renders title and description', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: '暂无文章',
        description: '开始创作您的第一篇文章吧',
      },
      global: {
        stubs: {
          Card: { template: '<div data-card><slot /></div>' },
          CardHeader: { template: '<div data-card-header><slot /></div>' },
          CardTitle: { template: '<h3 data-title><slot /></h3>' },
          CardDescription: { template: '<p data-description><slot /></p>' },
          CardContent: { template: '<div data-content><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('[data-title]').text()).toContain('暂无文章')
    expect(wrapper.find('[data-description]').text()).toContain('开始创作您的第一篇文章吧')
  })

  it('renders action button when actionText is provided', () => {
    const onAction = vi.fn()

    const wrapper = mount(EmptyState, {
      props: {
        title: '暂无数据',
        actionText: '新建',
      },
      emits: {
        action: onAction,
      },
      global: {
        stubs: {
          Card: { template: '<div data-card><slot /></div>' },
          CardHeader: { template: '<div data-card-header><slot /></div>' },
          CardTitle: { template: '<h3><slot /></h3>' },
          CardDescription: { template: '<p><slot /></p>' },
          CardContent: { template: '<div data-content><slot /></div>' },
          Button: { template: '<button data-button><slot /></button>' },
        },
      },
    })

    expect(wrapper.find('[data-button]').exists()).toBe(true)
    expect(wrapper.find('[data-button]').text()).toContain('新建')
  })

  it('emits action event when button is clicked', async () => {
    const onAction = vi.fn()

    const wrapper = mount(EmptyState, {
      props: {
        title: '暂无数据',
        actionText: '新建',
      },
      emits: {
        action: onAction,
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardHeader: { template: '<div><slot /></div>' },
          CardTitle: { template: '<h3><slot /></h3>' },
          CardDescription: { template: '<p><slot /></p>' },
          CardContent: { template: '<div><slot /></div>' },
          Button: { template: '<button data-button><slot /></button>' },
        },
      },
    })

    await wrapper.find('[data-button]').trigger('click')

    expect(onAction).toHaveBeenCalled()
  })

  it('does not render action section when actionText is not provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: '暂无数据',
      },
      global: {
        stubs: {
          Card: { template: '<div data-card><slot /></div>' },
          CardHeader: { template: '<div data-card-header><slot /></div>' },
          CardTitle: { template: '<h3><slot /></h3>' },
          CardDescription: { template: '<p><slot /></p>' },
          CardContent: { template: '<div data-content><slot /></div>' },
        },
      },
    })

    // Action button should not be rendered
    expect(wrapper.find('[data-button]').exists()).toBe(false)
  })
})
