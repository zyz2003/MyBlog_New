<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const api = useAdminApi()
const router = useRouter()

const pageId = Number(route.params.id)
const loading = ref(true)
const saving = ref(false)

interface PageForm {
  title: string
  slug: string
  componentCode: string
  template: 'default' | 'wide' | 'full'
  seoTitle: string
  seoDescription: string
  showInNav: boolean
  navLabel: string
  navOrder: number
  status: 'draft' | 'published'
}

const form = reactive<PageForm>({
  title: '',
  slug: '',
  componentCode: '',
  template: 'default',
  seoTitle: '',
  seoDescription: '',
  showInNav: false,
  navLabel: '',
  navOrder: 0,
  status: 'draft',
})

const templates = [
  { value: 'default', label: '默认模板' },
  { value: 'wide', label: '宽屏模板' },
  { value: 'full', label: '全宽模板' },
]

async function fetchPage() {
  loading.value = true
  try {
    const page = await api.get<PageForm>(`/api/pages/${pageId}`)
    Object.assign(form, {
      title: page.title,
      slug: page.slug,
      componentCode: page.componentCode,
      template: page.template as 'default' | 'wide' | 'full',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      showInNav: page.showInNav,
      navLabel: page.navLabel || '',
      navOrder: page.navOrder,
      status: page.status as 'draft' | 'published',
    })
  }
  catch (e) {
    console.error('Failed to fetch page:', e)
  }
  finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!form.title.trim()) return alert('请输入标题')
  if (!form.slug.trim()) return alert('请输入 slug')

  saving.value = true
  try {
    await api.put(`/api/pages/${pageId}`, {
      title: form.title,
      slug: form.slug,
      componentCode: form.componentCode,
      template: form.template,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      showInNav: form.showInNav,
      navLabel: form.navLabel || undefined,
      navOrder: form.navOrder,
      status: form.status,
    })
    router.push('/admin/pages')
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败'
    alert(msg)
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchPage()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/pages" class="p-2 hover:bg-gray-100 rounded">
          <span class="i-heroicons-arrow-left w-5 h-5" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">编辑页面</h1>
      </div>
    </div>

    <div v-if="loading" class="card p-8">
      <div class="space-y-4">
        <div class="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
        <div class="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

    <form v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6" @submit.prevent="handleSubmit">
      <!-- Left: Code editor -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-2">标题</h3>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="页面标题"
          />
        </div>

        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-2">组件代码</h3>
          <textarea
            v-model="form.componentCode"
            rows="20"
            class="w-full px-3 py-2 font-mono text-sm border rounded-md resize-y"
          />
        </div>
      </div>

      <!-- Right: Config -->
      <div class="space-y-4">
        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-4">页面设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">Slug</label>
              <input v-model="form.slug" type="text" class="w-full px-3 py-2 border rounded-md font-mono text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">模板</label>
              <select v-model="form.template" class="w-full px-3 py-2 border rounded-md">
                <option v-for="t in templates" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">状态</label>
              <select v-model="form.status" class="w-full px-3 py-2 border rounded-md">
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input id="showInNav" v-model="form.showInNav" type="checkbox" class="rounded border-gray-300" />
              <label for="showInNav" class="text-sm text-gray-700">显示在导航栏</label>
            </div>
            <div v-if="form.showInNav">
              <label class="block text-sm text-gray-500 mb-1">导航标签</label>
              <input v-model="form.navLabel" type="text" class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">排序</label>
              <input v-model.number="form.navOrder" type="number" class="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-4">SEO 设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">SEO 标题</label>
              <input v-model="form.seoTitle" type="text" class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">SEO 描述</label>
              <textarea v-model="form.seoDescription" rows="3" class="w-full px-3 py-2 border rounded-md resize-none" />
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full py-3" :disabled="saving">
          {{ saving ? '保存中...' : '保存更改' }}
        </button>
      </div>
    </form>
  </div>
</template>