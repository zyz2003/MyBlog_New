<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const api = useAdminApi()

const tree = ref<CategoryTreeNode[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingCategory = ref<CategoryTreeNode | null>(null)

async function fetchTree() {
  loading.value = true
  try {
    tree.value = await api.get<CategoryTreeNode[]>('/api/categories/tree')
  } catch (e) {
    console.error('Failed to fetch categories:', e)
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingCategory.value = null
  showForm.value = true
}

function findCategoryById(nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findCategoryById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function openEditForm(id: number) {
  editingCategory.value = findCategoryById(tree.value, id)
  showForm.value = true
}

async function handleSubmit(data: { name: string; slug: string; description: string; parentId: number | null; sortOrder: number }) {
  try {
    if (editingCategory.value) {
      await api.put(`/api/categories/${editingCategory.value.id}`, data)
    } else {
      await api.post('/api/categories', data)
    }
    showForm.value = false
    await fetchTree()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '操作失败')
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除？')) return
  try {
    await api.del(`/api/categories/${id}`)
    await fetchTree()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(() => {
  fetchTree()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/icons/folder.svg" class="w-7 h-7" alt="">
        <div>
          <h1 class="text-2xl font-bold text-text">分类管理</h1>
          <p class="text-sm text-muted">{{ tree.length }} 个分类</p>
        </div>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        @click="openCreateForm"
      >
        <img src="/icons/add.svg" class="w-4 h-4" alt="">
        新建
      </button>
    </div>

    <!-- Category Grid -->
    <div class="bg-surface rounded-2xl border border-border">
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        <div v-for="i in 6" :key="i" class="h-28 bg-surface-2 rounded-xl animate-pulse" />
      </div>

      <!-- Empty -->
      <div v-else-if="tree.length === 0" class="flex flex-col items-center justify-center py-16">
        <img src="/icons/folder.svg" class="w-12 h-12 text-muted/20 mb-3" alt="">
        <p class="text-muted mb-4">暂无分类</p>
        <button
          class="px-4 py-2 rounded-xl bg-primary text-white text-sm cursor-pointer"
          @click="openCreateForm"
        >
          创建分类
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AdminCategoriesCategoryTree
            :categories="tree"
            @edit="openEditForm"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <AdminCategoriesCategoryForm
      v-if="showForm"
      :category="editingCategory"
      :all-categories="tree"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>