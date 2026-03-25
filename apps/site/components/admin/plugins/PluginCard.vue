<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '#components'
import { Button } from '#components'
import { Badge } from '#components'
import { Switch } from '#components'
import { Dialog, DialogContent, DialogTitle } from '#components'
import { Puzzle, Settings, Check, X } from 'lucide-vue-next'

export interface Plugin {
  id: string
  name: string
  description: string
  author: string
  version: string
  icon?: string
  isEnabled: boolean
  hasConfig: boolean
  category: string
}

const props = defineProps<{
  plugin: Plugin
  loading?: boolean
}>()

const emit = defineEmits<{
  'toggle': [pluginId: string, enabled: boolean]
  'configure': [plugin: Plugin]
}>()

const switchChecked = ref(props.plugin.isEnabled)
const showConfirmDialog = ref(false)

const handleToggle = (checked: boolean) => {
  if (!checked) {
    // 禁用时需要确认
    showConfirmDialog.value = true
  } else {
    switchChecked.value = checked
    emit('toggle', props.plugin.id, checked)
  }
}

const confirmDisable = () => {
  showConfirmDialog.value = false
  emit('toggle', props.plugin.id, false)
}

const cancelDisable = () => {
  showConfirmDialog.value = false
  switchChecked.value = props.plugin.isEnabled
}
</script>

<template>
  <Card class="transition-all duration-200 hover:shadow-md">
    <CardContent class="p-4">
      <div class="flex items-start gap-4">
        <!-- 插件图标 -->
        <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Puzzle
            v-if="!plugin.icon"
            class="w-6 h-6 text-primary"
          />
          <img
            v-else
            :src="plugin.icon"
            :alt="plugin.name"
            class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <!-- 插件信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <CardTitle class="text-base">{{ plugin.name }}</CardTitle>
            <Badge
              :variant="plugin.isEnabled ? 'default' : 'secondary'"
              :class="plugin.isEnabled ? 'bg-green-500' : ''"
            >
              <Check v-if="plugin.isEnabled" class="w-3 h-3 mr-1" />
              <X v-else class="w-3 h-3 mr-1" />
              {{ plugin.isEnabled ? '已启用' : '已禁用' }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
            {{ plugin.description }}
          </p>
          <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>作者：{{ plugin.author }}</span>
            <span>v{{ plugin.version }}</span>
            <Badge variant="outline">{{ plugin.category }}</Badge>
          </div>
        </div>

        <!-- 操作区域 -->
        <div class="flex flex-col items-end gap-2">
          <Switch
            :checked="switchChecked"
            @update:checked="handleToggle"
          />
          <Button
            v-if="plugin.hasConfig && plugin.isEnabled"
            variant="outline"
            size="sm"
            @click="emit('configure', plugin)"
          >
            <Settings class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 禁用确认 Dialog -->
  <Dialog v-model:open="showConfirmDialog">
    <DialogContent class="sm:max-w-[400px]">
      <DialogTitle>确认禁用插件</DialogTitle>
      <p class="text-muted-foreground">
        确定要禁用 <strong>{{ plugin.name }}</strong> 吗？此操作可能会影响相关功能。
      </p>
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="cancelDisable">
          取消
        </Button>
        <Button variant="destructive" @click="confirmDisable">
          确认禁用
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
