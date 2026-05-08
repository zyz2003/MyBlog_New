<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  title: '',
  slug: '',
  componentCode: '',
  template: 'default' as 'default' | 'wide' | 'full',
  seoTitle: '',
  seoDescription: '',
  showInNav: false,
  navLabel: '',
  navOrder: 0,
  status: 'draft' as 'draft' | 'published',
})

const templates = [
  { value: 'default', label: '默认模板', desc: '标准布局，最大宽度 4xl，适合普通页面' },
  { value: 'wide', label: '宽屏模板', desc: '更宽的布局，最大宽度 6xl，适合图片展示' },
  { value: 'full', label: '全宽模板', desc: '全宽布局，无侧边限制，适合落地页' },
]

function applyTemplate(t: 'default' | 'wide' | 'full') {
  form.template = t
  if (t === 'default') {
    form.componentCode = `<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">{{ title }}</h1>
    <div class="prose">
      <p>在此输入页面内容...</p>
    </div>
  </div>
<\/template>

<script setup>
const title = ref('')
title.value = '页面标题'
<\/script>`
  } else if (t === 'wide') {
    form.componentCode = `<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">{{ title }}</h1>
    <slot />
  </div>
<\/template>

<script setup>
const title = ref('')
title.value = '页面标题'
<\/script>`
  } else {
    form.componentCode = `<template>
  <div class="w-full py-12 px-4">
    <h1 class="text-4xl font-bold mb-8 text-center">{{ title }}</h1>
    <slot />
  </div>
<\/template>

<script setup>
const title = ref('')
title.value = '页面标题'
<\/script>`
  }
}

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function handleSubmit() {
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

  loading.value = true
  try {
    const result = await api.post<{ id: number }>('/api/pages', {
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败'
    alert(msg)
  } finally {
    loading.value = false
  }
}

async function handleSaveAndEdit() {
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

  loading.value = true
  try {
    const result = await api.post<{ id: number }>('/api/pages', {
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
    router.push(`/admin/pages/${result.id}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败'
    alert(msg)
  } finally {
    loading.value = false
  }
}

// Initialize with default template
onMounted(() => {
  applyTemplate('default')
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <button
        class="p-2 rounded-lg transition-colors hover:bg-amber-100"
        style="background: #FEF3C7; color: #92400E;"
        @click="router.push('/admin/pages')"
      >
        <span class="i-heroicons-arrow-left w-5 h-5" />
      </button>
      <h1 class="text-2xl font-bold text-amber-900">新建页面</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Editor -->
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <label class="block text-sm font-medium text-amber-800 mb-2">页面标题</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-3 border rounded-xl text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="输入页面标题"
            @blur="generateSlug"
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
                @click="applyTemplate(t.value)"
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
                placeholder="page-slug"
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
            :disabled="loading"
            @click="handleSubmit"
          >
            {{ loading ? '保存中...' : '保存并返回' }}
          </button>
          <button
            type="button"
            class="w-full py-3 text-white font-semibold rounded-xl transition-all cursor-pointer"
            style="background: linear-gradient(to right, #10B981, #059669);"
            :disabled="loading"
            @click="handleSaveAndEdit"
          >
            {{ loading ? '保存中...' : '保存并继续编辑' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>