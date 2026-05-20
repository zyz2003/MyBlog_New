<script setup lang="ts">
import type { CategoryTreeNode } from '~/server/services/category.service'

defineProps<{
  categories: CategoryTreeNode[]
  level?: number
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

const expandedIds = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  if (expandedIds.value.has(id))
    expandedIds.value.delete(id)
  else
    expandedIds.value.add(id)
}
</script>

<template>
  <div class="space-y-4">
    <article
      v-for="node in categories"
      :key="node.id"
      class="rounded-[24px] border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:shadow-sm"
      :style="{ marginLeft: `${(level || 0) * 18}px` }"
    >
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <button class="min-w-0 flex-1 text-left" @click="emit('edit', node.id)">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span class="i-heroicons-folder h-5 w-5" />
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="truncate text-base font-bold text-text transition hover:text-primary">{{ node.name }}</h4>
                <span class="rounded-full bg-background/80 px-2.5 py-1 text-xs text-muted">
                  {{ node.parentId === null ? '顶级分类' : '子分类' }}
                </span>
                <span
                  v-if="node.children?.length"
                  class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {{ node.children.length }} 个子分类
                </span>
              </div>
              <p class="mt-2 font-mono text-xs text-muted">{{ node.slug }}</p>
              <p v-if="node.description" class="mt-2 text-sm leading-6 text-muted">{{ node.description }}</p>
              <p class="mt-2 text-xs text-muted">排序值：{{ node.sortOrder ?? 0 }}</p>
            </div>
          </div>
        </button>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="node.children?.length"
            class="inline-flex items-center gap-1 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium text-text transition hover:text-primary"
            @click="toggleExpand(node.id)"
          >
            <span
              class="i-heroicons-chevron-down h-4 w-4 transition-transform"
              :class="{ 'rotate-180': expandedIds.has(node.id) }"
            />
            {{ expandedIds.has(node.id) ? '收起' : '展开' }}
          </button>
          <button
            class="inline-flex items-center gap-1 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium text-text transition hover:text-primary"
            @click="emit('edit', node.id)"
          >
            <span class="i-heroicons-pencil-square h-4 w-4" />
            编辑
          </button>
          <button
            class="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition"
            :class="node.children?.length
              ? 'cursor-not-allowed border border-border bg-background/70 text-muted/70'
              : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300'"
            :disabled="Boolean(node.children?.length)"
            @click="emit('delete', node.id)"
          >
            <span class="i-heroicons-trash h-4 w-4" />
            {{ node.children?.length ? '先清空子分类' : '删除' }}
          </button>
        </div>
      </div>

      <div v-if="node.children?.length && expandedIds.has(node.id)" class="mt-4 border-t border-border/60 pt-4">
        <AdminCategoriesCategoryTree
          :categories="node.children"
          :level="(level || 0) + 1"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </article>
  </div>
</template>
