import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingFade from '../../../components/common/LoadingFade.vue'

describe('LoadingFade', () => {
  it('renders single line by default', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 1,
      },
    })

    const lines = wrapper.findAll('.animate-pulse')
    expect(lines.length).toBe(1)
  })

  it('renders multiple lines when rows prop is provided', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 5,
      },
    })

    const lines = wrapper.findAll('.animate-pulse')
    expect(lines.length).toBe(5)
  })

  it('applies skeleton class when skeleton prop is true', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 1,
        skeleton: true,
      },
    })

    const skeleton = wrapper.find('.animate-pulse')
    expect(skeleton.classes()).toContain('rounded-lg')
  })

  it('uses custom class when class prop is provided', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 1,
        class: 'custom-loading',
      },
    })

    expect(wrapper.classes()).toContain('custom-loading')
    expect(wrapper.classes()).toContain('animate-fade-in')
  })

  it('applies animation delay based on row index', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 3,
        delay: 200,
      },
    })

    const lines = wrapper.findAll('.animate-pulse')

    // First line should have 0ms delay
    expect(lines[0].attributes('style')).toContain('animationDelay: 0ms')
    // Second line should have 200ms delay
    expect(lines[1].attributes('style')).toContain('animationDelay: 200ms')
    // Third line should have 400ms delay
    expect(lines[2].attributes('style')).toContain('animationDelay: 400ms')
  })

  it('renders skeleton height when skeleton prop is true', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 1,
        skeleton: true,
      },
    })

    const skeleton = wrapper.find('.animate-pulse')
    expect(skeleton.attributes('style')).toContain('height: 120px')
  })

  it('renders default height when skeleton prop is false', () => {
    const wrapper = mount(LoadingFade, {
      props: {
        rows: 1,
        skeleton: false,
      },
    })

    const line = wrapper.find('.animate-pulse')
    expect(line.attributes('style')).toContain('height: 16px')
  })
})
