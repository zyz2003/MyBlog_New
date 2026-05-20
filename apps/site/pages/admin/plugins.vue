<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface PluginFieldOption {
  label: string
  value: string | number
}

interface PluginField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'code' | 'textarea' | 'color' | 'image'
  label: string
  description?: string
  required?: boolean
  default?: unknown
  options?: PluginFieldOption[]
  placeholder?: string
  language?: string
}

interface PluginItem {
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
  configSchema?: Record<string, PluginField>
}

const api = useAdminApi()

const plugins = ref<PluginItem[]>([])
const loading = ref(true)
const savingName = ref('')
const message = ref('')
const errorMessage = ref('')
const expandedPlugin = ref('')
const configDraft = ref<Record<string, unknown>>({})

const enabledCount = computed(() => plugins.value.filter(plugin => plugin.enabled).length)

async function fetchPlugins() {
  loading.value = true
  try {
    plugins.value = await api.get<PluginItem[]>('/api/plugins')
  }
  finally {
    loading.value = false
  }
}

function toggleExpand(plugin: PluginItem) {
  if (expandedPlugin.value === plugin.meta.name) {
    expandedPlugin.value = ''
    configDraft.value = {}
    return
  }

  expandedPlugin.value = plugin.meta.name

  const defaults: Record<string, unknown> = {}
  if (plugin.configSchema) {
    for (const [key, field] of Object.entries(plugin.configSchema)) {
      if (field.default !== undefined) {
        defaults[key] = field.default
      }
    }
  }
  configDraft.value = { ...defaults, ...plugin.config }
}

async function togglePlugin(plugin: PluginItem) {
  savingName.value = plugin.meta.name
  message.value = ''
  errorMessage.value = ''

  try {
    if (plugin.enabled) {
      await api.post(`/api/plugins/${plugin.meta.name}/disable`)
    }
    else {
      await api.post(`/api/plugins/${plugin.meta.name}/enable`, {
        config: plugin.config,
      })
    }
    await fetchPlugins()
    message.value = `插件 ${plugin.meta.label || plugin.meta.name} 已${plugin.enabled ? '停用' : '启用'}。`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '插件状态切换失败'
  }
  finally {
    savingName.value = ''
  }
}

async function saveConfig(plugin: PluginItem) {
  savingName.value = plugin.meta.name
  message.value = ''
  errorMessage.value = ''

  try {
    await api.put(`/api/plugins/${plugin.meta.name}/config`, {
      config: configDraft.value,
    })
    await fetchPlugins()
    message.value = `插件 ${plugin.meta.label || plugin.meta.name} 配置已保存。`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '插件配置保存失败'
  }
  finally {
    savingName.value = ''
  }
}

onMounted(fetchPlugins)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Platform</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">插件中心</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        查看全部已注册插件，控制启停状态，并维护插件独立配置。
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">插件总数</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ plugins.length }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">已启用插件</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ enabledCount }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">停用插件</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ Math.max(plugins.length - enabledCount, 0) }}</p>
      </article>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-28 animate-pulse rounded-2xl bg-surface-2" />
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="plugin in plugins"
          :key="plugin.meta.name"
          class="rounded-[24px] border border-border/70 bg-background/72 p-5"
        >
          <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-black text-text">{{ plugin.meta.label || plugin.meta.name }}</h2>
                <span class="rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted">
                  {{ plugin.meta.type }}
                </span>
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="plugin.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200/70 text-slate-600'">
                  {{ plugin.enabled ? '已启用' : '已停用' }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-7 text-muted">{{ plugin.meta.description || '暂无插件描述' }}</p>
              <p class="mt-2 text-xs text-muted">版本 {{ plugin.meta.version }}<span v-if="plugin.meta.author"> · {{ plugin.meta.author }}</span></p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="mountPoint in plugin.mountPoints"
                  :key="mountPoint"
                  class="rounded-xl bg-white/80 px-3 py-1.5 text-xs text-muted"
                >
                  {{ mountPoint }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-xl border border-border bg-white/80 px-4 py-2 text-sm font-semibold text-text transition hover:text-primary"
                @click="toggleExpand(plugin)"
              >
                {{ expandedPlugin === plugin.meta.name ? '收起配置' : '展开配置' }}
              </button>
              <button
                class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                :disabled="savingName === plugin.meta.name"
                @click="togglePlugin(plugin)"
              >
                {{ savingName === plugin.meta.name ? '处理中...' : (plugin.enabled ? '停用' : '启用') }}
              </button>
            </div>
          </div>

          <div
            v-if="expandedPlugin === plugin.meta.name"
            class="mt-5 rounded-2xl border border-border/70 bg-white/70 p-5"
          >
            <div v-if="plugin.configSchema && Object.keys(plugin.configSchema).length > 0" class="space-y-5">
              <AdminPluginsConfigFormRenderer
                v-model="configDraft"
                :schema="plugin.configSchema"
              />

              <div class="flex justify-end">
                <button
                  class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                  :disabled="savingName === plugin.meta.name"
                  @click="saveConfig(plugin)"
                >
                  {{ savingName === plugin.meta.name ? '保存中...' : '保存插件配置' }}
                </button>
              </div>
            </div>

            <div v-else class="text-sm text-muted">
              这个插件当前没有暴露可编辑配置项。
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
