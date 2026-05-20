<script setup lang="ts">
const props = defineProps<{
  tag?: { id: number, name: string, slug: string, color: string | null } | null
}>()

const emit = defineEmits<{
  submit: [data: { name: string, slug?: string, color: string }]
  close: []
}>()

const presetColors = ['#4B8DF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#334155', '#F97316']

const form = reactive({
  name: props.tag?.name || '',
  slug: props.tag?.slug || '',
  color: props.tag?.color || '#4B8DF8',
})

watch(() => form.name, (value) => {
  const originalSlug = props.tag ? slugify(props.tag.name) : ''
  if (!props.tag || form.slug === originalSlug)
    form.slug = slugify(value)
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function handleSubmit() {
  if (!form.name.trim()) {
    alert('请输入标签名称')
    return
  }

  emit('submit', {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    color: form.color,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/45 backdrop-blur-sm" @click="emit('close')" />

      <div class="relative w-full max-w-xl rounded-[28px] border border-border/70 bg-surface shadow-xl">
        <div class="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Tag</p>
            <h2 class="mt-1 text-xl font-black text-text">{{ tag ? '编辑标签' : '新建标签' }}</h2>
          </div>
          <button class="rounded-xl p-2 text-muted transition hover:bg-background/70 hover:text-text" @click="emit('close')">
            <span class="i-heroicons-x-mark h-5 w-5" />
          </button>
        </div>

        <form class="space-y-5 p-6" @submit.prevent="handleSubmit">
          <div class="grid gap-5 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">标签名称</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="例如：Hexo、随笔、产品设计"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
            </div>

            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">路径 Slug</label>
              <input
                v-model="form.slug"
                type="text"
                placeholder="可留空自动生成"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 font-mono text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
            </div>

            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">标签颜色</label>
              <div class="rounded-[24px] border border-border/70 bg-background/60 p-4">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      <div
                        class="h-12 w-12 rounded-2xl border border-border/70 shadow-sm"
                        :style="{ backgroundColor: form.color }"
                      />
                      <input
                        v-model="form.color"
                        type="color"
                        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      >
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-text">当前颜色</p>
                      <p class="mt-1 font-mono text-xs text-muted">{{ form.color }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in presetColors"
                      :key="color"
                      type="button"
                      class="h-9 w-9 rounded-xl border-2 transition"
                      :class="form.color === color ? 'border-text scale-105' : 'border-transparent'"
                      :style="{ backgroundColor: color }"
                      @click="form.color = color"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-border/60 pt-5">
            <button
              type="button"
              class="rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm font-medium text-text transition hover:text-primary"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              type="submit"
              class="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              {{ tag ? '保存修改' : '创建标签' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
