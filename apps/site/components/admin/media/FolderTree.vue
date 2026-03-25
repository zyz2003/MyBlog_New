<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import {
  Folder,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  FileBox,
} from 'lucide-vue-next'

interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  children?: MediaFolder[]
  mediaCount: number
}

interface Props {
  folders: MediaFolder[]
  selectedFolderId?: string | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedFolderId: null,
  loading: false,
})

const emit = defineEmits<{
  'select': [folderId: string | null]
  'create': [name: string, parentId: string | null]
  'rename': [id: string, name: string]
  'delete': [id: string]
}>()

const expandedFolders = ref<Set<string>>(new Set())
const contextMenuTarget = ref<{ folder: MediaFolder; parentId: string | null } | null>(null)
const isCreateDialogOpen = ref(false)
const isRenameDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const newFolderName = ref('')
const renameFolderName = ref('')
const targetFolder = ref<MediaFolder | null>(null)

// Toggle folder expansion
const toggleExpand = (folderId: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}

// Select folder
const selectFolder = (folderId: string | null, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  emit('select', folderId)
}

// Open create dialog
const openCreateDialog = (parentId: string | null, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  contextMenuTarget.value = { folder: { id: 'new', name: '', parentId } as MediaFolder, parentId }
  newFolderName.value = ''
  isCreateDialogOpen.value = true
}

// Open rename dialog
const openRenameDialog = (folder: MediaFolder, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  targetFolder.value = folder
  renameFolderName.value = folder.name
  isRenameDialogOpen.value = true
}

// Open delete dialog
const openDeleteDialog = (folder: MediaFolder, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  targetFolder.value = folder
  isDeleteDialogOpen.value = true
}

// Create folder
const handleCreate = () => {
  if (newFolderName.value.trim()) {
    emit('create', newFolderName.value.trim(), contextMenuTarget.value?.parentId || null)
    isCreateDialogOpen.value = false
  }
}

// Rename folder
const handleRename = () => {
  if (renameFolderName.value.trim() && targetFolder.value) {
    emit('rename', targetFolder.value.id, renameFolderName.value.trim())
    isRenameDialogOpen.value = false
  }
}

// Delete folder
const handleDelete = () => {
  if (targetFolder.value) {
    emit('delete', targetFolder.value.id)
    isDeleteDialogOpen.value = false
  }
}

// Check if folder has children
const hasChildren = (folder: MediaFolder) => {
  return folder.children && folder.children.length > 0
}

// Check if folder is expanded
const isExpanded = (folderId: string) => {
  return expandedFolders.value.has(folderId)
}

// Calculate total media count
const totalMediaCount = computed(() => {
  const countMedia = (folders: MediaFolder[]): number => {
    return folders.reduce((sum, f) => sum + f.mediaCount + countMedia(f.children || []), 0)
  }
  return countMedia(props.folders)
})
</script>

<template>
  <div class="folder-tree w-full">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
    </div>

    <!-- Folder tree -->
    <template v-else>
      <!-- Root: All Media -->
      <div
        :class="[
          'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors mb-1',
          selectedFolderId === null
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted',
        ]"
        @click="selectFolder(null)"
      >
        <FileBox class="w-4 h-4 flex-shrink-0" />
        <span class="text-sm truncate flex-1">所有媒体</span>
        <span
          v-if="totalMediaCount > 0"
          :class="[
            'text-xs px-1.5 py-0.5 rounded-full',
            selectedFolderId === null
              ? 'bg-primary-foreground/20'
              : 'bg-muted-foreground/20',
          ]"
        >
          {{ totalMediaCount }}
        </span>
      </div>

      <!-- Folder list -->
      <div class="space-y-0.5">
        <template v-for="folder in folders" :key="folder.id">
          <FolderTreeItem
            :folder="folder"
            :level="0"
            :selected-folder-id="selectedFolderId"
            @select="selectFolder"
            @create="openCreateDialog"
            @rename="openRenameDialog"
            @delete="openDeleteDialog"
            @toggle-expand="toggleExpand"
          />
        </template>
      </div>
    </template>

    <!-- Create Folder Dialog -->
    <Dialog v-model:open="isCreateDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建文件夹</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <Label for="new-folder-name">文件夹名称</Label>
          <Input
            id="new-folder-name"
            v-model="newFolderName"
            placeholder="输入文件夹名称"
            class="mt-2"
            @keyup.enter="handleCreate"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="isCreateDialogOpen = false">取消</Button>
          <Button @click="handleCreate" :disabled="!newFolderName.trim()">
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Rename Folder Dialog -->
    <Dialog v-model:open="isRenameDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重命名文件夹</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <Label for="rename-folder-name">文件夹名称</Label>
          <Input
            id="rename-folder-name"
            v-model="renameFolderName"
            placeholder="输入文件夹名称"
            class="mt-2"
            @keyup.enter="handleRename"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="isRenameDialogOpen = false">取消</Button>
          <Button @click="handleRename" :disabled="!renameFolderName.trim()">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Folder Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除文件夹</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm text-muted-foreground">
            确定要删除文件夹"<strong>{{ targetFolder?.name }}</strong>"吗？
          </p>
          <p
            v-if="targetFolder && targetFolder.mediaCount > 0"
            class="text-sm text-destructive mt-2"
          >
            警告：此文件夹包含 {{ targetFolder.mediaCount }} 个媒体文件，删除后这些文件将失去文件夹分类。
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="isDeleteDialogOpen = false">取消</Button>
          <Button variant="destructive" @click="handleDelete">
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<!-- Recursive Folder Tree Item Component -->
<script lang="ts">
import { defineComponent, h, computed } from 'vue'
import type { PropType } from 'vue'
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'

interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  children?: MediaFolder[]
  mediaCount: number
}

export default defineComponent({
  name: 'FolderTreeItem',
  props: {
    folder: {
      type: Object as PropType<MediaFolder>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    selectedFolderId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ['select', 'create', 'rename', 'delete', 'toggle-expand'],
  setup(props, { emit }) {
    const isSelected = computed(() => props.selectedFolderId === props.folder.id)
    const hasChild = computed(() => props.folder.children && props.folder.children.length > 0)
    const expanded = computed(() => (props.folder as any).expanded || false)

    const handleSelect = (event: Event) => {
      event.stopPropagation()
      emit('select', props.folder.id)
    }

    const handleToggle = (event: Event) => {
      event.stopPropagation()
      emit('toggle-expand', props.folder.id)
    }

    const handleCreate = (event: Event) => {
      event.stopPropagation()
      emit('create', null, props.folder.id)
    }

    const handleRename = (event: Event) => {
      event.stopPropagation()
      emit('rename', props.folder.id)
    }

    const handleDelete = (event: Event) => {
      event.stopPropagation()
      emit('delete', props.folder.id)
    }

    return () => [
      h(
        'div',
        {
          class: [
            'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors',
            isSelected.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted',
          ].join(' '),
          style: { paddingLeft: `${props.level * 12 + 8}px` },
          onClick: handleSelect,
        },
        [
          h(
            'button',
            {
              class: [
                'p-0.5 rounded hover:bg-muted-foreground/20 transition-colors',
                !hasChild.value && 'invisible',
              ].join(' '),
              onClick: handleToggle,
            },
            [
              expanded.value
                ? h(ChevronDownIcon, { class: 'w-4 h-4' })
                : h(ChevronRightIcon, { class: 'w-4 h-4' }),
            ]
          ),
          expanded.value
            ? h(FolderOpenIcon, { class: 'w-4 h-4 flex-shrink-0' })
            : h(FolderIcon, { class: 'w-4 h-4 flex-shrink-0' }),
          h(
            'span',
            { class: 'text-sm truncate flex-1' },
            props.folder.name
          ),
          props.folder.mediaCount > 0
            ? h(
                'span',
                {
                  class: [
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isSelected.value
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted-foreground/20',
                  ].join(' '),
                },
                String(props.folder.mediaCount)
              )
            : null,
          h(
            DropdownMenu,
            {},
            {
              default: () => [
                h(
                  DropdownMenuTrigger,
                  { asChild: true },
                  {
                    default: () => [
                      h(
                        Button,
                        {
                          variant: 'ghost',
                          size: 'icon',
                          class: 'h-6 w-6 opacity-0 hover:opacity-100 transition-opacity',
                          onClick: (e: Event) => e.stopPropagation(),
                        },
                        {
                          default: () => [h(MoreVertical, { class: 'w-3 h-3' })],
                        }
                      ),
                    ],
                  }
                ),
                h(
                  DropdownMenuContent,
                  { align: 'end' },
                  {
                    default: () => [
                      h(
                        DropdownMenuItem,
                        { onClick: handleCreate },
                        {
                          default: () => [
                            h(Plus, { class: 'w-4 h-4 mr-2' }),
                            ' 新建子文件夹',
                          ],
                        }
                      ),
                      h(
                        DropdownMenuItem,
                        { onClick: handleRename },
                        {
                          default: () => [
                            h(Pencil, { class: 'w-4 h-4 mr-2' }),
                            ' 重命名',
                          ],
                        }
                      ),
                      h(DropdownMenuSeparator),
                      h(
                        DropdownMenuItem,
                        {
                          class: 'text-destructive focus:text-destructive',
                          onClick: handleDelete,
                        },
                        {
                          default: () => [
                            h(Trash2, { class: 'w-4 h-4 mr-2' }),
                            ' 删除',
                          ],
                        }
                      ),
                    ],
                  }
                ),
              ],
            }
          ),
        ]
      ),
      hasChild.value && expanded.value
        ? h(
            'div',
            { class: 'folder-children ml-2' },
            props.folder.children!.map((child) =>
              h(FolderTreeItem, {
                key: child.id,
                folder: child,
                level: props.level + 1,
                selectedFolderId: props.selectedFolderId,
                onVnodeMounted(vnode) {
                  // Pass expanded state via props
                  vnode.props = vnode.props || {}
                  ;(vnode.props as any).expanded = expanded.value
                },
                onSelect: (id: string | null) => emit('select', id),
                onCreate: (name: string, parentId: string | null) => emit('create', name, parentId),
                onRename: (id: string) => emit('rename', id),
                onDelete: (id: string) => emit('delete', id),
                onToggleExpand: (id: string) => emit('toggle-expand', id),
              })
            )
          )
        : null,
    ]
  },
})
</script>

<style scoped>
.folder-tree {
  @apply w-full;
}

.folder-tree-item {
  @apply space-y-0.5;
}

.folder-children {
  @apply ml-2;
}
</style>
