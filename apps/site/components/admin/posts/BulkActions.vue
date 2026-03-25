<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'

interface Props {
  selectedCount: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  publish: []
  archive: []
  delete: []
  cancel: []
}>()
</script>

<template>
  <div
    v-if="selectedCount > 0"
    class="flex items-center justify-between rounded-xl bg-gradient-to-r from-sky-50 via-sky-50/50 to-transparent border border-sky-200 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
  >
    <div class="flex items-center gap-3">
      <Badge
        class="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md"
      >
        <span class="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          已选择 {{ selectedCount }} 篇
        </span>
      </Badge>
      <span class="text-sm font-medium text-slate-600"> 选择文章进行批量操作 </span>
    </div>

    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        class="h-9 border-emerald-200 bg-white text-sm font-medium text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500"
        @click="$emit('publish')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1.5 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        批量发布
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="h-9 border-amber-200 bg-white text-sm font-medium text-amber-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-500"
        @click="$emit('archive')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1.5 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        批量归档
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="h-9 border-rose-200 bg-white text-sm font-medium text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-rose-500"
        @click="$emit('delete')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1.5 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        批量删除
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="h-9 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800"
        @click="$emit('cancel')"
      >
        取消
      </Button>
    </div>
  </div>
</template>
