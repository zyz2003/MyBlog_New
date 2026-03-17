import type { ThemeManager } from '@my-blog/core/theme'

/**
 * Use Theme Composable
 *
 * Access the theme manager instance from anywhere in your Nuxt app.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const theme = useTheme()
 * const currentTheme = theme.getCurrent()
 *
 * const switchTheme = (themeName: string) => {
 *   theme.apply(themeName)
 * }
 * </script>
 * ```
 *
 * @returns ThemeManager instance
 */
export const useTheme = (): ThemeManager => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$theme as ThemeManager
}
