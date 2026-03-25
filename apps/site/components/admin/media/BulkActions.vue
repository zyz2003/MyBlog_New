<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Trash2, FolderMove, X, Check } from 'lucide-vue-next'

interface Props {
  selectedCount: number
  folders?: Array<{ id: string; name: string }>
}

const props = withDefaults(defineProps<Props>(), {
  folders: () => [],
})

const emit = defineEmits<{
  'delete': []
  'move': [folderId: string | null]
  'clear': []
}>()

const showDeleteDialog = computed(() => isDeleteDialogOpen.value)
const isDeleteDialogOpen = computed({
  get: () => deleteDialogOpen.value,
  set: (val) => (deleteDialogOpen.value = val),
})

const deleteDialogOpen = ref(false)
const moveDropdownOpen = ref(false)

const confirmDelete = () => {
  emit('delete')
  deleteDialogOpen.value = false
}

const confirmMove = (folderId: string | null) => {
  emit('move', folderId)
  moveDropdownOpen.value = false
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

// Move folder selection
const moveFolderId = ref<string | null>(null)
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        class="flex items-center gap-2 px-4 py-3 bg-card border rounded-lg shadow-lg"
      >
        <!-- Selection info -->
        <div class="flex items-center gap-2 pr-4 border-r">
          <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {{ selectedCount }}
          </div>
          <span class="text-sm font-medium">
            已选择 {{ selectedCount }} 项
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          <!-- Move to folder -->
          <DropdownMenu v-model:open="moveDropdownOpen">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderMove class="w-4 h-4 mr-1" />
                移动
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="confirmMove(null)">
                <FolderMove class="w-4 h-4 mr-2" />
                所有媒体 (无文件夹)
              </DropdownMenuItem>
              <template v-for="folder in folders" :key="folder.id">
                <DropdownMenuItem @click="confirmMove(folder.id)">
                  <span class="ml-4">{{ folder.name }}</span>
                </DropdownMenuItem>
              </template>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Delete -->
          <Button variant="outline" size="sm" @click="deleteDialogOpen = true">
            <Trash2 class="w-4 h-4 mr-1" />
            删除
          </Button>

          <!-- Clear selection -->
          <Button variant="ghost" size="sm" @click="emit('clear')">
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Confirmation Dialog -->
  <Dialog v-model:open="deleteDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>确认删除</DialogTitle>
        <DialogDescription>
          此操作将无法恢复。确定要删除选中的 {{ selectedCount }} 个媒体文件吗？
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" @click="deleteDialogOpen = false">
          取消
        </Button>
        <Button variant="destructive" @click="confirmDelete">
          <Trash2 class="w-4 h-4 mr-2" />
          删除
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Bulk actions bar animation */
</style>
