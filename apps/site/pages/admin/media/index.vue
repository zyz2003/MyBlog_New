<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMediaLibraryStore } from '~/stores/mediaLibrary'
import { useMediaLibrary } from '~/composables/useMediaLibrary'
import { toast } from 'vue-sonner'
import type { Media } from '@my-blog/database'

// Components
import AdminLayout from '~/components/admin/AdminLayout.vue'
import AdminBreadcrumb from '~/components/admin/Breadcrumb.vue'
import MediaGrid from '~/components/admin/media/MediaGrid.vue'
import UploadArea from '~/components/admin/media/UploadArea.vue'
import MediaPreviewModal from '~/components/admin/media/MediaPreviewModal.vue'
import FolderTree from '~/components/admin/media/FolderTree.vue'
import BulkActions from '~/components/admin/media/BulkActions.vue'
import MediaSelector from '~/components/admin/media/MediaSelector.vue'

// shadcn-vue components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Separator } from '~/components/ui/separator'

// Icons
import { Search, Grid, List, Plus } from 'lucide-vue-next'

const mediaLibraryStore = useMediaLibraryStore()
const mediaLibraryComposable = useMediaLibrary()

// State
const mediaItems = ref<Media[]>([])
const folders = ref<
  Array<{
    id: string
    name: string
    parentId: string | null
    children?: unknown[]
    mediaCount: number
  }>
>([])
const loading = ref(false)
const previewMedia = ref<Media | null>(null)
const showPreviewModal = ref(false)
const showUploadDialog = ref(false)
const showMediaSelector = ref(false)
const searchInput = ref('')
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null)

// Computed
const breadcrumbs = computed(() => [
  { label: '后台管理', href: '/admin' },
  { label: '媒体库', href: '/admin/media' },
])

const selectionCount = computed(() => mediaLibraryStore.selectionCount)

// Methods
const fetchMediaList = async () => {
  loading.value = true
  try {
    const response = await mediaLibraryComposable.fetchMedia({
      folderId: mediaLibraryStore.currentFolderId,
      filterType: mediaLibraryStore.filterType !== 'all' ? mediaLibraryStore.filterType : undefined,
      search: mediaLibraryStore.searchQuery || undefined,
      limit: mediaLibraryStore.pagination.limit,
      offset: mediaLibraryStore.pagination.offset,
    })

    mediaItems.value = response.data
    mediaLibraryStore.setPagination({ total: response.meta.total })
  } catch (error) {
    console.error('Failed to fetch media:', error)
    toast.error('加载媒体失败')
  } finally {
    loading.value = false
  }
}

const fetchFolderTree = async () => {
  try {
    folders.value = await mediaLibraryComposable.fetchFolders()
  } catch (error) {
    console.error('Failed to fetch folders:', error)
  }
}

const handleFolderSelect = (folderId: string | null) => {
  mediaLibraryStore.setFolder(folderId)
  fetchMediaList()
}

const handleViewModeChange = (mode: 'grid' | 'list') => {
  mediaLibraryStore.setViewMode(mode)
}

const handleSearchInput = (value: string) => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  searchDebounceTimer.value = setTimeout(() => {
    mediaLibraryStore.setSearchQuery(value)
    fetchMediaList()
  }, 300)
}

const handleFilterTypeChange = (value: string) => {
  mediaLibraryStore.setFilterType(value as 'all' | 'image' | 'video' | 'document')
  fetchMediaList()
}

const handlePreview = (mediaItem: Media) => {
  previewMedia.value = mediaItem
  showPreviewModal.value = true
}

