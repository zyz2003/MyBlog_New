import { ThemeManager, type ThemeConfig } from '../../../packages/core/src/theme'
import classicThemeJson from '../../../themes/classic/theme.json'
import minimalThemeJson from '../../../themes/minimal/theme.json'

// Convert JSON to ThemeConfig type
const classicTheme: ThemeConfig = classicThemeJson as unknown as ThemeConfig
const minimalTheme: ThemeConfig = minimalThemeJson as unknown as ThemeConfig

export default defineNuxtPlugin(() => {
  const themeManager = new ThemeManager('classic')

  // 注册主题
  themeManager.register('classic', classicTheme)
  themeManager.register('minimal', minimalTheme)

  // 提供到 Nuxt 应用
  return {
    provide: {
      theme: themeManager,
    },
  }
})
