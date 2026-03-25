<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

defineProps<{
  title: string
  description?: string
  actionText?: string
  icon?: 'file' | 'image' | 'folder' | 'default'
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader class="text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg
          v-if="icon === 'file' || icon === 'default'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <svg
          v-else-if="icon === 'image'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <svg
          v-else-if="icon === 'folder'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <CardTitle class="text-xl">{{ title }}</CardTitle>
      <CardDescription v-if="description">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent v-if="actionText" class="flex justify-center">
      <Button @click="$emit('action')">
        {{ actionText }}
      </Button>
    </CardContent>
  </Card>
</template>
