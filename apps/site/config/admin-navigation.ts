export interface NavigationItem {
  name: string
  icon: string
  path: string
}

export interface NavigationGroup {
  group: string
  items: NavigationItem[]
}

export const adminNavigation: NavigationGroup[] = [
  {
    group: '内容管理',
    items: [
      { name: '文章管理', icon: 'FileText', path: '/admin/posts' },
      { name: '媒体库', icon: 'Image', path: '/admin/media' },
      { name: '分类管理', icon: 'Folder', path: '/admin/categories' },
      { name: '标签管理', icon: 'Tags', path: '/admin/tags' },
    ],
  },
  {
    group: '系统管理',
    items: [
      { name: '主题管理', icon: 'Palette', path: '/admin/themes' },
      { name: '插件管理', icon: 'Puzzle', path: '/admin/plugins' },
      { name: '站点设置', icon: 'Settings', path: '/admin/settings' },
    ],
  },
]
