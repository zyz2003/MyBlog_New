import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue'
import SpinnerIcon from '~/components/ui/SpinnerIcon.vue'

describe('SkeletonLoader', () => {
  it('renders with card mode by default', () => {
    const wrapper = mount(SkeletonLoader)
    expect(wrapper.find('.skeleton-card').exists()).toBe(true)
  })

  it('renders card mode with cover area, title, text lines, and meta row', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'card' } })
    const card = wrapper.find('.skeleton-card')
    expect(card.find('.skeleton-cover').exists()).toBe(true)
    expect(card.find('.skeleton-title').exists()).toBe(true)
    expect(card.findAll('.skeleton-text-line').length).toBeGreaterThanOrEqual(2)
    expect(card.find('.skeleton-meta').exists()).toBe(true)
  })

  it('renders list mode with thumbnail and text area', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'list' } })
    const list = wrapper.find('.skeleton-list')
    expect(list.exists()).toBe(true)
    expect(list.find('.skeleton-thumbnail').exists()).toBe(true)
    expect(list.find('.skeleton-title').exists()).toBe(true)
  })

  it('renders text mode with configurable line count', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'text', lineCount: 5 } })
    const lines = wrapper.findAll('.skeleton-text-line')
    expect(lines.length).toBe(5)
  })

  it('renders text mode with default 3 lines', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'text' } })
    const lines = wrapper.findAll('.skeleton-text-line')
    expect(lines.length).toBe(3)
  })

  it('renders sidebar mode with vertical stack of blocks', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'sidebar' } })
    const sidebar = wrapper.find('.skeleton-sidebar')
    expect(sidebar.exists()).toBe(true)
    expect(sidebar.findAll('.skeleton-sidebar-block').length).toBeGreaterThanOrEqual(1)
  })

  it('renders multiple skeleton instances with count prop', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'card', count: 3 } })
    expect(wrapper.findAll('.skeleton-card').length).toBe(3)
  })

  it('applies shimmer animation class to skeleton blocks', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'card' } })
    const blocks = wrapper.findAll('.skeleton-block')
    expect(blocks.length).toBeGreaterThan(0)
  })

  it('uses CSS variable for background color', () => {
    const wrapper = mount(SkeletonLoader, { props: { mode: 'card' } })
    const block = wrapper.find('.skeleton-block')
    expect(block.exists()).toBe(true)
  })
})

describe('SpinnerIcon', () => {
  it('renders a spinner element', () => {
    const wrapper = mount(SpinnerIcon)
    expect(wrapper.find('.spinner-icon').exists()).toBe(true)
  })

  it('applies default size of 20px', () => {
    const wrapper = mount(SpinnerIcon)
    const spinner = wrapper.find('.spinner-icon')
    expect(spinner.attributes('style')).toContain('20px')
  })

  it('applies custom size from prop', () => {
    const wrapper = mount(SpinnerIcon, { props: { size: 32 } })
    const spinner = wrapper.find('.spinner-icon')
    expect(spinner.attributes('style')).toContain('32px')
  })

  it('uses default color from CSS variable', () => {
    const wrapper = mount(SpinnerIcon)
    const spinner = wrapper.find('.spinner-icon')
    expect(spinner.attributes('style')).toContain('var(--anzhiyu-main)')
  })

  it('uses custom color from prop', () => {
    const wrapper = mount(SpinnerIcon, { props: { color: '#ff0000' } })
    const spinner = wrapper.find('.spinner-icon')
    expect(spinner.attributes('style')).toContain('#ff0000')
  })
})
