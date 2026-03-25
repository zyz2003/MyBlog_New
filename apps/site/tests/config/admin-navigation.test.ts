import { describe, it, expect } from 'vitest'
import { adminNavigation, type NavigationItem, type NavigationGroup } from '~/config/admin-navigation'

describe('adminNavigation', () => {
  it('exports navigation configuration', () => {
    expect(adminNavigation).toBeDefined()
    expect(Array.isArray(adminNavigation)).toBe(true)
  })

  it('has correct structure with groups', () => {
    expect(adminNavigation.length).toBeGreaterThan(0)

    adminNavigation.forEach((group: NavigationGroup) => {
      expect(group).toHaveProperty('group')
      expect(group).toHaveProperty('items')
      expect(Array.isArray(group.items)).toBe(true)
    })
  })

  it('has correct item structure', () => {
    adminNavigation.forEach((group: NavigationGroup) => {
      group.items.forEach((item: NavigationItem) => {
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('path')
        expect(typeof item.name).toBe('string')
        expect(typeof item.icon).toBe('string')
        expect(typeof item.path).toBe('string')
        expect(item.path).toMatch(/^\/admin/)
      })
    })
  })

  it('has 内容管理 group with correct items', () => {
    const contentGroup = adminNavigation.find((g: NavigationGroup) => g.group === '内容管理')

    expect(contentGroup).toBeDefined()
    expect(contentGroup?.items.length).toBe(4)

    const itemNames = contentGroup?.items.map((i: NavigationItem) => i.name)
    expect(itemNames).toContain('文章管理')
    expect(itemNames).toContain('媒体库')
    expect(itemNames).toContain('分类管理')
    expect(itemNames).toContain('标签管理')
  })

  it('has 系统管理 group with correct items', () => {
    const systemGroup = adminNavigation.find((g: NavigationGroup) => g.group === '系统管理')

    expect(systemGroup).toBeDefined()
    expect(systemGroup?.items.length).toBe(3)

    const itemNames = systemGroup?.items.map((i: NavigationItem) => i.name)
    expect(itemNames).toContain('主题管理')
    expect(itemNames).toContain('插件管理')
    expect(itemNames).toContain('站点设置')
  })

  it('has unique paths', () => {
    const allPaths = adminNavigation.flatMap((g: NavigationGroup) => g.items.map((i: NavigationItem) => i.path))
    const uniquePaths = new Set(allPaths)

    expect(uniquePaths.size).toBe(allPaths.length)
  })

  it('has lucide-vue-next compatible icon names', () => {
    const validIcons = [
      'FileText',
      'Image',
      'Folder',
      'Tags',
      'Palette',
      'Puzzle',
      'Settings',
      'Home',
      'User',
      'LogOut',
      'Menu',
      'ChevronDown',
      'ChevronRight',
    ]

    adminNavigation.forEach((group: NavigationGroup) => {
      group.items.forEach((item: NavigationItem) => {
        expect(validIcons).toContain(item.icon)
      })
    })
  })
})
