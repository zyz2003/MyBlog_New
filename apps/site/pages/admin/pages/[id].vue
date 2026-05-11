<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

const route = useRoute()
const api = useAdminApi()
const router = useRouter()

const pageId = Number(route.params.id)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

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
  { value: 'default', label: '默认模板', desc: '标准布局，最大宽度 4xl' },
  { value: 'wide', label: '宽屏模板', desc: '更宽的布局，最大宽度 6xl' },
  { value: 'full', label: '全宽模板', desc: '全宽布局，无侧边限制' },
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
  } catch (e) {
    console.error('Failed to fetch page:', e)
    alert('加载页面失败')
    router.push('/admin/pages')
  } finally {
    loading.value = false
  }
}

async function handleSubmit(target: 'list' | 'continue' = 'list') {
  if (!form.title.trim()) {
    alert('请输入页面标题')
    return
  }
  if (!form.slug.trim()) {
    alert('请输入 slug')
    return
  }
  if (!form.componentCode.trim()) {
    alert('请输入组件代码')
    return
  }

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

    if (target === 'list') {
      router.push('/admin/pages')
    } else {
      alert('保存成功')
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败'
    alert(msg)
  } finally {
    saving.value = false
  }
}

function copyLink() {
  const url = `${window.location.origin}/${form.slug}`
  navigator.clipboard.writeText(url).then(() => {
    alert('链接已复制到剪贴板')
  }).catch(() => {
    alert('复制失败，请手动复制')
  })
}

function viewPage() {
  window.open(`/${form.slug}`, '_blank')
}

function deletePage() {
  if (!confirm('确定删除此页面？此操作不可撤销。')) return

  deleting.value = true
  api.del(`/api/pages/${pageId}`).then(() => {
    alert('页面已删除')
    router.push('/admin/pages')
  }).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : '删除失败'
    alert(msg)
  }).finally(() => {
    deleting.value = false
  })
}

onMounted(() => {
  fetchPage()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-lg transition-colors hover:bg-amber-100"
          style="background: #FEF3C7; color: #92400E;"
          @click="router.push('/admin/pages')"
        >
          <span class="i-heroicons-arrow-left w-5 h-5" />
        </button>
        <h1 class="text-2xl font-bold text-amber-900">
          {{ loading ? '加载中...' : `编辑页面：${form.title}` }}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
          @click="copyLink"
        >
          <span class="i-heroicons-link w-4 h-4 mr-1 inline" />
          复制链接
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
          @click="viewPage"
        >
          <span class="i-heroicons-eye w-4 h-4 mr-1 inline" />
          查看前台
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          :disabled="deleting"
          @click="deletePage"
        >
          <span class="i-heroicons-trash w-4 h-4 mr-1 inline" />
          {{ deleting ? '删除中...' : '删除' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="rounded-xl p-8 text-center" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
      <div class="animate-pulse text-amber-600">加载中...</div>
    </div>

    <!-- Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Editor -->
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <label class="block text-sm font-medium text-amber-800 mb-2">页面标题</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-3 border rounded-xl text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="输入页面标题"
          />
        </div>

        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-amber-800">组件代码 (Vue SFC)</label>
            <div class="flex gap-2">
              <button
                v-for="t in templates"
                :key="t.value"
                type="button"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer"
                :class="form.template === t.value ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-amber-200 text-amber-600 hover:bg-amber-50'"
                @click="form.template = t.value as 'default' | 'wide' | 'full'"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <textarea
            v-model="form.componentCode"
            rows="20"
            class="w-full px-4 py-3 font-mono text-sm border rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-amber-500"
            style="background: #FFFBEB; color: #78350F;"
            placeholder="<template>...</template>"
          />
          <p class="text-xs text-gray-500 mt-2">支持 Vue 3 单文件组件格式，使用 ref() 和 computed()</p>
        </div>
      </div>

      <!-- Settings Sidebar -->
      <div class="space-y-4">
        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <h3 class="text-sm font-medium text-amber-800 mb-4">页面设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-amber-600 mb-1">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">状态</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="showInNav"
                v-model="form.showInNav"
                type="checkbox"
                class="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label for="showInNav" class="text-sm text-amber-800">显示在导航栏</label>
            </div>
            <div v-if="form.showInNav">
              <label class="block text-xs text-amber-600 mb-1">导航标签</label>
              <input
                v-model="form.navLabel"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="默认使用标题"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">排序</label>
              <input
                v-model.number="form.navOrder"
                type="number"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <h3 class="text-sm font-medium text-amber-800 mb-4">SEO 设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-amber-600 mb-1">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="留空使用页面标题"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="页面描述"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <button
            type="button"
            class="w-full py-3 text-white font-semibold rounded-xl transition-all cursor-pointer"
            style="background: linear-gradient(to right, #F59E0B, #EA580C);"
            :disabled="saving"
            @click="handleSubmit('list')"
          >
            {{ saving ? '保存中...' : '保存并返回' }}
          </button>
          <button
            type="button"
            class="w-full py-3 text-white font-semibold rounded-xl transition-all cursor-pointer"
            style="background: linear-gradient(to right, #10B981, #059669);"
            :disabled="saving"
            @click="handleSubmit('continue')"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>