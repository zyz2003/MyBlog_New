<script setup lang="ts">
const props = defineProps<{
  theme: {
    meta: {
      name: string
      label: string
      version: string
      author?: string
      description?: string
    }
    config: Record<string, unknown>
    isActive: boolean
  }
}>()

const emit = defineEmits<{
  activate: [name: string]
}>()
</script>

<template>
  <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ theme.meta.label || theme.meta.name }}</h3>
        <p class="text-xs text-gray-400 font-mono">{{ theme.meta.name }}</p>
      </div>
      <span
        v-if="theme.isActive"
        class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"
      >
        Active
      </span>
    </div>

    <!-- Meta -->
    <div class="space-y-1 mb-4">
      <p class="text-sm text-gray-500">
        <span class="font-medium">Version:</span> {{ theme.meta.version }}
      </p>
      <p v-if="theme.meta.author" class="text-sm text-gray-500">
        <span class="font-medium">Author:</span> {{ theme.meta.author }}
      </p>
      <p v-if="theme.meta.description" class="text-sm text-gray-500 line-clamp-2">
        {{ theme.meta.description }}
      </p>
    </div>

    <!-- Action -->
    <button
      v-if="!theme.isActive"
      class="btn-primary w-full py-2 text-sm"
      @click="emit('activate', theme.meta.name)"
    >
      Activate
    </button>
    <div
      v-else
      class="w-full py-2 text-sm text-center text-green-700 bg-green-50 rounded-md border border-green-200"
    >
      Currently Active
    </div>
  </div>
</template>
