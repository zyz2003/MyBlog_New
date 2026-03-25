import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '../../../components/admin/Sidebar.vue'

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', async () => {
  return {
    FileText: { template: '<svg data-icon="file-text" />' },
    Image: { template: '<svg data-icon="image" />' },
    Folder: { template: '<svg data-icon="folder" />' },
    Tags: { template: '<svg data-icon="tags" />' },
    Palette: { template: '<svg data-icon="palette" />' },
    Puzzle: { template: '<svg data-icon="puzzle" />' },
    Settings: { template: '<svg data-icon="settings" />' },
  }
})

// Mock Nuxt app
vi.mock('#app', async () => {
  return {
    ...(undefined as unknown),
    useRoute: () => ({
      path: '/admin/posts',
      name: 'admin-posts',
      params: {},
      query: {},
    }),
  }
})

describe('Sidebar', () => {
  it('renders sidebar structure', () => {
    const wrapper = mount(Sidebar, {
      global: {
        stubs: {
          Sidebar: { template: '<div data-sidebar="sidebar"><slot /></div>' },
          SidebarContent: { template: '<div data-sidebar="content"><slot /></div>' },
          SidebarFooter: { template: '<div data-sidebar="footer"><slot /></div>' },
          SidebarHeader: { template: '<div data-sidebar="header"><slot /></div>' },
          SidebarGroup: { template: '<div data-sidebar="group"><slot /></div>' },
          SidebarGroupContent: { template: '<div data-sidebar="group-content"><slot /></div>' },
          SidebarGroupLabel: { template: '<div data-sidebar="group-label"><slot /></div>' },
          SidebarMenu: { template: '<ul data-sidebar="menu"><slot /></ul>' },
          SidebarMenuButton: { template: '<button data-sidebar="menu-button"><slot /></button>' },
          SidebarMenuItem: { template: '<li data-sidebar="menu-item"><slot /></li>' },
          UserMenu: { template: '<div data-component="user-menu" />' },
        },
      },
    })

    expect(wrapper.find('[data-sidebar="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-sidebar="header"]').exists()).toBe(true)
    expect(wrapper.find('[data-sidebar="content"]').exists()).toBe(true)
    expect(wrapper.find('[data-sidebar="footer"]').exists()).toBe(true)
  })

  it('displays navigation groups', () => {
    const wrapper = mount(Sidebar, {
      global: {
        stubs: {
          Sidebar: { template: '<div><slot /></div>' },
          SidebarContent: { template: '<div><slot /></div>' },
          SidebarFooter: { template: '<div><slot /></div>' },
          SidebarHeader: { template: '<div><slot /></div>' },
          SidebarGroup: { template: '<div data-group="true"><slot /></div>' },
          SidebarGroupContent: { template: '<div><slot /></div>' },
          SidebarGroupLabel: { template: '<span data-label="true"><slot /></span>' },
          SidebarMenu: { template: '<ul><slot /></ul>' },
          SidebarMenuButton: { template: '<button><slot /></button>' },
          SidebarMenuItem: { template: '<li><slot /></li>' },
          UserMenu: { template: '<div />' },
        },
      },
    })

    const groupLabels = wrapper.findAll('[data-label="true"]')
    expect(groupLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('displays logo text', () => {
    const wrapper = mount(Sidebar, {
      global: {
        stubs: {
          Sidebar: { template: '<div><slot /></div>' },
          SidebarContent: { template: '<div><slot /></div>' },
          SidebarFooter: { template: '<div><slot /></div>' },
          SidebarHeader: { template: '<div class="header"><slot /></div>' },
          SidebarGroup: { template: '<div><slot /></div>' },
          SidebarGroupContent: { template: '<div><slot /></div>' },
          SidebarGroupLabel: { template: '<span><slot /></span>' },
          SidebarMenu: { template: '<ul><slot /></ul>' },
          SidebarMenuButton: { template: '<button><slot /></button>' },
          SidebarMenuItem: { template: '<li><slot /></li>' },
          UserMenu: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).toContain('My Blog')
  })
})
