<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Settings, User, Monitor, Save, X } from 'lucide-vue-next'

export interface TabItem {
  id: string
  label: string
  icon: string
  hasUnsavedChanges: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: string
  tabs: TabItem[]
  globalSaveMode?: boolean
  hasGlobalUnsavedChanges?: boolean
  loading?: boolean
}>()

 
const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: []
  cancel: []
}>()

const icons: Record<string, unknown> = {
  site: Settings,
  user: User,
  system: Monitor,
}
</script>

<template>
  <Tabs :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-center justify-between mb-6">
      <TabsList class="grid grid-cols-3 w-full max-w-md">
        <TabsTrigger v-for="tab in tabs" :key="tab.id" :value="tab.id" class="relative">
          <component :is="icons[tab.id]" class="w-4 h-4 mr-2" />
          {{ tab.label }}
          <span
            v-if="tab.hasUnsavedChanges"
            class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
          ></span>
        </TabsTrigger>
      </TabsList>

      <!-- 全局保存按钮 -->
      <div v-if="globalSaveMode && hasGlobalUnsavedChanges" class="flex gap-2 ml-4">
        <Button variant="outline" size="sm" @click="emit('cancel')">
          <X class="w-4 h-4 mr-1" />
          取消
        </Button>
        <Button size="sm" :disabled="loading" @click="emit('save')">
          <Save class="w-4 h-4 mr-1" />
          保存
        </Button>
      </div>
    </div>

    <slot />
  </Tabs>
</template>
