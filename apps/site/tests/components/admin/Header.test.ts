import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Header from '../../../components/admin/Header.vue'
import { useAuthStore } from '~/stores/auth'

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
  Search: { template: '<svg data-icon="search" />' },
  Bell: { template: '<svg data-icon="bell" />' },
}))

// Mock useRoute
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...(actual as unknown),
    useRoute: () => ({
      path: '/admin/posts',
      name: 'admin-posts',
      params: {},
      query: {},
    }),
  }
})

describe('Header', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
  })

  it('renders header structure', () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia],
        stubs: {
          SidebarTrigger: { template: '<button data-sidebar-trigger />' },
          Breadcrumb: { template: '<nav data-breadcrumb />' },
          UserMenu: { template: '<div data-user-menu />' },
          Search: true,
          Bell: true,
        },
      },
    })

    expect(wrapper.find('[data-sidebar-trigger]').exists()).toBe(true)
    expect(wrapper.find('[data-breadcrumb]').exists()).toBe(true)
    expect(wrapper.find('[data-user-menu]').exists()).toBe(true)
  })

  it('displays search box', () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia],
        stubs: {
          SidebarTrigger: { template: '<button />' },
          Breadcrumb: { template: '<nav />' },
          UserMenu: { template: '<div />' },
          Search: true,
          Bell: true,
        },
      },
    })

    expect(wrapper.find('input[placeholder*="搜索"]').exists()).toBe(true)
  })

  it('displays notification button', () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia],
        stubs: {
          SidebarTrigger: { template: '<button />' },
          Breadcrumb: { template: '<nav />' },
          UserMenu: { template: '<div />' },
          Search: true,
          Bell: true,
        },
      },
    })

    expect(wrapper.find('[data-icon="bell"]').exists()).toBe(true)
  })

  it('passes user prop to UserMenu', () => {
    const user = { id: '1', username: 'testuser', email: 'test@example.com' }

    const wrapper = mount(Header, {
      global: {
        stubs: {
          SidebarTrigger: { template: '<button />' },
          Breadcrumb: { template: '<nav />' },
          UserMenu: { template: '<div data-user-menu />', props: ['user'] },
          Search: true,
          Bell: true,
        },
      },
      props: { user },
    })

    const userMenu = wrapper.find('[data-user-menu]')
    expect(userMenu.props('user')).toEqual(user)
  })
})
