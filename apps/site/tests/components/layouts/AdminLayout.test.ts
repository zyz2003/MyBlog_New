import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminLayout from '../../../components/layouts/AdminLayout.vue'
import { useAuthStore } from '../../../stores/auth'

// Mock navigateTo
vi.mock('#app', () => ({
  navigateTo: vi.fn(),
}))

describe('AdminLayout', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  it('renders SidebarProvider and SidebarInset', async () => {
    // Set user as logged in
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminSidebar: true,
          AdminHeader: true,
          SidebarProvider: {
            template: '<div class="sidebar-provider"><slot /></div>',
          },
          SidebarInset: {
            template: '<div class="sidebar-inset"><slot /></div>',
          },
        },
      },
      slots: {
        default: '<div data-testid="content">Page Content</div>',
      },
    })

    await flushPromises()

    // Verify layout structure
    expect(wrapper.find('.sidebar-provider').exists()).toBe(true)
    expect(wrapper.find('.sidebar-inset').exists()).toBe(true)
    expect(wrapper.find('[data-testid="content"]').text()).toBe('Page Content')
  })

  it('redirects to login when not authenticated', async () => {
    // Ensure user is not logged in
    authStore.clearAuth()

    const { navigateTo } = await import('#app')

    mount(AdminLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminSidebar: true,
          AdminHeader: true,
          SidebarProvider: {
            template: '<div class="sidebar-provider"><slot /></div>',
          },
          SidebarInset: {
            template: '<div class="sidebar-inset"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()

    expect(navigateTo).toHaveBeenCalledWith('/admin/login')
  })

  it('does not redirect when authenticated', async () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const { navigateTo } = await import('#app')

    mount(AdminLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminSidebar: true,
          AdminHeader: true,
          SidebarProvider: {
            template: '<div class="sidebar-provider"><slot /></div>',
          },
          SidebarInset: {
            template: '<div class="sidebar-inset"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('has responsive sidebar state', async () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminSidebar: true,
          AdminHeader: true,
          SidebarProvider: {
            template: '<div class="sidebar-provider"><slot /></div>',
          },
          SidebarInset: {
            template: '<div class="sidebar-inset"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()

    // Sidebar should default to open on desktop
    expect(wrapper.vm.sidebarOpen).toBe(true)
  })

  it('provides main content slot', async () => {
    authStore.setAuth('test-token', { id: '1', username: 'admin', email: 'admin@example.com' })

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminSidebar: true,
          AdminHeader: true,
          SidebarProvider: {
            template: '<div class="sidebar-provider"><slot /></div>',
          },
          SidebarInset: {
            template: '<div class="sidebar-inset"><slot /></div>',
          },
        },
      },
      slots: {
        default: '<div class="page-content">Dashboard</div>',
      },
    })

    await flushPromises()

    expect(wrapper.find('.page-content').text()).toBe('Dashboard')
  })
})
