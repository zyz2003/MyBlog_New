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

  safelist: [
    // Heroicons outline
    'i-heroicons-archive-box',
    'i-heroicons-arrow-path',
    'i-heroicons-arrow-top-right-on-square',
    'i-heroicons-bolt',
    'i-heroicons-chart-bar',
    'i-heroicons-chart-bar-square',
    'i-heroicons-chat-bubble-left-right',
    'i-heroicons-chevron-down',
    'i-heroicons-chevron-left',
    'i-heroicons-chevron-right',
    'i-heroicons-circle',
    'i-heroicons-code-bracket',
    'i-heroicons-code-bracket-square',
    'i-heroicons-cog-6-tooth',
    'i-heroicons-command-line',
    'i-heroicons-computer-desktop',
    'i-heroicons-clock',
    'i-heroicons-document',
    'i-heroicons-document-duplicate',
    'i-heroicons-document-plus',
    'i-heroicons-document-text',
    'i-heroicons-envelope',
    'i-heroicons-exclamation-triangle',
    'i-heroicons-eye',
    'i-heroicons-film',
    'i-heroicons-folder',
    'i-heroicons-folder-open',
    'i-heroicons-heart',
    'i-heroicons-home',
    'i-heroicons-home-modern',
    'i-heroicons-link',
    'i-heroicons-magnifying-glass-circle',
    'i-heroicons-megaphone',
    'i-heroicons-musical-note',
    'i-heroicons-newspaper',
    'i-heroicons-paint-brush',
    'i-heroicons-pencil-square',
    'i-heroicons-photo',
    'i-heroicons-presentation-chart-line',
    'i-heroicons-puzzle-piece',
    'i-heroicons-rectangle-group',
    'i-heroicons-rocket-launch',
    'i-heroicons-rss',
    'i-heroicons-share',
    'i-heroicons-sparkles',
    'i-heroicons-squares-2x2',
    'i-heroicons-squares-plus',
    'i-heroicons-swatch',
    'i-heroicons-table-cells',
    'i-heroicons-tag',
    'i-heroicons-user',
    'i-heroicons-x-mark',
    // Heroicons solid (for category cards and other UI elements)
    'i-heroicons-archive-box-solid',
    'i-heroicons-code-bracket-solid',
    'i-heroicons-computer-desktop-solid',
    'i-heroicons-document-solid',
    'i-heroicons-folder-solid',
    'i-heroicons-rectangle-group-solid',
    'i-heroicons-server-solid',
    'i-heroicons-sparkles-solid',
    'i-heroicons-user-group-solid',
    // Brand icons
    'i-simple-icons-bilibili',
    'i-simple-icons-github',
    'i-simple-icons-twitter',
    'i-logos-vue',
    'i-logos-javascript',
    'i-logos-typescript-icon',
    'i-logos-docker-icon',
    'i-logos-git-icon',
    'i-logos-css-3',
  ],

  // Map ALL Tailwind colors to CSS variables
  // This ensures bg-surface, text-text, border-border etc all work
  theme: {
    colors: {
      // Custom theme colors - use CSS variables directly
      primary: 'rgb(var(--color-primary-rgb))',
      secondary: 'rgb(var(--color-secondary-rgb))',
      accent: 'rgb(var(--color-accent-rgb))',
      surface: 'rgb(var(--color-surface-rgb))',
      'surface-2': 'rgb(var(--color-surface-2-rgb))',
      muted: 'rgb(var(--color-text-muted-rgb))',
      background: 'rgb(var(--color-background-rgb))',
      border: 'rgb(var(--color-border-rgb))',
      text: 'rgb(var(--color-text-rgb))',

      // Override default Tailwind gray to use CSS variables
      gray: {
        50: 'rgb(var(--color-background-rgb))',
        100: 'rgb(var(--color-surface-rgb))',
        200: 'rgb(var(--color-surface-2-rgb))',
        300: 'rgb(var(--color-border-rgb))',
        400: 'rgb(var(--color-text-muted-rgb))',
        500: 'rgb(var(--color-secondary-rgb))',
        600: 'rgb(var(--color-secondary-rgb))',
        700: 'rgb(var(--color-text-rgb))',
        800: 'rgb(var(--color-text-rgb))',
        900: 'rgb(var(--color-text-rgb))',
      },
    },
  },

  // Shortcuts for common patterns
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90',
    'btn-secondary': 'btn bg-secondary text-white hover:bg-secondary/90',
    'card': 'bg-surface rounded-xl shadow-sm border border-border p-4',

    // Animation shortcuts (per D-06, D-08, D-09)
    'anim-fast': 'transition-duration-150',          // Fast interactions: hover, button clicks (150ms)
    'anim-page': 'transition-duration-300',           // Page transitions (300ms)
    'anim-reveal': 'transition-duration-400',          // Scroll reveal animations (400ms)
    'gpu-accel': 'will-change-transform backface-hidden', // GPU acceleration hints
    'contain-layout': '[contain:layout_style]',        // CSS containment for card containers
  },
})
