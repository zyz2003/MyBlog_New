<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

const props = defineProps<{
  categories: CategoryTreeNode[]
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

const expandedIds = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  if (expandedIds.value.has(id)) expandedIds.value.delete(id)
  else expandedIds.value.add(id)
}
</script>

<template>
  <template v-for="node in categories" :key="node.id">
    <!-- Category Card -->
    <div
      class="rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-lg transition-all duration-200 p-4 cursor-pointer group"
      @click="emit('edit', node.id)"
    >
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
          <span class="i-heroicons-folder w-5 h-5 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-text group-hover:text-primary truncate">{{ node.name }}</h4>
          <p class="text-xs text-muted font-mono truncate">{{ node.slug }}</p>
        </div>
      </div>

      <p v-if="node.description" class="text-xs text-muted mb-3 line-clamp-2">{{ node.description }}</p>

      <div class="flex items-center justify-between">
        <span
          v-if="node.children?.length"
          class="px-2 py-0.5 text-xs rounded-full bg-surface-2 text-primary"
        >
          {{ node.children.length }} 个子分类
        </span>
        <span v-else class="px-2 py-0.5 text-xs rounded-full bg-surface-2 text-muted">顶级</span>

        <div class="flex gap-1" @click.stop>
          <button
            v-if="node.children?.length"
            class="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors"
            @click="toggleExpand(node.id)"
          >
            <svg class="w-4 h-4 text-muted transition-transform" :class="{ 'rotate-180': expandedIds.has(node.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
          <button
            class="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors"
            @click="emit('edit', node.id)"
          >
            <span class="i-heroicons-pencil w-4 h-4 text-muted" />
          </button>
          <button
            class="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors"
            :class="{ 'opacity-40': node.children?.length }"
            :title="node.children?.length ? '有子分类无法删除' : '删除'"
            @click="!node.children?.length && emit('delete', node.id)"
          >
            <span class="i-heroicons-trash w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <!-- Children -->
      <div v-if="node.children?.length && expandedIds.has(node.id)" class="mt-3 pt-3 border-t border-border">
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="child in node.children"
            :key="child.id"
            class="p-2 rounded-lg bg-surface-2/50 hover:bg-surface-2 cursor-pointer text-xs"
            @click.stop="emit('edit', child.id)"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="i-heroicons-folder w-3 h-3 text-secondary" />
              <span class="truncate">{{ child.name }}</span>
            </div>
            <div class="flex gap-1 justify-end" @click.stop>
              <button class="p-1 rounded hover:bg-surface cursor-pointer">
                <span class="i-heroicons-pencil w-3 h-3 text-muted" />
              </button>
              <button class="p-1 rounded hover:bg-surface cursor-pointer">
                <span class="i-heroicons-trash w-3 h-3 text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>