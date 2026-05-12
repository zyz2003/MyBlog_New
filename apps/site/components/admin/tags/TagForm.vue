<script setup lang="ts">
const props = defineProps<{
  tag?: { id: number; name: string; slug: string; color: string | null } | null
}>()

const emit = defineEmits<{
  submit: [data: { name: string; slug: string; color: string }]
  close: []
}>()

const form = reactive({
  name: props.tag?.name || '',
  slug: props.tag?.slug || '',
  color: props.tag?.color || '#C4956A',
})

watch(() => form.name, (val) => {
  if (!props.tag || form.slug === slugify(props.tag.name)) {
    form.slug = slugify(val)
  }
})

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function handleSubmit() {
  if (!form.name.trim()) {
    alert('请输入名称')
    return
  }
  emit('submit', { name: form.name.trim(), slug: form.slug.trim() || undefined, color: form.color })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-2">
            <img src="/icons/tag.svg" class="w-5 h-5 text-primary" alt="">
            <h2 class="font-semibold text-text">{{ tag ? '编辑' : '新建' }}标签</h2>
          </div>
          <button class="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer" @click="emit('close')">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="text-xs text-muted">名称</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full mt-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
              placeholder="标签名称"
            >
          </div>
          <div>
            <label class="text-xs text-muted">别名</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full mt-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="auto"
            >
          </div>
          <div>
            <label class="text-xs text-muted">颜色</label>
            <div class="flex items-center gap-3 mt-1">
              <div class="relative">
                <div
                  class="w-10 h-10 rounded-xl border-2 border-border cursor-pointer"
                  :style="{ backgroundColor: form.color }"
                />
                <input
                  v-model="form.color"
                  type="color"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div class="flex gap-1.5">
                <div
                  v-for="c in ['#C4956A', '#5B8DEF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']"
                  :key="c"
                  class="w-6 h-6 rounded-lg cursor-pointer border-2"
                  :class="form.color === c ? 'border-text' : 'border-transparent'"
                  :style="{ backgroundColor: c }"
                  @click="form.color = c"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm rounded-xl bg-surface-2 text-muted cursor-pointer hover:bg-border transition-colors"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm rounded-xl bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {{ tag ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>