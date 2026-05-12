<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const props = defineProps<{
  category?: CategoryTreeNode | null
  allCategories?: CategoryTreeNode[]
}>()

const emit = defineEmits<{
  submit: [data: { name: string; slug: string; description: string; parentId: number | null; sortOrder: number }]
  close: []
}>()

const form = reactive({
  name: props.category?.name || '',
  slug: props.category?.slug || '',
  description: props.category?.description || '',
  parentId: props.category?.parentId ?? null as number | null,
  sortOrder: props.category?.sortOrder ?? 0,
})

watch(() => form.name, (val) => {
  if (!props.category || form.slug === slugify(props.category.name)) {
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
  emit('submit', { name: form.name.trim(), slug: form.slug.trim() || undefined, description: form.description.trim(), parentId: form.parentId, sortOrder: form.sortOrder })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-2">
            <img src="/icons/folder.svg" class="w-5 h-5 text-primary" alt="">
            <h2 class="font-semibold text-text">{{ category ? '编辑' : '新建' }}分类</h2>
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
              placeholder="分类名称"
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
            <label class="text-xs text-muted">描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full mt-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary"
              placeholder="可选描述"
            />
          </div>
          <div>
            <label class="text-xs text-muted">父级</label>
            <select
              v-model="form.parentId"
              class="w-full mt-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option :value="null">无（顶级）</option>
              <option v-for="c in allCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">排序</label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              class="w-full mt-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
            >
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
              {{ category ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>