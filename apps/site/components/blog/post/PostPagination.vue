<script setup lang="ts">
interface PaginationItem {
  title: string
  path: string
  coverImage?: string
}

const props = withDefaults(defineProps<{
  mode?: number
  previous?: PaginationItem | null
  next?: PaginationItem | null
}>(), {
  mode: 1,
})

const hasPrevious = computed(() => !!props.previous)
const hasNext = computed(() => !!props.next)

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}
</script>

<template>
  <nav v-if="hasPrevious || hasNext" class="post-nav my-6 grid gap-4" :class="hasPrevious && hasNext ? 'grid-cols-2' : 'grid-cols-1'">
    <NuxtLink
      v-if="previous"
      :to="previous.path"
      class="post-nav-item group relative flex items-center gap-3 overflow-hidden rounded-[24px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-4 no-underline shadow-[var(--anzhiyu-shadow-border)] transition-all hover:border-[var(--anzhiyu-main)] hover:shadow-[var(--anzhiyu-shadow-hover)]"
    >
      <div v-if="previous.coverImage" class="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity group-hover:opacity-20" :style="{ backgroundImage: `url(${previous.coverImage})` }" />
      <div class="relative z-1 flex w-full items-center gap-3">
        <i class="anzhiyufont anzhiyu-icon-arrow-left shrink-0 text-sm text-[var(--anzhiyu-secondtext)] group-hover:text-[var(--anzhiyu-main)]" />
        <div class="min-w-0 flex-1">
          <div class="mb-1 text-xs text-[var(--anzhiyu-secondtext)]">
            {{ mode === 2 ? '下一篇' : '上一篇' }}
          </div>
          <div class="truncate text-sm font-semibold text-[var(--anzhiyu-fontcolor)] group-hover:text-[var(--anzhiyu-main)]">
            {{ truncate(previous.title, 30) }}
          </div>
        </div>
      </div>
    </NuxtLink>

    <div v-else-if="hasNext" />

    <NuxtLink
      v-if="next"
      :to="next.path"
      class="post-nav-item group relative flex items-center gap-3 overflow-hidden rounded-[24px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-4 no-underline shadow-[var(--anzhiyu-shadow-border)] transition-all hover:border-[var(--anzhiyu-main)] hover:shadow-[var(--anzhiyu-shadow-hover)]"
    >
      <div v-if="next.coverImage" class="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity group-hover:opacity-20" :style="{ backgroundImage: `url(${next.coverImage})` }" />
      <div class="relative z-1 flex w-full items-center justify-end gap-3">
        <div class="min-w-0 flex-1 text-right">
          <div class="mb-1 text-xs text-[var(--anzhiyu-secondtext)]">
            {{ mode === 2 ? '上一篇' : '下一篇' }}
          </div>
          <div class="truncate text-sm font-semibold text-[var(--anzhiyu-fontcolor)] group-hover:text-[var(--anzhiyu-main)]">
            {{ truncate(next.title, 30) }}
          </div>
        </div>
        <i class="anzhiyufont anzhiyu-icon-arrow-right shrink-0 text-sm text-[var(--anzhiyu-secondtext)] group-hover:text-[var(--anzhiyu-main)]" />
      </div>
    </NuxtLink>
  </nav>
</template>