<script setup lang="ts">
const props = defineProps<{
  items: string[]
  url: string
  title: string
}>()

const loaded = ref(false)

function normalizeClass(item: string) {
  if (item === 'sina_weibo') {
    return 'a2a_button_sina_weibo'
  }
  if (item === 'copy_link') {
    return 'a2a_button_copy_link'
  }
  return `a2a_button_${item}`
}

async function loadScript() {
  if (!import.meta.client || loaded.value) {
    return
  }

  const existing = document.querySelector<HTMLScriptElement>('script[data-addtoany="true"]')
  if (existing) {
    loaded.value = true
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://static.addtoany.com/menu/page.js'
    script.async = true
    script.dataset.addtoany = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('AddToAny load failed'))
    document.body.appendChild(script)
  })

  loaded.value = true
}

onMounted(() => {
  loadScript().catch(() => {})
})
</script>

<template>
  <section class="rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6 shadow-[var(--anzhiyu-shadow-border)]">
    <div class="mb-4 flex items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-share-nodes text-[var(--anzhiyu-main)]" />
      <h3 class="text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">AddToAny 分享</h3>
    </div>
    <div class="a2a_kit a2a_kit_size_32 a2a_default_style" :data-a2a-url="url" :data-a2a-title="title">
      <a
        v-for="item in items"
        :key="item"
        :class="normalizeClass(item)"
      />
    </div>
  </section>
</template>
