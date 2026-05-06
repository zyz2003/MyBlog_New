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
    config: {
      colors: Record<string, string>
      fonts: Record<string, string>
      spacing: Record<string, string>
      borderRadius: Record<string, string>
      layout: Record<string, string>
    }
    isActive: boolean
  }
}>()

const emit = defineEmits<{
  activate: [name: string]
}>()

const showDetail = ref(false)

const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textMuted'] as const

const colorLabels: Record<string, string> = {
  primary: '主色',
  secondary: '次要',
  accent: '强调',
  background: '背景',
  surface: '卡片',
  text: '文字',
  textMuted: '辅助文字',
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
    <!-- Color preview strip -->
    <div class="flex h-3">
      <div
        v-for="key in colorKeys"
        :key="key"
        class="flex-1"
        :style="{ backgroundColor: theme.config.colors[key] }"
      />
    </div>

    <div class="p-5">
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
          已启用
        </span>
      </div>

      <!-- Meta -->
      <div class="space-y-1 mb-4">
        <p class="text-sm text-gray-500">
          <span class="font-medium">版本:</span> {{ theme.meta.version }}
        </p>
        <p v-if="theme.meta.author" class="text-sm text-gray-500">
          <span class="font-medium">作者:</span> {{ theme.meta.author }}
        </p>
        <p v-if="theme.meta.description" class="text-sm text-gray-500 line-clamp-2">
          {{ theme.meta.description }}
        </p>
      </div>

      <!-- Layout info -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
          {{ theme.config.layout.headerPosition === 'sticky' ? '吸顶导航' : theme.config.layout.headerPosition === 'top' ? '顶部导航' : '隐藏导航' }}
        </span>
        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
          {{ theme.config.layout.sidebarPosition === 'right' ? '右侧栏' : theme.config.layout.sidebarPosition === 'left' ? '左侧栏' : '无侧栏' }}
        </span>
        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
          {{ theme.config.layout.footerStyle === 'simple' ? '简约页脚' : theme.config.layout.footerStyle === 'detailed' ? '详细页脚' : '极简页脚' }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          class="flex-1 px-3 py-2 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
          @click="showDetail = !showDetail"
        >
          {{ showDetail ? '收起详情' : '查看详情' }}
        </button>
        <button
          v-if="!theme.isActive"
          class="flex-1 btn-primary py-2 text-sm"
          @click="emit('activate', theme.meta.name)"
        >
          启用
        </button>
        <div
          v-else
          class="flex-1 py-2 text-sm text-center text-green-700 bg-green-50 rounded border border-green-200"
        >
          当前启用
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="showDetail" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <!-- Colors -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">配色方案</h4>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="key in colorKeys"
              :key="key"
              class="flex items-center gap-2"
            >
              <div
                class="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
                :style="{ backgroundColor: theme.config.colors[key] }"
              />
              <div class="min-w-0">
                <p class="text-xs text-gray-500">{{ colorLabels[key] }}</p>
                <p class="text-xs text-gray-700 font-mono truncate">{{ theme.config.colors[key] }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fonts -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">字体配置</h4>
          <div class="space-y-1">
            <div v-for="(value, key) in theme.config.fonts" :key="key" class="flex justify-between text-xs">
              <span class="text-gray-500">{{ key === 'heading' ? '标题' : key === 'body' ? '正文' : '代码' }}</span>
              <span class="text-gray-700 font-mono truncate ml-2">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- Spacing & Radius -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">间距</h4>
            <div class="space-y-1">
              <div v-for="(value, key) in theme.config.spacing" :key="key" class="flex justify-between text-xs">
                <span class="text-gray-500">{{ key === 'unit' ? '基础' : key === 'containerMax' ? '最大宽度' : '内边距' }}</span>
                <span class="text-gray-700 font-mono">{{ value }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">圆角</h4>
            <div class="space-y-1">
              <div v-for="(value, key) in theme.config.borderRadius" :key="key" class="flex justify-between text-xs">
                <span class="text-gray-500">{{ key === 'small' ? '小' : key === 'medium' ? '中' : '大' }}</span>
                <span class="text-gray-700 font-mono">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
