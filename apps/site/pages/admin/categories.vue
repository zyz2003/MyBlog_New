<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

const tree = ref<CategoryTreeNode[]>([])
const allCategories = ref<CategoryTreeNode[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingCategory = ref<CategoryTreeNode | null>(null)

async function fetchTree() {
  loading.value = true
  try {
    const [treeData, flatData] = await Promise.all([
      api.get<CategoryTreeNode[]>('/api/categories/tree'),
      api.get<CategoryTreeNode[]>('/api/categories'),
    ])
    tree.value = treeData
    allCategories.value = flatData
  }
  catch (e) {
    console.error('Failed to fetch categories:', e)
  }
  finally {
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
  const category = findCategoryById(tree.value, id)
  if (category) {
    editingCategory.value = category
    showForm.value = true
  }
}

async function handleSubmit(data: { name: string; slug: string; description: string; parentId: number | null; sortOrder: number }) {
  try {
    if (editingCategory.value) {
      await api.put(`/api/categories/${editingCategory.value.id}`, data)
    }
    else {
      await api.post('/api/categories', data)
    }
    showForm.value = false
    editingCategory.value = null
    await fetchTree()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '操作失败'
    alert(message)
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定要删除这个分类吗？')) return

  try {
    await api.del(`/api/categories/${id}`)
    await fetchTree()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '删除失败'
    alert(message)
  }
}

onMounted(() => {
  fetchTree()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">分类管理</h1>
      </div>
      <button
        class="btn-primary flex items-center gap-2"
        @click="openCreateForm"
      >
        <span class="i-heroicons-plus w-5 h-5" />
        新建分类
      </button>
    </div>

    <!-- Category tree -->
    <div class="card">
      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3 p-4">
        <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded animate-pulse" />
      </div>

      <!-- Empty state -->
      <div v-else-if="tree.length === 0" class="text-center py-12">
        <span class="i-heroicons-folder w-16 h-16 mx-auto text-gray-300 block mb-4" />
        <p class="text-gray-500 mb-4">No categories yet</p>
        <button
          class="btn-primary px-4 py-2 text-sm"
          @click="openCreateForm"
        >
          创建第一个分类
        </button>
      </div>

      <!-- Tree -->
      <div v-else class="p-2">
        <AdminCategoriesCategoryTree
          :categories="tree"
          :level="0"
          @edit="openEditForm"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Category form modal -->
    <AdminCategoriesCategoryForm
      v-if="showForm"
      :category="editingCategory"
      :all-categories="tree"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>
