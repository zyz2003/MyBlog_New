import type { ThemeConfig, ThemeSwitchOptions } from './types'

/**
 * Theme Manager - Manages theme registration, switching, and CSS variables
 *
 * @example
 * ```typescript
 * const themeManager = new ThemeManager('classic')
 * themeManager.register('classic', classicTheme)
 * themeManager.apply('classic')
 * ```
 */
export class ThemeManager {
  private currentTheme: string
  private themes: Map<string, ThemeConfig> = new Map()
  private hooks: {
    onChange: ((theme: string) => void)[]
  } = { onChange: [] }

  constructor(defaultTheme: string = 'classic') {
    this.currentTheme = defaultTheme

    // 从 localStorage 恢复主题
    const savedTheme = this.getSavedTheme()
    if (savedTheme) {
      this.currentTheme = savedTheme
    }

    // 注意：不在构造函数中应用主题，因为此时主题还未注册
    // 主题会在 register() 时自动应用（如果注册的主题 matches currentTheme）
  }

  /**
   * 注册主题
   * @param name - 主题名称
   * @param config - 主题配置
   */
  register(name: string, config: ThemeConfig): void {
    this.themes.set(name, config)

    // 如果这是当前主题，立即应用
    if (name === this.currentTheme) {
      this.apply(name)
    }
  }

  /**
   * 应用主题
   * @param themeName - 主题名称
   * @param options - 主题切换选项
   */
  apply(themeName: string, options: ThemeSwitchOptions = {}): void {
    const { persist = true, transition = true } = options

    if (!this.themes.has(themeName)) {
      console.warn(`Theme "${themeName}" not found, falling back to current`)
      return
    }

    const theme = this.themes.get(themeName)!

    // 添加过渡效果
    if (transition) {
      document.documentElement.style.transition = 'background-color 0.3s, color 0.3s'
      setTimeout(() => {
        document.documentElement.style.transition = ''
      }, 300)
    }

    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', themeName)
    this.currentTheme = themeName

    // 应用主题配置到 CSS Variables
    this.applyThemeVariables(theme)

    // 持久化
    if (persist) {
      this.saveTheme(themeName)
    }

    // 触发变更钩子
    this.hooks.onChange.forEach((fn) => fn(themeName))

    console.log(`[ThemeManager] Applied theme: ${themeName}`)
  }

  /**
   * 应用主题配置到 CSS Variables
   * @param theme - 主题配置
   * @private
   */
  private applyThemeVariables(theme: ThemeConfig): void {
    // 应用颜色变量
    if (theme.colors) {
      this.setCSSVariable('--color-primary', theme.colors.primary)
      if (theme.colors.secondary) {
        this.setCSSVariable('--color-secondary', theme.colors.secondary)
      }
      if (theme.colors.accent) {
        this.setCSSVariable('--color-accent', theme.colors.accent)
      }
      this.setCSSVariable('--color-background', theme.colors.background)
      if (theme.colors.surface) {
        this.setCSSVariable('--color-surface', theme.colors.surface)
      }
      this.setCSSVariable('--color-text', theme.colors.text)
      if (theme.colors.textSecondary) {
        this.setCSSVariable('--color-text-secondary', theme.colors.textSecondary)
      }
      if (theme.colors.border) {
        this.setCSSVariable('--color-border', theme.colors.border)
      }
      if (theme.colors.error) {
        this.setCSSVariable('--color-error', theme.colors.error)
      }
      if (theme.colors.success) {
        this.setCSSVariable('--color-success', theme.colors.success)
      }
      if (theme.colors.warning) {
        this.setCSSVariable('--color-warning', theme.colors.warning)
      }
    }

    // 应用排版变量
    if (theme.typography) {
      this.setCSSVariable('--font-family', theme.typography.fontFamily)
      if (theme.typography.fontFamilyMono) {
        this.setCSSVariable('--font-family-mono', theme.typography.fontFamilyMono)
      }
      this.setCSSVariable('--font-size', theme.typography.fontSize)
      this.setCSSVariable('--line-height', String(theme.typography.lineHeight))
      if (theme.typography.fontWeight) {
        this.setCSSVariable('--font-weight', theme.typography.fontWeight)
      }
      if (theme.typography.letterSpacing) {
        this.setCSSVariable('--letter-spacing', theme.typography.letterSpacing)
      }
    }

    // 应用间距变量
    if (theme.spacing) {
      this.setCSSVariable('--spacing-unit', theme.spacing.unit)
      if (theme.spacing.xs) {
        this.setCSSVariable('--spacing-xs', theme.spacing.xs)
      }
      if (theme.spacing.sm) {
        this.setCSSVariable('--spacing-sm', theme.spacing.sm)
      }
      if (theme.spacing.md) {
        this.setCSSVariable('--spacing-md', theme.spacing.md)
      }
      if (theme.spacing.lg) {
        this.setCSSVariable('--spacing-lg', theme.spacing.lg)
      }
      if (theme.spacing.xl) {
        this.setCSSVariable('--spacing-xl', theme.spacing.xl)
      }
    }

    // 应用圆角变量
    if (theme.radius) {
      if (theme.radius.none) {
        this.setCSSVariable('--radius-none', theme.radius.none)
      }
      if (theme.radius.sm) {
        this.setCSSVariable('--radius-sm', theme.radius.sm)
      }
      if (theme.radius.md) {
        this.setCSSVariable('--radius-md', theme.radius.md)
      }
      if (theme.radius.lg) {
        this.setCSSVariable('--radius-lg', theme.radius.lg)
      }
      if (theme.radius.xl) {
        this.setCSSVariable('--radius-xl', theme.radius.xl)
      }
      if (theme.radius.full) {
        this.setCSSVariable('--radius-full', theme.radius.full)
      }
    }

    // 应用阴影变量
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        this.setCSSVariable(`--shadow-${key}`, value)
      })
    }
  }

  /**
   * 获取当前主题
   * @returns 当前主题名称
   */
  getCurrent(): string {
    return this.currentTheme
  }

  /**
   * 获取主题配置
   * @param name - 主题名称
   * @returns 主题配置
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name)
  }

  /**
   * 获取所有已注册主题
   * @returns 主题名称数组
   */
  getThemes(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 获取 CSS 变量值
   * @param name - CSS 变量名称
   * @returns CSS 变量值
   */
  getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  /**
   * 设置 CSS 变量（运行时覆盖）
   * @param name - CSS 变量名称
   * @param value - CSS 变量值
   */
  setCSSVariable(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value)
  }

  /**
   * 注册主题变更回调
   * @param callback - 回调函数
   * @returns 取消订阅函数
   */
  onChange(callback: (theme: string) => void): () => void {
    this.hooks.onChange.push(callback)

    // 返回取消订阅函数
    return () => {
      const index = this.hooks.onChange.indexOf(callback)
      if (index > -1) {
        this.hooks.onChange.splice(index, 1)
      }
    }
  }

  /**
   * 持久化主题到 localStorage
   * @param themeName - 主题名称
   */
  private saveTheme(themeName: string): void {
    try {
      localStorage.setItem('blog-theme', themeName)
    } catch (e) {
      console.warn('[ThemeManager] Failed to save theme:', e)
    }
  }

  /**
   * 从 localStorage 恢复主题
   * @returns 保存的主题名称
   */
  private getSavedTheme(): string | null {
    try {
      return localStorage.getItem('blog-theme')
    } catch {
      return null
    }
  }
}
