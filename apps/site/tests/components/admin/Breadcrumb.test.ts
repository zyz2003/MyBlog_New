import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Breadcrumb from '../../../components/admin/Breadcrumb.vue'

describe('Breadcrumb', () => {
  const createRouterInstance = () => {
    return createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/admin', name: 'admin', component: { template: '<div />' } },
        { path: '/admin/posts', name: 'admin-posts', component: { template: '<div />' } },
        { path: '/admin/posts/:id', name: 'admin-posts-id', component: { template: '<div />' } },
      ],
    })
  }

  it('renders breadcrumb items', () => {
    const router = createRouterInstance('/admin/posts')

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: {
          NuxtLink: { template: '<a :href="to"><slot /></a>' },
          ChevronRight: { template: '<svg data-chevron />' },
        },
      },
      props: {
        items: [
          { title: '首页', href: '/admin' },
          { title: '文章', href: '/admin/posts' },
        ],
      },
    })

    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('文章')
  })

  it('generates breadcrumbs from route when items not provided', () => {
    const router = createRouterInstance('/admin/posts')

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: {
          NuxtLink: { template: '<a :href="to"><slot /></a>' },
          ChevronRight: { template: '<svg data-chevron />' },
        },
      },
    })

    // Should generate breadcrumb from route path
    expect(wrapper.text()).toContain('Posts')
  })

  it('displays custom separator when provided', () => {
    const router = createRouterInstance('/admin/posts')

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          ChevronRight: { template: '<svg data-chevron />' },
        },
      },
      props: {
        items: [
          { title: '首页', href: '/admin' },
          { title: '文章', href: '/admin/posts' },
        ],
        separator: 'slash',
      },
    })

    expect(wrapper.text()).toContain('/')
  })

  it('does not make last item a link', () => {
    const router = createRouterInstance('/admin/posts')

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: {
          NuxtLink: { template: '<a :href="to"><slot /></a>' },
          ChevronRight: { template: '<svg />' },
        },
      },
      props: {
        items: [
          { title: '首页', href: '/admin' },
          { title: '文章', href: '/admin/posts' },
        ],
      },
    })

    // Last item should not be a link (it's the current page)
    const links = wrapper.findAll('a')
    expect(links.length).toBe(1)
    expect(links[0].text()).toContain('首页')
  })

  it('shows default breadcrumb when path is empty', () => {
    const router = createRouterInstance('/')

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: {
          NuxtLink: { template: '<a :href="to"><slot /></a>' },
          ChevronRight: { template: '<svg />' },
        },
      },
    })

    expect(wrapper.text()).toContain('控制台')
  })
})