const handleDelete = async (id: string) => {
  if (!confirm('确定要删除此媒体文件吗？')) return

  try {
    await mediaLibraryComposable.deleteMedia(id)
    toast.success('删除成功')
    fetchMediaList()
  } catch (error) {
    console.error('Failed to delete media:', error)
    toast.error('删除失败')
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectionCount.value} 个媒体文件吗？`)) return

  try {
    await mediaLibraryComposable.bulkDeleteMedia(mediaLibraryStore.selectedMedia)
    toast.success('批量删除成功')
    mediaLibraryStore.clearSelection()
    fetchMediaList()
  } catch (error) {
    console.error('Failed to bulk delete:', error)
    toast.error('批量删除失败')
  }
}

const handleBulkMove = async (folderId: string | null) => {
  try {
    await mediaLibraryComposable.bulkMoveMedia(mediaLibraryStore.selectedMedia, folderId)
    toast.success('移动成功')
    mediaLibraryStore.clearSelection()
    fetchMediaList()
  } catch (error) {
    console.error('Failed to bulk move:', error)
    toast.error('移动失败')
  }
}

const handleUploadComplete = () => {
  fetchMediaList()
  showUploadDialog.value = false
  toast.success('上传成功')
}

const handleFolderCreate = async (name: string, parentId: string | null) => {
  try {
    await mediaLibraryComposable.createFolder(name, parentId)
    toast.success('文件夹创建成功')
    fetchFolderTree()
  } catch (error) {
    console.error('Failed to create folder:', error)
    toast.error('创建文件夹失败')
  }
}

const handleFolderRename = async (id: string, name: string) => {
  try {
    await mediaLibraryComposable.updateFolder(id, name)
    toast.success('重命名成功')
    fetchFolderTree()
  } catch (error) {
    console.error('Failed to rename folder:', error)
    toast.error('重命名失败')
  }
}

const handleFolderDelete = async (id: string) => {
  try {
    await mediaLibraryComposable.deleteFolder(id)
    toast.success('删除成功')
    fetchFolderTree()
    fetchMediaList()
  } catch (error) {
    console.error('Failed to delete folder:', error)
    toast.error('删除文件夹失败')
  }
}

const handleMediaInsert = (urls: string[]) => {
  // Handle media insertion (for future integration with post editor)
  console.log('Insert media:', urls)
  toast.success(`已选择 ${urls.length} 个媒体文件`)
}

// Watch for changes
watch(
  () => mediaLibraryStore.currentFolderId,
  () => fetchMediaList()
)

// Lifecycle
onMounted(() => {
  fetchMediaList()
  fetchFolderTree()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4">
        <div>
          <AdminBreadcrumb :items="breadcrumbs" />
          <h1 class="text-2xl font-bold mt-2">媒体库</h1>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="showMediaSelector = true"> 选择媒体 </Button>
          <Button @click="showUploadDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            上传文件
          </Button>
        </div>
      </div>

      <Separator class="my-4" />

      <!-- Main Content -->
      <div class="flex flex-1 overflow-hidden gap-4">
        <!-- Sidebar: Folder Tree -->
        <div class="w-64 flex-shrink-0">
          <div class="bg-card rounded-lg border p-4 h-full overflow-auto">
            <h3 class="text-sm font-medium mb-3">文件夹</h3>
            <FolderTree
              :folders="folders"
              :selected-folder-id="mediaLibraryStore.currentFolderId"
              :loading="loading"
              @select="handleFolderSelect"
              @create="handleFolderCreate"
              @rename="handleFolderRename"
              @delete="handleFolderDelete"
            />
          </div>
        </div>

        <!-- Main: Media Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Toolbar -->
          <div class="flex items-center gap-2 mb-4">
            <!-- Search -->
            <div class="relative flex-1 max-w-sm">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <Input
                v-model="searchInput"
                placeholder="搜索媒体文件..."
                class="pl-9"
                @input="handleSearchInput($event.target.value)"
              />
            </div>

            <!-- Filter Type -->
            <Select
              v-model="mediaLibraryStore.filterType"
              @update:model-value="handleFilterTypeChange"
            >
              <SelectTrigger class="w-[120px]">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="document">文档</SelectItem>
              </SelectContent>
            </Select>

            <!-- View Mode -->
            <div class="flex items-center border rounded-md ml-auto">
              <Button
                :variant="mediaLibraryStore.viewMode === 'grid' ? 'default' : 'ghost'"
                size="sm"
                class="rounded-none border-r"
                @click="handleViewModeChange('grid')"
              >
                <Grid class="w-4 h-4" />
              </Button>
              <Button
                :variant="mediaLibraryStore.viewMode === 'list' ? 'default' : 'ghost'"
                size="sm"
                class="rounded-none"
                @click="handleViewModeChange('list')"
              >
                <List class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- Media Grid/List -->
          <div class="flex-1 overflow-auto">
            <MediaGrid
              :media="mediaItems"
              :loading="loading"
              :view-mode="mediaLibraryStore.viewMode"
              :selectable="true"
              :model-value="mediaLibraryStore.selectedMedia"
              @update:model-value="mediaLibraryStore.setSelectedMedia($event)"
              @update:view-mode="handleViewModeChange"
              @preview="handlePreview"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <BulkActions
        :selected-count="selectionCount"
        :folders="folders"
        @delete="handleBulkDelete"
        @move="handleBulkMove"
        @clear="mediaLibraryStore.clearSelection"
      />

      <!-- Upload Dialog -->
      <Dialog v-model:open="showUploadDialog">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传媒体文件</DialogTitle>
          </DialogHeader>
          <UploadArea
            :folder-id="mediaLibraryStore.currentFolderId || undefined"
            @upload-complete="handleUploadComplete"
          />
        </DialogContent>
      </Dialog>

      <!-- Preview Modal -->
      <MediaPreviewModal
        v-model:open="showPreviewModal"
        :media="previewMedia"
        :all-media="mediaItems"
        @delete="handleDelete"
      />

      <!-- Media Selector -->
      <MediaSelector
        v-model:open="showMediaSelector"
        :multiple="true"
        @select="handleMediaInsert"
      />
    </div>
  </AdminLayout>
</template>

<style scoped>
/* Custom styles for media library page */
</style>
