<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '#components'
import { Button } from '#components'
import { Badge } from '#components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#components'
import { Palette, Check, Eye, Settings, MoreVertical, Power } from 'lucide-vue-next'

export interface Theme {
  id: string
  name: string
  author: string
  version: string
  thumbnail?: string
  description?: string
  isActive: boolean
  hasConfig: boolean
}

const props = defineProps<{
  theme: Theme
  loading?: boolean
}>()

const emit = defineEmits<{
  'activate': [themeId: string]
  'preview': [theme: Theme]
  'configure': [theme: Theme]
}>()

const activateTheme = () => {
  if (props.theme.isActive) return
  emit('activate', props.theme.id)
}
</script>

<template>
  <Card
    class="overflow-hidden transition-all duration-200 hover:shadow-lg"
    :class="theme.isActive ? 'ring-2 ring-primary' : ''"
  >
    <!-- 缩略图 -->
    <div class="relative aspect-[4/3] bg-muted overflow-hidden">
      <img
        v-if="theme.thumbnail"
        :src="theme.thumbnail"
        :alt="theme.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted-foreground"
      >
        <Palette class="w-12 h-12 opacity-20" />
      </div>

      <!-- 激活标识 -->
      <Badge
        v-if="theme.isActive"
        class="absolute top-2 right-2 bg-green-500"
      >
        <Check class="w-3 h-3 mr-1" />
        已激活
      </Badge>
    </div>

    <CardHeader class="pb-2">
      <CardTitle class="text-lg truncate">{{ theme.name }}</CardTitle>
    </CardHeader>

    <CardContent class="pb-2">
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>作者：{{ theme.author }}</span>
        <span>v{{ theme.version }}</span>
      </div>
      <p
        v-if="theme.description"
        class="text-sm text-muted-foreground mt-2 line-clamp-2"
      >
        {{ theme.description }}
      </p>
    </CardContent>

    <CardFooter class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        @click="emit('preview', theme)"
      >
        <Eye class="w-4 h-4 mr-1" />
        预览
      </Button>
      <Button
        v-if="theme.hasConfig"
        variant="outline"
        size="sm"
        @click="emit('configure', theme)"
      >
        <Settings class="w-4 h-4 mr-1" />
        配置
      </Button>
      <Button
        v-if="!theme.isActive"
        size="sm"
        class="ml-auto"
        @click="activateTheme"
      >
        <Power class="w-4 h-4 mr-1" />
        激活
      </Button>
    </CardFooter>
  </Card>
</template>
