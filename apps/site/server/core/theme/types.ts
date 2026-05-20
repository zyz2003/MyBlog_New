/**
 * Theme system type definitions
 * Per architecture doc section 4.1.2
 */

/** Theme color palette */
export interface ThemeColors {
  /** Primary brand color (default: '#3B82F6') */
  primary: string
  /** Secondary/accent color (default: '#64748B') */
  secondary: string
  /** Highlight/accent color (default: '#8B5CF6') */
  accent: string
  /** Page background color (default: '#FFFFFF') */
  background: string
  /** Card/surface color (default: '#F8FAFC') */
  surface: string
  /** Primary text color (default: '#0F172A') */
  text: string
  /** Muted/secondary text color (default: '#64748B') */
  textMuted: string
}

/** Theme font families */
export interface ThemeFonts {
  /** Heading font family */
  heading: string
  /** Body text font family */
  body: string
  /** Monospace/code font family */
  mono: string
}

/** Theme spacing values */
export interface ThemeSpacing {
  /** Base spacing unit (e.g. '8px') */
  unit: string
  /** Max content container width (e.g. '720px') */
  containerMax: string
  /** Content area padding (e.g. '24px') */
  contentPadding: string
}

/** Theme border radius values */
export interface ThemeBorderRadius {
  /** Small radius (e.g. '4px') */
  small: string
  /** Medium radius (e.g. '8px') */
  medium: string
  /** Large radius (e.g. '16px') */
  large: string
}

/** Theme layout configuration */
export interface ThemeLayout {
  /** Header position: fixed top, sticky, or hidden */
  headerPosition: 'top' | 'sticky' | 'hidden'
  /** Sidebar position: left, right, or none */
  sidebarPosition: 'left' | 'right' | 'none'
  /** Footer style variant */
  footerStyle: 'simple' | 'detailed' | 'minimal'
  /** Navigation links (customizable per theme) */
  navLinks?: Array<{ label: string; to: string }>
  /** Show sidebar */
  showSidebar?: boolean
  /** Sidebar components to display */
  sidebarComponents?: string[]
}

/** Theme shadow presets */
export interface ThemeShadows {
  sm: string
  md: string
  lg: string
}

/** Theme transition presets */
export interface ThemeTransitions {
  fast: string
  normal: string
  slow: string
}

/** Component-level style overrides */
export interface ThemeComponents {
  articleCard?: {
    showExcerpt?: boolean
    showDate?: boolean
    showAuthor?: boolean
    showCover?: boolean
    excerptLines?: number
  }
  articleContent?: {
    maxWidth?: string
    codeTheme?: string
    lineHeight?: number
  }
  sidebar?: {
    width?: string
    background?: string
  }
}

/**
 * Complete theme configuration
 * Defines all visual and layout properties for a theme
 */
export interface ThemeConfig {
  /** Color palette */
  colors: ThemeColors
  /** Font families */
  fonts: ThemeFonts
  /** Spacing values */
  spacing: ThemeSpacing
  /** Border radius values */
  borderRadius: ThemeBorderRadius
  /** Layout configuration */
  layout: ThemeLayout
  /** Shadow presets */
  shadows?: ThemeShadows
  /** Transition presets */
  transitions?: ThemeTransitions
  /** Component-level overrides */
  components?: ThemeComponents
}

/** Theme metadata (from config.json) */
export interface ThemeMeta {
  /** Theme display name */
  name: string
  /** Theme version (semver) */
  version: string
  /** Theme author */
  author?: string
  /** Theme description */
  description?: string
  /** Screenshot image path */
  screenshot?: string
}

/**
 * Complete theme manifest
 * Combines metadata and configuration
 */
export interface ThemeManifest {
  /** Theme metadata */
  meta: ThemeMeta
  /** Theme configuration */
  config: ThemeConfig
}

/** Hook event names for theme lifecycle */
export type HookEvent =
  | 'theme:before-load'
  | 'theme:loaded'
  | 'theme:activated'
  | 'theme:changed'
  | 'theme:css-applied'

/** Context passed to hook handlers */
export interface HookContext {
  /** Theme name involved in the event */
  themeName: string
  /** Theme config (available on loaded/activated events) */
  config?: ThemeConfig
  /** Generated CSS variables text (available on css-applied event) */
  cssVariables?: string
  /** Event timestamp */
  timestamp: number
}

/** Hook handler function type */
export type HookHandler = (event: HookEvent, context: HookContext) => void | Promise<void>

/**
 * Convert ThemeConfig to CSS custom properties map
 * Maps config values to --color-*, --font-*, --spacing-*, --radius-*, --layout-* variables
 */
export function CSSVariablesMap(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {}
  const primaryRgb = hexToRgb(config.colors.primary)

  // Color variables
  for (const [key, value] of Object.entries(config.colors)) {
    const cssKey = key === 'textMuted' ? 'text-muted' : key
    vars[`--color-${cssKey}`] = value
  }

  if (primaryRgb) {
    vars['--color-primary-rgb'] = primaryRgb
  }

  // Anzhiyu compatibility aliases for frontend components that still consume
  // theme-specific variable names instead of the generic --color-* tokens.
  vars['--anzhiyu-main'] = config.colors.primary
  vars['--anzhiyu-main-op'] = `${config.colors.primary}23`
  vars['--anzhiyu-white'] = '#FFFFFF'
  vars['--anzhiyu-background'] = config.colors.background
  vars['--anzhiyu-card-bg'] = config.colors.surface
  vars['--anzhiyu-card-bg-none'] = 'transparent'
  vars['--anzhiyu-fontcolor'] = config.colors.text
  vars['--anzhiyu-secondtext'] = config.colors.textMuted
  vars['--style-border-always'] = config.colors.textMuted

  // Font variables
  for (const [key, value] of Object.entries(config.fonts)) {
    vars[`--font-${key}`] = value
  }

  // Spacing variables
  vars['--spacing-unit'] = config.spacing.unit
  vars['--container-max'] = config.spacing.containerMax
  vars['--content-padding'] = config.spacing.contentPadding

  // Border radius variables
  for (const [key, value] of Object.entries(config.borderRadius)) {
    vars[`--radius-${key}`] = value
  }

  // Layout variables
  for (const [key, value] of Object.entries(config.layout)) {
    if (typeof value === 'string') {
      vars[`--layout-${key}`] = value
    }
  }

  // Shadow variables
  if (config.shadows) {
    for (const [key, value] of Object.entries(config.shadows)) {
      vars[`--shadow-${key}`] = value
    }
  }

  // Transition variables
  if (config.transitions) {
    for (const [key, value] of Object.entries(config.transitions)) {
      vars[`--transition-${key}`] = value
    }
  }

  return vars
}

function hexToRgb(hex: string): string | null {
  const normalized = hex.replace('#', '').trim()
  const fullHex = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized

  if (!/^[\da-fA-F]{6}$/.test(fullHex)) {
    return null
  }

  const r = Number.parseInt(fullHex.slice(0, 2), 16)
  const g = Number.parseInt(fullHex.slice(2, 4), 16)
  const b = Number.parseInt(fullHex.slice(4, 6), 16)

  return `${r}, ${g}, ${b}`
}
