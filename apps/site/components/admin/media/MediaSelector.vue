<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Upload, Link as LinkIcon, Check } from 'lucide-vue-next'
import type { Media } from '@my-blog/database'
import MediaGrid from './MediaGrid.vue'
import FolderTree from './FolderTree.vue'
import UploadArea from './UploadArea.vue'

interface Props {
  open: boolean
  multiple?: boolean
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: 'image/*',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [urls: string[]]
}>()

const selectedMedia = ref<string[]>([])
const activeTab = ref<'library' | 'upload' | 'url'>('library')
const imageUrl = ref('')
const isSubmitting = ref(false)

// Mock media data (in real implementation, this would come from API)
const mediaItems = ref<Media[]>([])
const folders = ref<Array<{ id: string; name: string; parentId: string | null; children?: unknown[]; mediaCount: number }>>([])
const currentFolderId = ref<string | null>(null)

const hasSelection = computed(() => selectedMedia.value.length > 0)

const confirmSelection = () => {
  if (selectedMedia.value.length > 0) {
    emit('select', selectedMedia.value)
    emit('update:open', false)
    selectedMedia.value = []
  }
}

const insertUrl = () => {
  if (imageUrl.value.trim()) {
    emit('select', [imageUrl.value.trim()])
    emit('update:open', false)
    imageUrl.value = ''
  }
}

const handleUploadComplete = (results: Media[]) => {
  // Add newly uploaded media to the list
  mediaItems.value.unshift(...results)
  // Switch to library tab
  activeTab.value = 'library'
}

const toggleSelection = (url: string) => {
  if (!props.multiple) {
    selectedMedia.value = [url]
  } else {
    const index = selectedMedia.value.indexOf(url)
    if (index > -1) {
      selectedMedia.value.splice(index, 1)
    } else {
      selectedMedia.value.push(url)
    }
  }
}

// Reset state when dialog closes
watch(
  () => props.open,
  (newOpen) => {
    if (!newOpen) {
      selectedMedia.value = []
      imageUrl.value = ''
      activeTab.value = 'library'
    }
  }
)

// Fetch media and folders when dialog opens
watch(
  () => props.open,
  async (newOpen) => {
    if (newOpen) {
      // In real implementation, fetch from API
      // For now, using mock data
      await fetchMedia()
      await fetchFolders()
    }
  }
)

const fetchMedia = async () => {
  // Mock implementation
  mediaItems.value = []
}

const fetchFolders = async () => {
  // Mock implementation
  folders.value = []
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-4xl h-[70vh] flex flex-col p-0">
      <!-- Header -->
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle>选择媒体</DialogTitle>
      </DialogHeader>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="library">
              媒体库
            </TabsTrigger>
            <TabsTrigger value="upload">
              上传
            </TabsTrigger>
            <TabsTrigger value="url">
              外链
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Library Tab -->
        <TabsContent value="library" class="flex-1 overflow-hidden mt-0">
          <div class="flex h-full">
            <!-- Folder Tree Sidebar -->
            <div class="w-48 border-r overflow-auto py-4">
              <FolderTree
                :folders="folders"
                :selected-folder-id="currentFolderId"
                @select="currentFolderId = $event"
              />
            </div>

            <!-- Media Grid -->
            <div class="flex-1 overflow-auto p-4">
              <MediaGrid
                :media="mediaItems"
                :selectable="true"
                :model-value="selectedMedia"
                :show-actions="false"
                @update:model-value="selectedMedia = $event"
              />
            </div>
          </div>
        </TabsContent>

        <!-- Upload Tab -->
        <TabsContent value="upload" class="flex-1 overflow-hidden mt-0">
          <div class="h-full overflow-auto p-6">
            <UploadArea
              :folder-id="currentFolderId || undefined"
              @upload-complete="handleUploadComplete"
            />
          </div>
        </TabsContent>

        <!-- URL Tab -->
        <TabsContent value="url" class="flex-1 overflow-hidden mt-0">
          <div class="h-full flex items-center justify-center p-6">
            <div class="w-full max-w-md space-y-4">
              <div>
                <Label for="image-url">图片 URL</Label>
                <div class="flex gap-2 mt-2">
                  <Input
                    id="image-url"
                    v-model="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    @keyup.enter="insertUrl"
                  />
                  <Button @click="insertUrl" :disabled="!imageUrl.trim()">
                    插入
                  </Button>
                </div>
              </div>

              <!-- Preview -->
              <div
                v-if="imageUrl"
                class="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden"
              >
                <img
                  :src="imageUrl"
                  alt="Preview"
                  class="max-w-full max-h-full object-contain"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <!-- Footer -->
      <div class="px-6 pb-6 border-t pt-4 flex justify-between items-center">
        <div class="text-sm text-muted-foreground">
          <template v-if="activeTab === 'library'">
            <span v-if="selectedMedia.length > 0">
              已选择 {{ selectedMedia.length }} 项
            </span>
            <span v-else>
              从媒体库中选择
            </span>
          </template>
          <template v-else-if="activeTab === 'upload'">
            上传文件到媒体库
          </template>
          <template v-else>
            使用外链图片
          </template>
        </div>

        <div class="flex gap-2">
          <Button variant="ghost" @click="emit('update:open', false)">
            取消
          </Button>
          <Button
            v-if="activeTab === 'library'"
            @click="confirmSelection"
            :disabled="!hasSelection"
          >
            <Check class="w-4 h-4 mr-2" />
            插入{{ selectedMedia.length > 0 ? `(${selectedMedia.length})` : '' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Custom styles for media selector */
</style>
