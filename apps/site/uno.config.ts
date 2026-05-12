import {
  defineConfig,
  presetWind,
  presetIcons,
} from 'unocss'

// Per A001: UnoCSS with presetWind (Tailwind-compatible) + presetIcons
export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],

  // Map ALL Tailwind colors to CSS variables
  // This ensures bg-surface, text-text, border-border etc all work
  theme: {
    colors: {
      // Custom theme colors - use CSS variables directly
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)',
      surface: 'var(--color-surface)',
      'surface-2': 'var(--color-surface-2)',
      muted: 'var(--color-text-muted)',
      background: 'var(--color-background)',
      border: 'var(--color-border)',
      text: 'var(--color-text)',

      // Override default Tailwind gray to use CSS variables
      gray: {
        50: 'var(--color-background)',
        100: 'var(--color-surface)',
        200: 'var(--color-surface-2)',
        300: 'var(--color-border)',
        400: 'var(--color-text-muted)',
        500: 'var(--color-secondary)',
        600: 'var(--color-secondary)',
        700: 'var(--color-text)',
        800: 'var(--color-text)',
        900: 'var(--color-text)',
      },
    },
  },

  // Shortcuts for common patterns
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90',
    'btn-secondary': 'btn bg-secondary text-white hover:bg-secondary/90',
    'card': 'bg-surface rounded-xl shadow-sm border border-border p-4',
  },
})
