<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  ScrollArea,
} from '#components'
import { X, ExternalLink, Monitor, Smartphone, Tablet, Palette, Power } from 'lucide-vue-next'
import type { Theme } from './ThemeCard.vue'

const props = defineProps<{
  open: boolean
  theme: Theme | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'activate': [themeId: string]
}>()

const devicePreview = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

const previewContainerClass = computed(() => {
  switch (devicePreview.value) {
    case 'mobile':
      return 'max-w-[375px] mx-auto'
    case 'tablet':
      return 'max-w-[768px] mx-auto'
    default:
      return 'w-full'
  }
})

const activateTheme = () => {
  if (props.theme) {
    emit('activate', props.theme.id)
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-5xl max-h-[80vh] p-0">
      <DialogTitle class="sr-only">主题预览</DialogTitle>

      <div class="flex flex-col h-full">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-4 border-b">
          <div>
            <DialogTitle class="text-xl">{{ theme?.name }}</DialogTitle>
            <p class="text-sm text-muted-foreground">
              作者：{{ theme?.author }} | v{{ theme?.version }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- 设备切换 -->
            <div class="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                :class="{ 'bg-muted': devicePreview === 'desktop' }"
                @click="devicePreview = 'desktop'"
                title="桌面视图"
              >
                <Monitor class="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :class="{ 'bg-muted': devicePreview === 'tablet' }"
                @click="devicePreview = 'tablet'"
                title="平板视图"
              >
                <Tablet class="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :class="{ 'bg-muted': devicePreview === 'mobile' }"
                @click="devicePreview = 'mobile'"
                title="手机视图"
              >
                <Smartphone class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <ScrollArea class="flex-1 p-4">
          <div :class="previewContainerClass">
            <div class="aspect-video bg-muted rounded-lg overflow-hidden border">
              <img
                v-if="theme?.thumbnail"
                :src="theme.thumbnail"
                :alt="theme?.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-muted-foreground"
              >
                <Palette class="w-16 h-16 opacity-20" />
              </div>
            </div>
          </div>

          <!-- 主题描述 -->
          <div class="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 class="font-medium mb-2">主题描述</h4>
            <p class="text-sm text-muted-foreground">
              {{ theme?.description || '暂无描述' }}
            </p>
          </div>
        </ScrollArea>

        <!-- 底部操作栏 -->
        <div class="flex items-center justify-between p-4 border-t">
          <Button
            v-if="theme?.hasDemo"
            variant="outline"
          >
            <ExternalLink class="w-4 h-4 mr-2" />
            查看演示
          </Button>
          <div class="flex gap-2 ml-auto">
            <Button variant="outline" @click="emit('update:open', false)">
              关闭
            </Button>
            <Button
              v-if="!theme?.isActive"
              @click="activateTheme"
            >
              <Power class="w-4 h-4 mr-2" />
              激活此主题
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
