import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserMenu from '../../../components/admin/UserMenu.vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
  Settings: { template: '<svg data-icon="settings" />' },
  LogOut: { template: '<svg data-icon="logout" />' },
}))

// Mock vue-router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...(actual as unknown),
    useRouter: vi.fn(),
  }
})

describe('UserMenu', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>
  let mockRouter: { push: vi.Mock }

  const mockUser = {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    mockRouter = { push: vi.fn() }
    vi.mocked(useRouter).mockReturnValue(mockRouter)
  })

  it('renders user menu trigger', () => {
    const wrapper = mount(UserMenu, {
      global: {
        plugins: [pinia],
        stubs: {
          Avatar: { template: '<div data-avatar />' },
          AvatarFallback: { template: '<div data-avatar-fallback />' },
          DropdownMenu: { template: '<div data-dropdown-menu><slot /></div>' },
          DropdownMenuTrigger: { template: '<button data-dropdown-trigger><slot /></button>' },
          DropdownMenuContent: { template: '<div data-dropdown-content><slot /></div>' },
          DropdownMenuLabel: { template: '<span data-dropdown-label><slot /></span>' },
          DropdownMenuItem: { template: '<button data-dropdown-item><slot /></button>' },
          DropdownMenuSeparator: { template: '<hr data-dropdown-separator />' },
          Settings: true,
          LogOut: true,
        },
      },
      props: { user: mockUser },
    })

    expect(wrapper.find('[data-dropdown-trigger]').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin')
  })

  it('displays user initial in avatar', () => {
    const wrapper = mount(UserMenu, {
      global: {
        plugins: [pinia],
        stubs: {
          Avatar: { template: '<div data-avatar><slot /></div>' },
          AvatarFallback: { template: '<span data-avatar-fallback><slot /></span>' },
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<button><slot /></button>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuLabel: { template: '<span><slot /></span>' },
          DropdownMenuItem: { template: '<button><slot /></button>' },
          DropdownMenuSeparator: { template: '<hr />' },
          Settings: true,
          LogOut: true,
        },
      },
      props: { user: mockUser },
    })

    expect(wrapper.find('[data-avatar-fallback]').text()).toBe('A')
  })

  it('calls logout on logout click', async () => {
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()

    const wrapper = mount(UserMenu, {
      global: {
        plugins: [pinia],
        stubs: {
          Avatar: { template: '<div />' },
          AvatarFallback: { template: '<span />' },
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<button><slot /></button>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuLabel: { template: '<span><slot /></span>' },
          DropdownMenuItem: { template: '<button data-logout><slot /></button>' },
          DropdownMenuSeparator: { template: '<hr />' },
          Settings: true,
          LogOut: true,
        },
      },
      props: { user: mockUser },
    })

    const logoutItem = wrapper.find('[data-logout]')
    await logoutItem.trigger('click')

    expect(logoutSpy).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/login')
  })

  it('navigates to settings on settings click', async () => {
    const wrapper = mount(UserMenu, {
      global: {
        plugins: [pinia],
        stubs: {
          Avatar: { template: '<div />' },
          AvatarFallback: { template: '<span />' },
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<button><slot /></button>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuLabel: { template: '<span><slot /></span>' },
          DropdownMenuItem: { template: '<button data-settings><slot /></button>' },
          DropdownMenuSeparator: { template: '<hr />' },
          Settings: true,
          LogOut: true,
        },
      },
      props: { user: mockUser },
    })

    const settingsItem = wrapper.find('[data-settings]')
    await settingsItem.trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/settings')
  })
})
