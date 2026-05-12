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
  title: '', slug: '', componentCode: '',
  template: 'default', seoTitle: '', seoDescription: '',
  showInNav: false, navLabel: '', navOrder: 0, status: 'draft',
})

const templates = [
  { value: 'default', label: '默认', icon: 'layout' },
  { value: 'wide', label: '宽屏', icon: 'layout-wide' },
  { value: 'full', label: '全宽', icon: 'layout-full' },
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
  } catch {
    alert('加载失败')
    router.push('/admin/pages')
  } finally {
    loading.value = false
  }
}

async function handleSave(status?: 'draft' | 'published', andBack = false) {
  if (!form.title.trim() || !form.slug.trim()) {
    alert('请填写标题和slug')
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
      status: status ?? form.status,
    })
    if (andBack) router.push('/admin/pages')
    else alert('已保存')
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function deletePage() {
  if (!confirm('确定删除此页面？')) return
  try {
    await api.del(`/api/pages/${pageId}`)
    router.push('/admin/pages')
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '删除失败')
  }
}

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/${form.slug}`)
}

onMounted(() => {
  fetchPage()
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-all hover:-translate-x-1"
          @click="router.push('/admin/pages')"
        >
          <img src="/icons/arrow-left.svg" class="w-5 h-5" alt="">
        </button>
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
          <img src="/icons/edit.svg" class="w-6 h-6" alt="">
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">编辑页面</h1>
          <p class="text-sm text-gray-500">修改页面内容</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-all"
          @click="copyLink"
        >
          <img src="/icons/link.svg" class="w-4 h-4" alt="">
          复制链接
        </button>
        <button
          class="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-all"
          @click="deletePage"
        >
          <img src="/icons/trash.svg" class="w-4 h-4" alt="">
          删除
        </button>
        <button
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
          :disabled="saving"
          @click="handleSave('draft')"
        >
          保存草稿
        </button>
        <button
          class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          :disabled="saving"
          @click="handleSave('published', true)"
        >
          <img src="/icons/check.svg" class="w-4 h-4" alt="">
          {{ saving ? '保存中...' : '发布' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-500 animate-spin" />
    </div>

    <!-- Form -->
    <div v-else class="grid grid-cols-12 gap-6">
      <!-- Editor Panel -->
      <div class="col-span-12 lg:col-span-8 space-y-5">
        <!-- Title -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <input
            v-model="form.title"
            type="text"
            class="w-full text-xl font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent"
            placeholder="输入页面标题..."
          >
        </div>

        <!-- Template Selection -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <img src="/icons/layout.svg" class="w-5 h-5" alt="">
            <span class="text-sm font-medium text-gray-700">选择模板</span>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="t in templates"
              :key="t.value"
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2"
              :class="form.template === t.value
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'"
              @click="form.template = t.value as 'default' | 'wide' | 'full'"
            >
              <img :src="`/icons/${t.icon}.svg`" class="w-8 h-8" alt="">
              <span class="text-sm font-medium" :class="form.template === t.value ? 'text-amber-700' : 'text-gray-600'">
                {{ t.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Code Editor -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <img src="/icons/code.svg" class="w-5 h-5" alt="">
              <span class="text-sm font-medium text-gray-700">组件代码</span>
            </div>
            <span class="text-xs text-gray-400">Vue Template</span>
          </div>
          <textarea
            v-model="form.componentCode"
            rows="18"
            class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300"
          />
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="col-span-12 lg:col-span-4 space-y-5">
        <!-- Basic Settings -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <img src="/icons/settings.svg" class="w-5 h-5" alt="">
            <span class="text-sm font-semibold text-gray-900">基础设置</span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 font-mono"
                placeholder="page-slug"
              >
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">状态</label>
              <select
                v-model="form.status"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">排序</label>
              <input
                v-model.number="form.navOrder"
                type="number"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
            </div>

            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <img src="/icons/nav.svg" class="w-4 h-4" alt="">
                <span class="text-sm text-gray-700">导航显示</span>
              </div>
              <button
                class="w-11 h-6 rounded-full relative cursor-pointer transition-colors"
                :class="form.showInNav ? 'bg-amber-500' : 'bg-gray-200'"
                @click="form.showInNav = !form.showInNav"
              >
                <span
                  class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  :class="form.showInNav ? 'left-5.5' : 'left-0.5'"
                />
              </button>
            </div>

            <div v-if="form.showInNav">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">导航标签</label>
              <input
                v-model="form.navLabel"
                type="text"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="导航显示名称"
              >
            </div>
          </div>
        </div>

        <!-- SEO Settings -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <img src="/icons/search.svg" class="w-5 h-5" alt="">
            <span class="text-sm font-semibold text-gray-900">SEO 设置</span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="SEO 标题"
              >
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                rows="3"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="SEO 描述..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>