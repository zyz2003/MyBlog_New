<script setup lang="ts">
import { defineComponent, h, ref, computed } from 'vue'

const props = defineProps<{ code: string }>()

const compileError = ref('')

const component = computed(() => {
  if (!props.code) return null
  compileError.value = ''

  try {
    // Extract template from SFC
    const templateMatch = props.code.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch = props.code.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/)

    // Support both SFC format and plain HTML
    const template = templateMatch?.[1] || props.code
    const scriptContent = scriptMatch?.[1] || ''

    // Parse const declarations as setup return values
    const declarations: Record<string, unknown> = {}

    // Match const x = ref(value)
    const refPattern = /const\s+(\w+)\s*=\s*ref\(([^)]*)\)/g
    let match: RegExpExecArray | null
    while ((match = refPattern.exec(scriptContent)) !== null) {
      try {
        declarations[match[1]] = ref(new Function(`return ${match[2]}`)())
      }
      catch {
        declarations[match[1]] = ref(match[2])
      }
    }

    // Match const x = computed(() => value)
    const computedPattern = /const\s+(\w+)\s*=\s*computed\(\(\)\s*=>\s*([^)]*)\)/g
    while ((match = computedPattern.exec(scriptContent)) !== null) {
      const m = match!
      try {
        declarations[m[1]] = computed(() => new Function(`return ${m[2]}`)())
      }
      catch {
        declarations[m[1]] = computed(() => m[2])
      }
    }

    // Match const x = 'literal' or const x = "literal"
    const literalPattern = /const\s+(\w+)\s*=\s*(['"`])(.*?)\2/g
    while ((match = literalPattern.exec(scriptContent)) !== null) {
      if (!declarations[match[1]]) {
        declarations[match[1]] = match[3]
      }
    }

    return defineComponent({
      template,
      setup: () => declarations,
    })
  }
  catch (e) {
    compileError.value = (e as Error).message
    console.error('[DynamicPage] Failed to compile:', e)
    return defineComponent({
      render: () => h('div', {
        style: {
          color: 'var(--color-danger, #EF4444)',
          padding: '1rem',
          border: '1px solid var(--color-danger, #EF4444)',
          borderRadius: '0.5rem',
          background: 'var(--color-danger-bg, #FEF2F2)',
        },
      }, `组件编译失败: ${(e as Error).message}`),
    })
  }
})
</script>

<template>
  <component :is="component" />
</template>
