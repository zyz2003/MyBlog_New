<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const props = defineProps<{
  categories: CategoryTreeNode[]
  level?: number
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

const expandedIds = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  }
  else {
    expandedIds.value.add(id)
  }
}

function isExpanded(id: number): boolean {
  return expandedIds.value.has(id)
}

function hasChildren(node: CategoryTreeNode): boolean {
  return node.children && node.children.length > 0
}
</script>

<template>
  <ul class="space-y-1">
    <li
      v-for="node in categories"
      :key="node.id"
    >
      <div
        class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group"
        :style="{ paddingLeft: `${(level || 0) * 24 + 12}px` }"
      >
        <!-- Expand/collapse toggle -->
        <button
          v-if="hasChildren(node)"
          class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-transform"
          :class="{ 'rotate-90': isExpanded(node.id) }"
          @click="toggleExpand(node.id)"
        >
          <span class="i-heroicons-chevron-right w-4 h-4" />
        </button>
        <span v-else class="w-5 h-5" />

        <!-- Category name -->
        <span class="flex-1 text-sm font-medium text-gray-900">{{ node.name }}</span>

        <!-- Slug badge -->
        <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{{ node.slug }}</span>

        <!-- Child count badge -->
        <span
          v-if="hasChildren(node)"
          class="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
        >
          {{ node.children.length }}
        </span>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1 text-gray-400 hover:text-primary rounded transition-colors"
            title="Edit"
            @click="emit('edit', node.id)"
          >
            <span class="i-heroicons-pencil w-4 h-4" />
          </button>
          <button
            class="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': hasChildren(node) }"
            :title="hasChildren(node) ? 'Cannot delete: has children' : 'Delete'"
            @click="!hasChildren(node) && emit('delete', node.id)"
          >
            <span class="i-heroicons-trash w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Recursive children -->
      <AdminCategoriesCategoryTree
        v-if="hasChildren(node) && isExpanded(node.id)"
        :categories="node.children"
        :level="(level || 0) + 1"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </li>
  </ul>
</template>
