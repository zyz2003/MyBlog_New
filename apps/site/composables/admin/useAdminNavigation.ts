export interface AdminNavItem {
  key: string
  label: string
  shortLabel?: string
  description: string
  icon: string
  path: string
  group: string
  keywords?: string[]
}

export interface AdminNavGroup {
  key: string
  label: string
  description: string
  icon: string
}

const adminGroups: AdminNavGroup[] = [
  {
    key: 'overview',
    label: '总览',
    description: '入口、概况与高频操作',
    icon: 'i-heroicons-squares-2x2',
  },
  {
    key: 'content',
    label: '内容中心',
    description: '文章、页面、分类、标签、草稿与媒体',
    icon: 'i-heroicons-document-text',
  },
  {
    key: 'experience',
    label: '前台体验',
    description: '首页、导航、侧边栏、文章页与展示增强',
    icon: 'i-heroicons-computer-desktop',
  },
  {
    key: 'operations',
    label: '站点运营',
    description: 'SEO、统计与全局运营信息',
    icon: 'i-heroicons-chart-bar-square',
  },
  {
    key: 'platform',
    label: '平台扩展',
    description: '主题、插件与平台能力',
    icon: 'i-heroicons-swatch',
  },
]

const adminItems: AdminNavItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    description: '查看站点概况、近期内容与核心入口。',
    icon: 'i-heroicons-home-modern',
    path: '/admin',
    group: 'overview',
    keywords: ['dashboard', 'home', 'overview'],
  },
  {
    key: 'articles',
    label: '文章管理',
    shortLabel: '文章',
    description: '管理博客文章、发布状态与内容编辑。',
    icon: 'i-heroicons-newspaper',
    path: '/admin/articles',
    group: 'content',
    keywords: ['post', 'article', 'content'],
  },
  {
    key: 'pages',
    label: '页面管理',
    shortLabel: '页面',
    description: '管理关于页、独立页与自定义内容页。',
    icon: 'i-heroicons-document-duplicate',
    path: '/admin/pages',
    group: 'content',
    keywords: ['page'],
  },
  {
    key: 'categories',
    label: '分类管理',
    shortLabel: '分类',
    description: '整理文章分类层级与归档结构。',
    icon: 'i-heroicons-folder-open',
    path: '/admin/categories',
    group: 'content',
    keywords: ['category'],
  },
  {
    key: 'tags',
    label: '标签管理',
    shortLabel: '标签',
    description: '维护内容标签与聚合索引。',
    icon: 'i-heroicons-tag',
    path: '/admin/tags',
    group: 'content',
    keywords: ['tag'],
  },
  {
    key: 'drafts',
    label: '草稿箱',
    shortLabel: '草稿',
    description: '追踪未发布内容与待整理草稿。',
    icon: 'i-heroicons-archive-box',
    path: '/admin/drafts',
    group: 'content',
    keywords: ['draft'],
  },
  {
    key: 'media',
    label: '媒体库',
    shortLabel: '媒体',
    description: '统一管理图片、封面与上传素材。',
    icon: 'i-heroicons-photo',
    path: '/admin/media',
    group: 'content',
    keywords: ['media', 'image', 'asset'],
  },
  {
    key: 'page-config',
    label: '页面配置',
    shortLabel: '页面配置',
    description: '集中管理 `_config.yml` 风格的导航、搜索、代码块与页面兜底配置。',
    icon: 'i-heroicons-adjustments-horizontal',
    path: '/admin/page-config',
    group: 'experience',
    keywords: ['config', 'page', 'global', 'nav', 'search'],
  },
  {
    key: 'homepage',
    label: '首页设置',
    shortLabel: '首页',
    description: '配置 Hero、分类卡、轮播与文章列表入口。',
    icon: 'i-heroicons-home',
    path: '/admin/homepage',
    group: 'experience',
  },
  {
    key: 'sidebar',
    label: '侧边栏设置',
    shortLabel: '侧边栏',
    description: '控制首页与文章侧边栏的展示结构。',
    icon: 'i-heroicons-rectangle-group',
    path: '/admin/sidebar',
    group: 'experience',
  },
  {
    key: 'posts',
    label: '文章展示',
    shortLabel: '文章展示',
    description: '配置文章页元信息、目录、版权与封面表现。',
    icon: 'i-heroicons-document-text',
    path: '/admin/posts',
    group: 'experience',
  },
  {
    key: 'comments',
    label: '评论系统',
    shortLabel: '评论',
    description: '管理评论服务、Twikoo 与多评论方案配置。',
    icon: 'i-heroicons-chat-bubble-left-right',
    path: '/admin/comments',
    group: 'experience',
  },
  {
    key: 'display',
    label: '展示设置',
    shortLabel: '展示',
    description: '控制搜索、代码块、公式、图片与排版体验。',
    icon: 'i-heroicons-code-bracket-square',
    path: '/admin/display',
    group: 'experience',
  },
  {
    key: 'features',
    label: '增强功能',
    shortLabel: '增强',
    description: '管理右侧按钮、音乐、特效、快捷键与 AI 摘要。',
    icon: 'i-heroicons-sparkles',
    path: '/admin/features',
    group: 'experience',
  },
  {
    key: 'general',
    label: '全局设置',
    shortLabel: '全局',
    description: '维护社交信息、页脚、运行时间与全站基础配置。',
    icon: 'i-heroicons-cog-6-tooth',
    path: '/admin/general',
    group: 'operations',
  },
  {
    key: 'seo',
    label: 'SEO 设置',
    shortLabel: 'SEO',
    description: '维护搜索引擎元信息、验证信息与分享配置。',
    icon: 'i-heroicons-magnifying-glass-circle',
    path: '/admin/seo',
    group: 'operations',
  },
  {
    key: 'analytics',
    label: '统计分析',
    shortLabel: '统计',
    description: '管理站点统计、埋点与运营监测配置。',
    icon: 'i-heroicons-presentation-chart-line',
    path: '/admin/analytics',
    group: 'operations',
  },
  {
    key: 'themes',
    label: '主题管理',
    shortLabel: '主题',
    description: '维护主题配色、字体、圆角与视觉变量。',
    icon: 'i-heroicons-paint-brush',
    path: '/admin/themes',
    group: 'platform',
  },
  {
    key: 'plugins',
    label: '插件中心',
    shortLabel: '插件',
    description: '查看并管理插件能力与扩展入口。',
    icon: 'i-heroicons-puzzle-piece',
    path: '/admin/plugins',
    group: 'platform',
  },
]

