<script setup lang="ts">
interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, number>
  borderRadius: Record<string, number>
  layout: Record<string, string | string[] | boolean>
}

const props = defineProps<{
  config: ThemeConfig
}>()

const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textMuted'] as const
</script>

<template>
  <div
    class="rounded-lg overflow-hidden border"
    :style="{
      background: config.colors.background,
      fontFamily: config.fonts.body,
      color: config.colors.text,
    }"
  >
    <!-- Mini header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b"
      :style="{
        background: config.colors.surface,
        borderColor: config.colors.primary + '30',
      }"
    >
      <span
        class="font-bold"
        :style="{ color: config.colors.text, fontFamily: config.fonts.heading }"
      >
        博客标题
      </span>
      <div class="flex gap-3">
        <span :style="{ color: config.colors.textMuted }">首页</span>
        <span :style="{ color: config.colors.textMuted }">文章</span>
        <span :style="{ color: config.colors.primary }">关于</span>
      </div>
    </div>

    <!-- Mini content with layout -->
    <div class="p-4 flex gap-3">
      <!-- Sidebar left -->
      <div
        v-if="config.layout.showSidebar !== false && config.layout.sidebarPosition === 'left'"
        class="w-24 flex-shrink-0 space-y-2"
      >
        <div class="text-xs font-semibold" :style="{ color: config.colors.textMuted }">分类</div>
        <div class="text-xs" :style="{ color: config.colors.primary }">技术</div>
        <div class="text-xs" :style="{ color: config.colors.textMuted }">生活</div>
      </div>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <h2
          class="text-lg font-bold mb-2"
          :style="{ fontFamily: config.fonts.heading }"
        >
          文章标题示例
        </h2>
        <p class="text-sm mb-3" :style="{ color: config.colors.textMuted }">
          这是一段示例文本，用于预览当前主题配置效果...
        </p>
        <div
          class="inline-block px-4 py-2 rounded text-white text-sm"
          :style="{
            background: config.colors.primary,
            borderRadius: config.borderRadius.medium + 'px',
          }"
        >
          主要按钮
        </div>
      </div>

      <!-- Sidebar right -->
      <div
        v-if="config.layout.showSidebar !== false && config.layout.sidebarPosition === 'right'"
        class="w-24 flex-shrink-0 space-y-2"
      >
        <div class="text-xs font-semibold" :style="{ color: config.colors.textMuted }">标签</div>
        <div
          class="text-xs px-2 py-0.5 rounded"
          :style="{ background: config.colors.primary + '20', color: config.colors.primary }"
        >Vue</div>
        <div
          class="text-xs px-2 py-0.5 rounded"
          :style="{ background: config.colors.accent + '20', color: config.colors.accent }"
        >Nuxt</div>
      </div>
    </div>

    <!-- Color swatches -->
    <div class="flex h-3">
      <div
        v-for="key in colorKeys"
        :key="key"
        class="flex-1"
        :style="{ background: config.colors[key] }"
      />
    </div>
  </div>
</template>
