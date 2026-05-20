<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const props = defineProps<{
  category?: CategoryTreeNode | null
  allCategories?: CategoryTreeNode[]
}>()

const emit = defineEmits<{
  submit: [data: { name: string, slug?: string, description: string, parentId: number | null, sortOrder: number }]
  close: []
}>()

const form = reactive({
  name: props.category?.name || '',
  slug: props.category?.slug || '',
  description: props.category?.description || '',
  parentId: props.category?.parentId ?? null as number | null,
  sortOrder: props.category?.sortOrder ?? 0,
})

watch(() => form.name, (value) => {
  const originalSlug = props.category ? slugify(props.category.name) : ''
  if (!props.category || form.slug === originalSlug)
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

function flattenCategories(nodes: CategoryTreeNode[], depth = 0): Array<{ id: number, name: string }> {
  return nodes.flatMap(node => {
    const current = {
      id: node.id,
      name: `${'— '.repeat(depth)}${node.name}`,
    }
    return [current, ...flattenCategories(node.children || [], depth + 1)]
  })
}

const categoryOptions = computed(() => {
  const options = flattenCategories(props.allCategories || [])
  if (!props.category) return options
  return options.filter(option => option.id !== props.category?.id)
})

function handleSubmit() {
  if (!form.name.trim()) {
    alert('请输入分类名称')
    return
  }

  emit('submit', {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    parentId: form.parentId,
    sortOrder: form.sortOrder,
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
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Category</p>
            <h2 class="mt-1 text-xl font-black text-text">{{ category ? '编辑分类' : '新建分类' }}</h2>
          </div>
          <button class="rounded-xl p-2 text-muted transition hover:bg-background/70 hover:text-text" @click="emit('close')">
            <span class="i-heroicons-x-mark h-5 w-5" />
          </button>
        </div>

        <form class="space-y-5 p-6" @submit.prevent="handleSubmit">
          <div class="grid gap-5 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">分类名称</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="例如：前端开发"
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

            <div>
              <label class="mb-2 block text-sm font-medium text-text">父级分类</label>
              <select
                v-model="form.parentId"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option :value="null">无，作为顶级分类</option>
                <option v-for="item in categoryOptions" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-text">排序值</label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
            </div>

            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">分类说明</label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="可选，用于说明该分类下内容范围"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
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
              {{ category ? '保存修改' : '创建分类' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
