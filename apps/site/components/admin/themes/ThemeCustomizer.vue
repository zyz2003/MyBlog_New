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
  activeTheme: string
}>()

const emit = defineEmits<{
  save: [config: ThemeConfig]
  export: []
}>()

const localConfig = reactive<ThemeConfig>({
  colors: { ...props.config.colors },
  fonts: { ...props.config.fonts },
  spacing: Object.fromEntries(
    Object.entries(props.config.spacing).map(([k, v]) => [k, Number(v)]),
  ) as Record<string, number>,
  borderRadius: Object.fromEntries(
    Object.entries(props.config.borderRadius).map(([k, v]) => [k, Number(v)]),
  ) as Record<string, number>,
  layout: { ...props.config.layout },
})

// Local spacing and borderRadius types for component props
const localSpacing = computed(() => ({
  unit: localConfig.spacing.unit || 8,
  containerMax: localConfig.spacing.containerMax || 1200,
  contentPadding: localConfig.spacing.contentPadding || 24,
}))

const localBorderRadius = computed(() => ({
  small: localConfig.borderRadius.small || 4,
  medium: localConfig.borderRadius.medium || 8,
  large: localConfig.borderRadius.large || 16,
}))

function handleSave() {
  emit('save', {
    colors: { ...localConfig.colors },
    fonts: { ...localConfig.fonts },
    spacing: { ...localConfig.spacing },
    borderRadius: { ...localConfig.borderRadius },
    layout: { ...localConfig.layout },
  })
}

function updateColors(colors: Record<string, string>) {
  localConfig.colors = colors
}

function updateFonts(fonts: Record<string, string>) {
  localConfig.fonts = fonts
}

function updateSpacing(spacing: Record<string, number>) {
  localConfig.spacing = { ...localConfig.spacing, ...spacing }
}

function updateBorderRadius(radius: Record<string, number>) {
  localConfig.borderRadius = { ...localConfig.borderRadius, ...radius }
}

function updateLayout(key: string, value: string | boolean) {
  localConfig.layout = { ...localConfig.layout, [key]: value }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: Editor panels -->
    <div class="space-y-6">
      <!-- Color Editor -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-swatch w-4 h-4" />
          配色方案
        </h3>
        <AdminThemesColorEditor
          :model-value="localConfig.colors"
          @update:model-value="updateColors"
        />
      </div>

      <!-- Font Editor -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-calculator w-4 h-4" />
          字体配置
        </h3>
        <AdminThemesFontSelector
          :model-value="localConfig.fonts"
          @update:model-value="updateFonts"
        />
      </div>

      <!-- Spacing Editor -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-arrows-pointing-out w-4 h-4" />
          间距与圆角
        </h3>
        <AdminThemesSpacingEditor
          :spacing="localSpacing"
          :border-radius="localBorderRadius"
          @update:spacing="updateSpacing"
          @update:border-radius="updateBorderRadius"
        />
      </div>

      <!-- Layout Editor -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-view-columns w-4 h-4" />
          布局配置
        </h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 w-20">头部位置</label>
            <select
              :value="localConfig.layout.headerPosition || 'sticky'"
              class="flex-1 px-3 py-2 text-sm border rounded"
              @change="updateLayout('headerPosition', ($event.target as HTMLSelectElement).value)"
            >
              <option value="sticky">粘性定位</option>
              <option value="top">顶部固定</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 w-20">侧边栏</label>
            <select
              :value="localConfig.layout.sidebarPosition || 'right'"
              class="flex-1 px-3 py-2 text-sm border rounded"
              @change="updateLayout('sidebarPosition', ($event.target as HTMLSelectElement).value)"
            >
              <option value="right">右侧</option>
              <option value="left">左侧</option>
              <option value="none">不显示</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 w-20">页脚风格</label>
            <select
              :value="localConfig.layout.footerStyle || 'simple'"
              class="flex-1 px-3 py-2 text-sm border rounded"
              @change="updateLayout('footerStyle', ($event.target as HTMLSelectElement).value)"
            >
              <option value="simple">简洁</option>
              <option value="detailed">详细</option>
              <option value="minimal">极简</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 w-20">显示侧边栏</label>
            <input
              type="checkbox"
              :checked="localConfig.layout.showSidebar !== false"
              class="w-4 h-4 rounded"
              @change="updateLayout('showSidebar', ($event.target as HTMLInputElement).checked)"
            >
          </div>
        </div>
      </div>

      <!-- CSS Variables Editor -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-code-bracket w-4 h-4" />
          CSS Variables (高级)
        </h3>
        <AdminThemesCssVarsEditor
          :config="localConfig"
          @update:config="localConfig = $event"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button class="btn-primary flex-1 py-3" @click="handleSave">
          保存配置
        </button>
        <button class="btn-secondary px-6 py-3" @click="$emit('export')">
          导出
        </button>
      </div>
    </div>

    <!-- Right: Live Preview -->
    <div class="lg:sticky lg:top-6 lg:self-start">
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span class="i-heroicons-eye w-4 h-4" />
          实时预览
        </h3>
        <AdminThemesThemePreview :config="localConfig" />
      </div>
    </div>
  </div>
</template>
