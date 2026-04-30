<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean'
  placeholder?: string
  min?: number
  max?: number
}

interface TabDef {
  id: string
  label: string
  icon: string
  fields: FieldDef[]
}

const tabs: TabDef[] = [
  {
    id: 'site',
    label: 'Site',
    icon: 'i-heroicons-globe-alt',
    fields: [
      { key: 'siteTitle', label: 'Site Title', type: 'text', placeholder: 'My Blog' },
      { key: 'siteDescription', label: 'Site Description', type: 'textarea', placeholder: 'A brief description of your blog' },
      { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://example.com' },
      { key: 'logo', label: 'Logo URL', type: 'text', placeholder: '/logo.png' },
      { key: 'favicon', label: 'Favicon URL', type: 'text', placeholder: '/favicon.ico' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: 'i-heroicons-magnifying-glass',
    fields: [
      { key: 'seoTitle', label: 'SEO Title', type: 'text', placeholder: 'Default page title' },
      { key: 'seoDescription', label: 'SEO Description', type: 'textarea', placeholder: 'Default meta description' },
      { key: 'seoKeywords', label: 'SEO Keywords', type: 'text', placeholder: 'blog, articles, tech' },
    ],
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: 'i-heroicons-book-open',
    fields: [
      { key: 'postsPerPage', label: 'Posts Per Page', type: 'number', min: 1, max: 100 },
      { key: 'enableComments', label: 'Enable Comments', type: 'boolean' },
      { key: 'enableRss', label: 'Enable RSS Feed', type: 'boolean' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: 'i-heroicons-share',
    fields: [
      { key: 'github', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/username' },
      { key: 'twitter', label: 'Twitter URL', type: 'text', placeholder: 'https://twitter.com/username' },
      { key: 'weibo', label: 'Weibo URL', type: 'text', placeholder: 'https://weibo.com/username' },
      { key: 'email', label: 'Contact Email', type: 'text', placeholder: 'hello@example.com' },
    ],
  },
]

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('site')
const settingsValues = ref<Record<string, unknown>>({})
const changedKeys = ref(new Set<string>())
const saveSuccess = ref(false)

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown; category: string }>>>('/api/settings')

    // Flatten grouped settings into a key-value map
    const values: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        values[row.key] = row.value
      }
    }

    // Set defaults for missing fields
    for (const tab of tabs) {
      for (const field of tab.fields) {
        if (!(field.key in values)) {
          if (field.type === 'boolean') values[field.key] = false
          else if (field.type === 'number') values[field.key] = field.min ?? 0
          else values[field.key] = ''
        }
      }
    }

    settingsValues.value = values
  }
  catch (e) {
    console.error('Failed to fetch settings:', e)
  }
  finally {
    loading.value = false
  }
}

function handleFieldChange(tabId: string, updatedValues: Record<string, unknown>) {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return

  for (const field of tab.fields) {
    if (updatedValues[field.key] !== settingsValues.value[field.key]) {
      changedKeys.value.add(field.key)
    }
  }

  settingsValues.value = { ...settingsValues.value, ...updatedValues }
}

async function handleSave() {
  if (changedKeys.value.size === 0) return

  saving.value = true
  saveSuccess.value = false

  try {
    const items = Array.from(changedKeys.value).map(key => ({
      key,
      value: settingsValues.value[key],
    }))

    await api.put('/api/settings', { items })
    changedKeys.value.clear()
    saveSuccess.value = true

    // Hide success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to save settings'
    alert(message)
  }
  finally {
    saving.value = false
  }
}

const activeTabDef = computed(() => tabs.find(t => t.id === activeTab) || tabs[0])
const hasChanges = computed(() => changedKeys.value.size > 0)

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" />
          Saved successfully
        </span>
        <button
          class="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          :disabled="!hasChanges || saving"
          :class="{ 'opacity-50 cursor-not-allowed': !hasChanges || saving }"
          @click="handleSave"
        >
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-10 bg-gray-100 rounded animate-pulse" />
      <div class="h-64 bg-gray-100 rounded animate-pulse" />
    </div>

    <!-- Settings content -->
    <div v-else>
      <!-- Tab navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="activeTab = tab.id"
          >
            <span :class="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div class="card p-6">
        <AdminSettingsSettingsForm
          :fields="activeTabDef.fields"
          :model-value="settingsValues"
          @update:model-value="handleFieldChange(activeTab, $event)"
        />
      </div>
    </div>
  </div>
</template>
