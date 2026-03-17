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
    if (savedTheme && this.themes.has(savedTheme)) {
      this.currentTheme = savedTheme
    }

    // 应用初始主题
    this.apply(this.currentTheme, { transition: false })
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

    // 持久化
    if (persist) {
      this.saveTheme(themeName)
    }

    // 触发变更钩子
    this.hooks.onChange.forEach((fn) => fn(themeName))

    console.log(`[ThemeManager] Applied theme: ${themeName}`)
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
