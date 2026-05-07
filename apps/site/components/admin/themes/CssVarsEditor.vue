<script setup lang="ts">
interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, number>
  borderRadius: Record<string, number>
  layout: Record<string, string | string[] | boolean>
}

const props = defineProps<{
  config: ThemeConfig
}>()

const emit = defineEmits<{
  'update:config': [value: ThemeConfig]
}>()

const cssVarsText = computed(() => {
  const lines: string[] = []
  for (const [key, value] of Object.entries(props.config.colors)) {
    lines.push(`--color-${key}: ${value};`)
  }
  for (const [key, value] of Object.entries(props.config.fonts)) {
    const cssVar = key === 'heading' ? '--font-heading' : key === 'body' ? '--font-body' : '--font-mono'
    lines.push(`${cssVar}: ${value};`)
  }
  for (const [key, value] of Object.entries(props.config.spacing)) {
    lines.push(`--spacing-${key}: ${value}px;`)
  }
  for (const [key, value] of Object.entries(props.config.borderRadius)) {
    lines.push(`--radius-${key}: ${value}px;`)
  }
  for (const [key, value] of Object.entries(props.config.layout)) {
    if (typeof value === 'string') {
      lines.push(`--layout-${key}: ${value};`)
    }
    else if (typeof value === 'boolean') {
      lines.push(`--layout-${key}: ${value ? 'true' : 'false'};`)
    }
  }
  return lines.join('\n')
})

function parseCssVars(text: string) {
  const newConfig = { ...props.config }
  newConfig.colors = { ...newConfig.colors }
  newConfig.fonts = { ...newConfig.fonts }
  newConfig.spacing = { ...newConfig.spacing }
  newConfig.borderRadius = { ...newConfig.borderRadius }
  newConfig.layout = { ...newConfig.layout }

  const lines = text.split('\n')
  for (const line of lines) {
    const match = line.match(/^--([a-z-]+):\s*(.+);$/)
    if (match) {
      const [, name, value] = match
      const trimmed = value.trim()
      if (name.startsWith('color-')) {
        newConfig.colors[name.replace('color-', '')] = trimmed
      }
      else if (name.startsWith('font-')) {
        newConfig.fonts[name.replace('font-', '')] = trimmed
      }
      else if (name.startsWith('spacing-')) {
        newConfig.spacing[name.replace('spacing-', '')] = Number(trimmed.replace('px', ''))
      }
      else if (name.startsWith('radius-')) {
        newConfig.borderRadius[name.replace('radius-', '')] = Number(trimmed.replace('px', ''))
      }
      else if (name.startsWith('layout-')) {
        const layoutKey = name.replace('layout-', '')
        if (trimmed === 'true' || trimmed === 'false') {
          newConfig.layout[layoutKey] = trimmed === 'true'
        }
        else {
          newConfig.layout[layoutKey] = trimmed
        }
      }
    }
  }
  emit('update:config', newConfig)
}
</script>

<template>
  <textarea
    :value="cssVarsText"
    rows="10"
    class="w-full px-3 py-2 text-sm font-mono border rounded resize-y"
    placeholder="--color-primary: #3B82F6;&#10;--font-heading: 'Inter', sans-serif;"
    @input="parseCssVars(($event.target as HTMLTextAreaElement).value)"
  />
</template>
