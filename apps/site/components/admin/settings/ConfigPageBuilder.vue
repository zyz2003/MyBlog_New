<script setup lang="ts">
type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'json' | 'select'

interface FieldOption {
  label: string
  value: string | number
}

interface ConfigField {
  key: string
  label: string
  type: FieldType
  options?: FieldOption[]
  description?: string
  placeholder?: string
  rows?: number
  defaultValue?: unknown
}

interface ConfigSection {
  title: string
  description?: string
  fields: ConfigField[]
}

const props = defineProps<{
  category: string
  title: string
  description: string
  eyebrow?: string
  saveLabel?: string
  sections: unknown[]
}>()

const { settings, loading, save, refresh } = useAdminSettings(props.category)

const formState = reactive<Record<string, string | number | boolean>>({})
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const sections = computed(() => props.sections as ConfigSection[])

function serializeField(field: ConfigField, value: unknown) {
  if (value === undefined || value === null) {
    if (field.type === 'boolean') return Boolean(field.defaultValue)
    if (field.type === 'number') return Number(field.defaultValue ?? 0)
    if (field.type === 'json') return JSON.stringify(field.defaultValue ?? {}, null, 2)
    return String(field.defaultValue ?? '')
  }

  if (field.type === 'boolean') return Boolean(value)
  if (field.type === 'number') return Number(value)
  if (field.type === 'json') {
    try {
      return JSON.stringify(value, null, 2)
    }
    catch {
      return JSON.stringify(field.defaultValue ?? {}, null, 2)
    }
  }

  return String(value)
}

function hydrateForm() {
  for (const section of sections.value) {
    for (const field of section.fields) {
      formState[field.key] = serializeField(field, settings.value[field.key])
    }
  }
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

function parseField(field: ConfigField, value: string | number | boolean) {
  if (field.type === 'boolean') {
    return Boolean(value)
  }

  if (field.type === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : Number(field.defaultValue ?? 0)
  }

  if (field.type === 'json') {
    try {
      return JSON.parse(String(value || '{}'))
    }
    catch {
      throw new Error(`${field.label} 不是合法的 JSON，请检查格式后再保存。`)
    }
  }

  return String(value ?? '')
}

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const payload: Record<string, unknown> = {}

    for (const section of sections.value) {
      for (const field of section.fields) {
        payload[field.key] = parseField(field, formState[field.key])
      }
    }

    await save(payload)
    message.value = '配置已保存。'
    await refresh()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败，请稍后重试。'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">{{ eyebrow || 'Config' }}</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">{{ title }}</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">{{ description }}</p>
    </section>

    <div
      v-if="message"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
    >
      {{ message }}
    </div>
    <div
      v-if="errorMessage"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
    >
      {{ errorMessage }}
    </div>

    <section
      v-for="section in sections"
      :key="section.title"
      class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm"
    >
      <div class="mb-5">
        <h2 class="text-xl font-black text-text">{{ section.title }}</h2>
        <p v-if="section.description" class="mt-2 text-sm leading-7 text-muted">
          {{ section.description }}
        </p>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <label
          v-for="field in section.fields"
          :key="field.key"
          class="block space-y-2"
          :class="field.type === 'json' || field.type === 'textarea' ? 'xl:col-span-2' : ''"
        >
          <span class="text-sm font-medium text-text">{{ field.label }}</span>
          <span v-if="field.description" class="block text-xs leading-6 text-muted">
            {{ field.description }}
          </span>

          <input
            v-if="field.type === 'text'"
            type="text"
            :value="String(formState[field.key] ?? '')"
            :placeholder="field.placeholder"
            class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="formState[field.key] = ($event.target as HTMLInputElement).value"
          >

          <textarea
            v-else-if="field.type === 'textarea'"
            :rows="field.rows || 4"
            :value="String(formState[field.key] ?? '')"
            :placeholder="field.placeholder"
            class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="formState[field.key] = ($event.target as HTMLTextAreaElement).value"
          />

          <select
            v-else-if="field.type === 'select'"
            :value="String(formState[field.key] ?? '')"
            class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @change="formState[field.key] = ($event.target as HTMLSelectElement).value"
          >
            <option
              v-for="option in field.options || []"
              :key="`${field.key}-${option.value}`"
              :value="String(option.value)"
            >
              {{ option.label }}
            </option>
          </select>

          <input
            v-else-if="field.type === 'number'"
            type="number"
            :value="Number(formState[field.key] ?? 0)"
            class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="formState[field.key] = Number(($event.target as HTMLInputElement).value)"
          >

          <button
            v-else-if="field.type === 'boolean'"
            type="button"
            class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20"
            @click="formState[field.key] = !Boolean(formState[field.key])"
          >
            <span class="text-sm text-muted">
              {{ Boolean(formState[field.key]) ? '当前已开启' : '当前已关闭' }}
            </span>
            <span
              class="relative inline-flex h-7 w-12 items-center rounded-full transition"
              :class="Boolean(formState[field.key]) ? 'bg-primary' : 'bg-surface-2'"
            >
              <span
                class="inline-block h-5 w-5 rounded-full bg-white transition"
                :class="Boolean(formState[field.key]) ? 'translate-x-6' : 'translate-x-1'"
              />
            </span>
          </button>

          <textarea
            v-else
            :rows="field.rows || 8"
            :value="String(formState[field.key] ?? '')"
            :placeholder="field.placeholder"
            class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="formState[field.key] = ($event.target as HTMLTextAreaElement).value"
          />
        </label>
      </div>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary"
        :disabled="loading || saving"
        @click="refresh"
      >
        刷新
      </button>
      <button
        type="button"
        class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60"
        :disabled="loading || saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : (saveLabel || '保存配置') }}
      </button>
    </div>
  </div>
</template>