const adminRouteAliases: Record<string, { title: string, description: string }> = {
  '/admin/articles/new': {
    title: '新建文章',
    description: '创建新的博客文章并开始编辑内容。',
  },
  '/admin/pages/new': {
    title: '新建页面',
    description: '创建新的独立页面。',
  },
}

function normalizeAdminPath(path: string): string {
  if (path === '/admin') {
    return path
  }

  const directMatch = adminItems.find(item => path === item.path || path.startsWith(`${item.path}/`))
  return directMatch?.path || path
}

export function useAdminNavigation() {
  const route = useRoute()

  const groups = adminGroups
  const items = adminItems

  const currentItem = computed<AdminNavItem | null>(() => {
    const normalizedPath = normalizeAdminPath(route.path)
    return items.find(item => item.path === normalizedPath) ?? null
  })

  const currentGroup = computed<AdminNavGroup | null>(() => {
    const item = currentItem.value
    if (!item) {
      return null
    }
    return groups.find(group => group.key === item.group) ?? null
  })

  const currentMeta = computed(() => {
    if (adminRouteAliases[route.path]) {
      return adminRouteAliases[route.path]
    }

    if (route.path.startsWith('/admin/articles/') && route.path !== '/admin/articles/new') {
      return {
        title: '编辑文章',
        description: '修改文章内容、状态与发布信息。',
      }
    }

    if (route.path.startsWith('/admin/pages/') && route.path !== '/admin/pages/new') {
      return {
        title: '编辑页面',
        description: '修改独立页面内容与展示信息。',
      }
    }

    if (currentItem.value) {
      return {
        title: currentItem.value.label,
        description: currentItem.value.description,
      }
    }

    return {
      title: '后台管理',
      description: '管理站点内容、配置与扩展能力。',
    }
  })

  function isActive(path: string): boolean {
    if (path === '/admin') {
      return route.path === '/admin'
    }
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  function getItemsByGroup(groupKey: string) {
    return items.filter(item => item.group === groupKey)
  }

  return {
    groups,
    items,
    currentItem,
    currentGroup,
    currentMeta,
    getItemsByGroup,
    isActive,
  }
}
