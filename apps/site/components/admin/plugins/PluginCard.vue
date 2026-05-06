<script setup lang="ts">
const props = defineProps<{
  plugin: {
    meta: {
      name: string
      label: string
      type: string
      version: string
      author?: string
      description?: string
      icon?: string
    }
    mountPoints: string[]
    enabled: boolean
    config: Record<string, unknown>
  }
}>()

const emit = defineEmits<{
  toggle: [data: { name: string; enable: boolean }]
  'config-save': [data: { name: string; config: Record<string, unknown> }]
}>()

const showConfig = ref(false)
const editConfig = ref<Record<string, unknown>>({})

// Initialize config editor when expanding
function toggleConfig() {
  if (!showConfig.value) {
    editConfig.value = { ...props.plugin.config }
  }
  showConfig.value = !showConfig.value
}

function saveConfig() {
  emit('config-save', {
    name: props.plugin.meta.name,
    config: { ...editConfig.value },
  })
  showConfig.value = false
}

const typeColors: Record<string, string> = {
  content: 'bg-blue-100 text-blue-700',
  ui: 'bg-purple-100 text-purple-700',
  analytics: 'bg-green-100 text-green-700',
  social: 'bg-pink-100 text-pink-700',
  seo: 'bg-yellow-100 text-yellow-700',
  integration: 'bg-indigo-100 text-indigo-700',
}

function getTypeColor(type: string): string {
  return typeColors[type] || 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg p-5">
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span :class="plugin.meta.icon || 'i-heroicons-puzzle-piece'" class="w-6 h-6 text-gray-500" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-base font-semibold text-gray-900">{{ plugin.meta.label || plugin.meta.name }}</h3>
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full"
            :class="getTypeColor(plugin.meta.type)"
          >
            {{ plugin.meta.type }}
          </span>
          <span class="text-xs text-gray-400">v{{ plugin.meta.version }}</span>
        </div>

        <p v-if="plugin.meta.author" class="text-xs text-gray-400 mb-1">by {{ plugin.meta.author }}</p>
        <p v-if="plugin.meta.description" class="text-sm text-gray-500 mb-2">{{ plugin.meta.description }}</p>

        <!-- Mount points -->
        <div v-if="plugin.mountPoints.length > 0" class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="mp in plugin.mountPoints"
            :key="mp"
            class="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
          >
            {{ mp }}
          </span>
        </div>
      </div>

      <!-- Toggle -->
      <div class="flex-shrink-0">
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="plugin.enabled ? 'bg-primary' : 'bg-gray-300'"
          @click="emit('toggle', { name: plugin.meta.name, enable: !plugin.enabled })"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="plugin.enabled ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <!-- Config section -->
    <div v-if="Object.keys(plugin.config).length > 0" class="mt-3 pt-3 border-t border-gray-100">
      <button
        class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        @click="toggleConfig"
      >
        <span
          class="i-heroicons-chevron-right w-4 h-4 transition-transform"
          :class="{ 'rotate-90': showConfig }"
        />
        配置
      </button>

      <div v-if="showConfig" class="mt-3 space-y-3">
        <div
          v-for="(value, key) in editConfig"
          :key="key"
        >
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ key }}</label>
          <input
            v-if="typeof value === 'boolean'"
            type="checkbox"
            :checked="value"
            class="rounded border-gray-300"
            @change="editConfig[key] = ($event.target as HTMLInputElement).checked"
          />
          <input
            v-else-if="typeof value === 'number'"
            type="number"
            :value="value"
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            @input="editConfig[key] = Number(($event.target as HTMLInputElement).value)"
          />
          <input
            v-else
            type="text"
            :value="String(value)"
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            @input="editConfig[key] = ($event.target as HTMLInputElement).value"
          />
        </div>
        <button
          class="btn-primary px-3 py-1.5 text-sm"
          @click="saveConfig"
        >
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>
