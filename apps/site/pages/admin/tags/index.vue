<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTagAdminStore } from '~/stores/tagAdmin'
import { useTagAdmin } from '~/composables/useTagAdmin'
import type { TagWithCount } from '~/stores/tagAdmin'
import TagList from '~/components/admin/tags/TagList.vue'
import TagForm from '~/components/admin/tags/TagForm.vue'
import TagCloud from '~/components/admin/tags/TagCloud.vue'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { toast } from 'vue-sonner'
import { Plus, Cloud, List } from 'lucide-vue-next'

const store = useTagAdminStore()
const { createTag, updateTag, deleteTag, fetchTags, fetchTagCloud } = useTagAdmin()

const loading = ref(false)
const deleteConfirmDialog = ref(false)
const tagToDelete = ref<TagWithCount | null>(null)
const activeTab = ref<'list' | 'cloud'>('list')
const tagCloudData = ref<TagWithCount[]>([])

// 加载标签列表
const loadTags = async (page = 1, search = '') => {
  loading.value = true
  try {
    const result = await fetchTags({ page, search, pageSize: 20 })
    store.tags = result.items
    store.pagination.total = result.total
    store.pagination.current = page
  } catch {
    toast.error('加载标签失败')
  } finally {
    loading.value = false
  }
}

// 加载标签云
const loadTagCloud = async () => {
  try {
    tagCloudData.value = await fetchTagCloud(50)
  } catch (error) {
    console.error('Failed to load tag cloud:', error)
  }
}

onMounted(() => {
  loadTags()
  loadTagCloud()
})

// 打开创建对话框
const openCreateDialog = () => {
  store.openCreateDialog()
}

// 处理表单提交
const handleSubmit = async (data: {
  name: string
  slug: string
  description?: string
  color: string
}) => {
  try {
    if (store.editingTag) {
      await updateTag(store.editingTag.id, data)
      toast.success('标签已更新')
    } else {
      await createTag(data)
      toast.success('标签已创建')
    }
    store.closeDialog()
    await loadTags(store.pagination.current)
    await loadTagCloud()
  } catch {
    toast.error('操作失败')
  }
}

// 确认删除
const confirmDelete = (tag: TagWithCount) => {
  tagToDelete.value = tag
  deleteConfirmDialog.value = true
}

// 执行删除
const handleDelete = async () => {
  if (!tagToDelete.value) return

  try {
    await deleteTag(tagToDelete.value.id)
    toast.success('标签已删除')
    deleteConfirmDialog.value = false
    tagToDelete.value = null
    await loadTags(store.pagination.current)
    await loadTagCloud()
  } catch {
    toast.error('删除失败')
  }
}

// 标签云点击
const handleTagClick = (tag: TagWithCount) => {
  toast.info(`点击了标签：${tag.name}`)
  // 可以跳转到相关文章列表或筛选
}
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen bg-background">
      <!-- 头部 -->
      <div class="container mx-auto px-4 py-6">
        <!-- 面包屑 -->
        <AdminBreadcrumb :items="[{ title: '后台管理', href: '/admin' }, { title: '标签管理' }]" />

        <!-- 页面标题和操作 -->
        <div class="flex items-center justify-between mt-4">
          <div>
            <h1 class="text-2xl font-bold">标签管理</h1>
            <p class="text-sm text-muted-foreground mt-1">管理文章标签，支持标签云可视化</p>
          </div>
          <Button @click="openCreateDialog">
            <Plus class="w-4 h-4 mr-2" />
            创建标签
          </Button>
        </div>
      </div>

      <!-- 标签管理内容 -->
      <div class="container mx-auto px-4 pb-6">
        <!-- Tab 切换 -->
        <Tabs v-model="activeTab" class="space-y-4">
          <TabsList>
            <TabsTrigger value="list">
              <List class="w-4 h-4 mr-2" />
              列表视图
            </TabsTrigger>
            <TabsTrigger value="cloud">
              <Cloud class="w-4 h-4 mr-2" />
              标签云
            </TabsTrigger>
          </TabsList>

          <!-- 列表视图 -->
          <TabsContent value="list">
            <TagList
              :tags="store.tags"
              :loading="loading"
              :pagination="store.pagination"
              @edit="store.openEditDialog"
              @delete="confirmDelete"
              @page-change="loadTags"
              @search="loadTags"
            />
          </TabsContent>

          <!-- 标签云视图 -->
          <TabsContent value="cloud">
            <TagCloud :tags="tagCloudData" :loading="loading" @tag-click="handleTagClick" />
          </TabsContent>
        </Tabs>
      </div>

      <!-- 新增/编辑对话框 -->
      <TagForm
        :open="store.dialogOpen"
        :tag="store.editingTag"
        @update:open="store.closeDialog"
        @submit="handleSubmit"
      />

      <!-- 删除确认对话框 -->
      <Dialog :open="deleteConfirmDialog" @update:open="deleteConfirmDialog = false">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除标签"{{ tagToDelete?.name }}"吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="deleteConfirmDialog = false"> 取消 </Button>
            <Button variant="destructive" @click="handleDelete"> 删除 </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </AdminLayout>
</template>
