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

  // CSS Variables theme tokens (per A001 + architecture 4.2)
  theme: {
    colors: {
      primary: 'var(--color-primary, #3B82F6)',
      secondary: 'var(--color-secondary, #64748B)',
      accent: 'var(--color-accent, #8B5CF6)',
      surface: 'var(--color-surface, #F8FAFC)',
      muted: 'var(--color-text-muted, #64748B)',
    },
  },

  // Shortcuts for common patterns
  shortcuts: {
    'btn': 'px-4 py-2 rounded-md font-medium transition-colors',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90',
    'btn-secondary': 'btn bg-secondary text-white hover:bg-secondary/90',
    'card': 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
  },
})
