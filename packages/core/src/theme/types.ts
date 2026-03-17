/**
 * Theme System Type Definitions
 *
 * @packageDocumentation
 */

/**
 * 主题元数据配置
 */
export interface ThemeMetadata {
  name: string
  displayName: string
  version: string
  author?: string
  description?: string
}

/**
 * 主题颜色配置
 */
export interface ThemeColors {
  primary: string
  secondary?: string
  accent?: string
  background: string
  surface?: string
  text: string
  textSecondary?: string
  border?: string
  error?: string
  success?: string
  warning?: string
}

/**
 * 主题排版配置
 */
export interface ThemeTypography {
  fontFamily: string
  fontFamilyMono?: string
  fontSize: string
  lineHeight: string | number
  fontWeight?: string
  letterSpacing?: string
}

/**
 * 主题间距配置
 */
export interface ThemeSpacing {
  unit: string
  scale?: number
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
}

/**
 * 主题圆角配置
 */
export interface ThemeRadius {
  none?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  full?: string
}

/**
 * 完整主题配置
 */
export interface ThemeConfig {
  metadata: ThemeMetadata
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  radius?: ThemeRadius
  shadows?: Record<string, string>
}

/**
 * 主题切换选项
 */
export interface ThemeSwitchOptions {
  persist?: boolean // 是否持久化到 localStorage
  transition?: boolean // 是否添加过渡动画
}
