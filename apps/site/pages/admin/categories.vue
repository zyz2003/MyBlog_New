<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const api = useAdminApi()

const categories = ref<CategoryTreeNode[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingCategory = ref<CategoryTreeNode | null>(null)

function flatten(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap(node => [node, ...flatten(node.children || [])])
}

const flatCategories = computed(() => flatten(categories.value))
const rootCount = computed(() => categories.value.length)

function findCategoryById(nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const child = findCategoryById(node.children || [], id)
    if (child) return child
  }
  return null
}

async function fetchCategories() {
  loading.value = true
  try {
    categories.value = await api.get<CategoryTreeNode[]>('/api/categories/tree')
  }
  finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingCategory.value = null
  showForm.value = true
}

function openEditForm(id: number) {
  editingCategory.value = findCategoryById(categories.value, id)
  showForm.value = true
}

async function handleSubmit(data: { name: string, slug?: string, description: string, parentId: number | null, sortOrder: number }) {
  try {
    if (editingCategory.value) {
      await api.put(`/api/categories/${editingCategory.value.id}`, data)
    }
    else {
      await api.post('/api/categories', data)
    }
    showForm.value = false
    await fetchCategories()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '分类保存失败')
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除这个分类吗？')) return

  try {
    await api.del(`/api/categories/${id}`)
    await fetchCategories()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '分类删除失败')
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.1),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-text">分类管理</h1>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里负责维护文章分类层级、Slug、描述和排序。分类树恢复后，前台归档和内容组织才会稳定。
          </p>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90"
          @click="openCreateForm"
        >
          <span class="i-heroicons-plus h-5 w-5" />
          新建分类
        </button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">分类总数</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ flatCategories.length }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">顶级分类</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ rootCount }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">子分类</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ Math.max(flatCategories.length - rootCount, 0) }}</p>
      </article>
    </section>

    <section
      v-if="loading"
      class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm"
    >
      <div class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-24 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </section>

    <section
      v-else-if="categories.length === 0"
      class="rounded-[28px] border border-dashed border-border/80 bg-surface/70 px-6 py-16 text-center shadow-sm"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-primary">
        <span class="i-heroicons-folder-open h-8 w-8" />
      </div>
      <h3 class="mt-4 text-lg font-black text-text">还没有分类</h3>
      <p class="mt-2 text-sm text-muted">先创建顶级分类，再逐步补充子分类和归档结构。</p>
    </section>

    <section
      v-else
      class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm"
    >
      <AdminCategoriesCategoryTree
        :categories="categories"
        @edit="openEditForm"
        @delete="handleDelete"
      />
    </section>

    <AdminCategoriesCategoryForm
      v-if="showForm"
      :category="editingCategory"
      :all-categories="categories"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>
