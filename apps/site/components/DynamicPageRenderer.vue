<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'

const props = defineProps<{ code: string }>()

const compileError = ref('')

const component = computed(() => {
  if (!props.code) {
    return null
  }

  compileError.value = ''

  try {
    const templateMatch = props.code.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch = props.code.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/)

    const template = templateMatch?.[1] || props.code
    const scriptContent = scriptMatch?.[1] || ''
    const declarations: Record<string, unknown> = {}

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

    const computedPattern = /const\s+(\w+)\s*=\s*computed\(\(\)\s*=>\s*([^)]*)\)/g
    while ((match = computedPattern.exec(scriptContent)) !== null) {
      const current = match
      try {
        declarations[current[1]] = computed(() => new Function(`return ${current[2]}`)())
      }
      catch {
        declarations[current[1]] = computed(() => current[2])
      }
    }

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
  catch (error) {
    const message = (error as Error).message
    compileError.value = message

    console.error('[DynamicPage] Failed to compile:', error)

    return defineComponent({
      render: () => h('div', {
        style: {
          color: 'var(--color-danger, #EF4444)',
          padding: '1rem',
          border: '1px solid var(--color-danger, #EF4444)',
          borderRadius: '0.5rem',
          background: 'var(--color-danger-bg, #FEF2F2)',
        },
      }, `组件编译失败: ${message}`),
    })
  }
})
</script>

<template>
  <component :is="component" />
</template>
