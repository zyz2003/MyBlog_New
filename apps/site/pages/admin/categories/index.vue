<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategoryAdminStore } from '~/stores/categoryAdmin'
import { useCategoryAdmin } from '~/composables/useCategoryAdmin'
import CategoryTreeTable, { type CategoryTreeNode } from '~/components/admin/categories/CategoryTreeTable.vue'
import CategoryForm from '~/components/admin/categories/CategoryForm.vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import AdminBreadcrumb from '~/components/admin/Breadcrumb.vue'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import { toast } from 'vue-sonner'
import { Plus, FolderPlus } from 'lucide-vue-next'

const store = useCategoryAdminStore()
const { createCategory, updateCategory, deleteCategory, reorderCategories, fetchCategories } = useCategoryAdmin()

const loading = ref(false)
const deleteConfirmDialog = ref(false)
const categoryToDelete = ref<CategoryTreeNode | null>(null)

// 加载分类列表
const loadCategories = async () => {
  loading.value = true
  try {
    store.categories = await fetchCategories({ tree: true })
  } catch (error) {
    toast.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
})

// 打开创建对话框
const openCreateDialog = () => {
  store.openCreateDialog()
}

// 处理表单提交
const handleSubmit = async (data: {
  name: string
  slug: string
  parentId: string | null
  description?: string
  color?: string
}) => {
  try {
    if (store.editingCategory) {
      await updateCategory(store.editingCategory.id, data)
      toast.success('分类已更新')
    } else {
      await createCategory(data)
      toast.success('分类已创建')
    }
    store.closeDialog()
    await loadCategories()
  } catch (error) {
    toast.error('操作失败')
  }
}

// 确认删除
const confirmDelete = (category: CategoryTreeNode) => {
  categoryToDelete.value = category
  deleteConfirmDialog.value = true
}

// 执行删除
const handleDelete = async () => {
  if (!categoryToDelete.value) return

  try {
    await deleteCategory(categoryToDelete.value.id)
    toast.success('分类已删除')
    deleteConfirmDialog.value = false
    categoryToDelete.value = null
    await loadCategories()
  } catch (error) {
    toast.error('删除失败')
  }
}

// 添加子分类
const handleAddSubCategory = (parent: CategoryTreeNode) => {
  store.openCreateDialog()
  // 设置父分类（需要修改表单组件支持）
  toast.info('将创建子分类，父分类：' + parent.name)
}

// 处理拖拽排序
const handleReorder = async (
  fromId: string,
  toId: string,
  dropPosition: 'before' | 'after' | 'inside'
) => {
  try {
    await reorderCategories(fromId, toId, dropPosition)
    await loadCategories()
    toast.success('排序已更新')
  } catch (error) {
    toast.error('排序更新失败')
  }
}
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen bg-background">
      <!-- 头部 -->
      <div class="container mx-auto px-4 py-6">
        <!-- 面包屑 -->
        <AdminBreadcrumb
          :items="[
            { title: '后台管理', href: '/admin' },
            { title: '分类管理' }
          ]"
        />

        <!-- 页面标题和操作 -->
        <div class="flex items-center justify-between mt-4">
          <div>
            <h1 class="text-2xl font-bold">分类管理</h1>
            <p class="text-sm text-muted-foreground mt-1">
              管理文章分类，支持多级分类和拖拽排序
            </p>
          </div>
          <Button @click="openCreateDialog">
            <Plus class="w-4 h-4 mr-2" />
            创建分类
          </Button>
        </div>
      </div>

      <!-- 分类表格 -->
      <div class="container mx-auto px-4 pb-6">
        <CategoryTreeTable
          :categories="store.categories"
          :loading="loading"
          @edit="store.openEditDialog"
          @delete="confirmDelete"
          @addSubCategory="handleAddSubCategory"
          @reorder="handleReorder"
        />
      </div>

      <!-- 新增/编辑对话框 -->
      <CategoryForm
        :open="store.dialogOpen"
        :category="store.editingCategory"
        :categories="store.categories"
        @update:open="store.closeDialog"
        @submit="handleSubmit"
      />

      <!-- 删除确认对话框 -->
      <Dialog :open="deleteConfirmDialog" @update:open="deleteConfirmDialog = false">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除分类"{{ categoryToDelete?.name }}"吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="deleteConfirmDialog = false">
              取消
            </Button>
            <Button variant="destructive" @click="handleDelete">
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </AdminLayout>
</template>
