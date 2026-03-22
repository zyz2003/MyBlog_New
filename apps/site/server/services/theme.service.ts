/**
 * Theme Service
 *
 * Provides theme management functionality.
 * In-memory storage for theme configurations.
 *
 * @module server/services/theme
 */

/**
 * Theme configuration type
 */
export interface ThemeConfig {
  id: string
  name: string
  version: string
  author?: string
  config: {
    colors?: {
      primary?: string
      secondary?: string
      background?: string
      text?: string
    }
    typography?: {
      fontFamily?: string
      fontSize?: string
      lineHeight?: string
    }
    layout?: {
      sidebar?: boolean
      sidebarPosition?: 'left' | 'right'
      maxWidth?: string
    }
    [key: string]: unknown
  }
}

/**
 * Available themes registry
 */
const availableThemes: Map<string, Omit<ThemeConfig, 'config'>> = new Map([
  [
    'default',
    {
      id: 'default',
      name: 'Default Theme',
      version: '1.0.0',
      author: 'Blog System',
    },
  ],
  [
    'minimal',
    {
      id: 'minimal',
      name: 'Minimal',
      version: '1.0.0',
      author: 'Blog System',
    },
  ],
  [
    'dark',
    {
      id: 'dark',
      name: 'Dark Mode',
      version: '1.0.0',
      author: 'Blog System',
    },
  ],
])

/**
 * Active theme state (in-memory)
 * In a real implementation, this would be persisted to database
 */
const activeThemeState: {
  activeTheme: string
  config: ThemeConfig['config']
} = {
  activeTheme: 'default',
  config: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
    },
    layout: {
      sidebar: true,
      sidebarPosition: 'right',
      maxWidth: '1200px',
    },
  },
}

/**
 * Get current theme configuration
 *
 * @returns Current theme configuration
 */
export async function getThemeConfig(): Promise<{
  activeTheme: string
  config: ThemeConfig['config']
}> {
  return { ...activeThemeState, config: { ...activeThemeState.config } }
}

/**
 * List all available themes
 *
 * @returns Array of available themes
 */
export async function listAvailableThemes(): Promise<Array<Omit<ThemeConfig, 'config'>>> {
  return Array.from(availableThemes.values())
}

/**
 * Get available themes
 *
 * @returns Map of available themes
 */
export function getAvailableThemes(): Map<string, Omit<ThemeConfig, 'config'>> {
  return availableThemes
}

/**
 * Set active theme
 *
 * @param themeId - Theme ID to activate
 * @returns Updated theme configuration or null if theme not found
 */
export async function setActiveTheme(themeId: string): Promise<{
  activeTheme: string
  config: ThemeConfig['config']
} | null> {
  // Check if theme exists
  if (!availableThemes.has(themeId)) {
    return null
  }

  // Update active theme
  activeThemeState.activeTheme = themeId

  // Apply theme-specific default config if available
  const themeConfig = getDefaultThemeConfig(themeId)
  if (themeConfig) {
    activeThemeState.config = themeConfig
  }

  return { ...activeThemeState, config: { ...activeThemeState.config } }
}

/**
 * Update theme configuration
 *
 * @param config - New configuration values
 * @returns Updated theme configuration
 */
export async function updateThemeConfig(config: ThemeConfig['config']): Promise<{
  activeTheme: string
  config: ThemeConfig['config']
}> {
  activeThemeState.config = {
    ...activeThemeState.config,
    ...config,
  }

  return { ...activeThemeState, config: { ...activeThemeState.config } }
}

/**
 * Get default configuration for a theme
 *
 * @param themeId - Theme ID
 * @returns Default theme configuration
 */
function getDefaultThemeConfig(themeId: string): ThemeConfig['config'] | null {
  // Theme-specific defaults
  const themeDefaults: Record<string, ThemeConfig['config']> = {
    default: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
      },
      layout: {
        sidebar: true,
        sidebarPosition: 'right',
        maxWidth: '1200px',
      },
    },
    minimal: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        text: '#000000',
      },
      typography: {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        lineHeight: '1.8',
      },
      layout: {
        sidebar: false,
        sidebarPosition: 'right',
        maxWidth: '800px',
      },
    },
    dark: {
      colors: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        background: '#1f2937',
        text: '#f9fafb',
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
      },
      layout: {
        sidebar: true,
        sidebarPosition: 'right',
        maxWidth: '1200px',
      },
    },
  }

  return themeDefaults[themeId] || null
}
