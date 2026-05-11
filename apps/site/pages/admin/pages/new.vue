<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

const api = useAdminApi()
const router = useRouter()
const loading = ref(false)

const title = ref('')
const slug = ref('')
const componentCode = ref('')
const templateType = ref<'default' | 'wide' | 'full'>('default')
const seoTitle = ref('')
const seoDescription = ref('')
const showInNav = ref(false)
const navLabel = ref('')
const navOrder = ref(0)
const status = ref<'draft' | 'published'>('draft')

const templateOptions = [
  { value: 'default', label: '默认模板' },
  { value: 'wide', label: '宽屏模板' },
  { value: 'full', label: '全宽模板' },
]

function applyTemplate(t: string) {
  templateType.value = t as 'default' | 'wide' | 'full'
  if (t === 'default') {
    componentCode.value = `<div class="max-w-4xl mx-auto py-12 px-4">
  <h1 class="text-3xl font-bold text-amber-900 mb-6">{{ title }}</h1>
  <div class="prose max-w-none text-gray-700 leading-relaxed space-y-4">
    <p>这是一个示例页面内容。你可以在这里编写任何 HTML 代码，包括段落、列表、图片等。</p>
    <p>系统会自动将这个组件代码渲染到前台页面中。支持的特性包括：</p>
    <ul class="list-disc list-inside space-y-2 ml-4">
      <li>纯 HTML 标签和 Tailwind CSS 类名</li>
      <li><code>{{ title }}</code> 插值表达式显示页面标题</li>
      <li>响应式布局和自定义样式</li>
    </ul>
    <p class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
      提示：点击上方模板按钮可以切换不同的布局宽度。
    </p>
  </div>
</div>`
  } else if (t === 'wide') {
    componentCode.value = `<div class="max-w-6xl mx-auto py-12 px-4">
  <h1 class="text-3xl font-bold text-amber-900 mb-8">{{ title }}</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="prose text-gray-700 leading-relaxed space-y-4">
      <p>宽屏模板适合展示更多内容，比如图文并排布局。左侧可以放置文字说明，右侧可以放置图片或其他媒体内容。</p>
      <p>你可以自由调整这里的 HTML 结构，添加更多列或组件。</p>
      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 class="font-semibold text-blue-900 mb-2">特色功能</h3>
        <ul class="list-disc list-inside space-y-1 text-blue-800">
          <li>更宽的容器（最大 6xl）</li>
          <li>适合展示图片画廊</li>
          <li>支持多列网格布局</li>
        </ul>
      </div>
    </div>
    <div class="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
      <div class="text-center">
        <span class="text-6xl mb-4 block">🖼️</span>
        <p class="text-amber-800 font-medium">图片展示区域</p>
      </div>
    </div>
  </div>
</div>`
  } else {
    componentCode.value = `<div class="w-full">
  <div class="bg-gradient-to-r from-amber-600 to-orange-600 py-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl font-bold text-white mb-6">{{ title }}</h1>
      <p class="text-xl text-amber-100 mb-8">全宽模板适合打造精美的落地页，标题区域可以添加背景色或背景图。</p>
      <button class="px-8 py-3 bg-white text-amber-600 font-semibold rounded-full hover:bg-amber-50 transition-colors">
        立即行动
      </button>
    </div>
  </div>
  <div class="max-w-5xl mx-auto py-16 px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div class="p-6 rounded-xl bg-gray-50">
        <span class="text-4xl mb-3 block">🚀</span>
        <h3 class="font-bold text-gray-900 mb-2">快速启动</h3>
        <p class="text-gray-600">几分钟内创建精美的自定义页面</p>
      </div>
      <div class="p-6 rounded-xl bg-gray-50">
        <span class="text-4xl mb-3 block">🎨</span>
        <h3 class="font-bold text-gray-900 mb-2">灵活定制</h3>
        <p class="text-gray-600">使用 HTML 和 Tailwind CSS 自由设计</p>
      </div>
      <div class="p-6 rounded-xl bg-gray-50">
        <span class="text-4xl mb-3 block">📱</span>
        <h3 class="font-bold text-gray-900 mb-2">响应式设计</h3>
        <p class="text-gray-600">完美适配桌面和移动设备</p>
      </div>
    </div>
  </div>
</div>`
  }
}

function generateSlug() {
  slug.value = title.value
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function handleSubmit() {
  if (!title.value.trim()) {
    alert('请输入页面标题')
    return
  }
  if (!slug.value.trim()) {
    alert('请输入 slug')
    return
  }
  if (!componentCode.value.trim()) {
    alert('请输入组件代码')
    return
  }

  loading.value = true
  try {
    await api.post('/api/pages', {
      title: title.value,
      slug: slug.value,
      componentCode: componentCode.value,
      template: templateType.value,
      seoTitle: seoTitle.value || undefined,
      seoDescription: seoDescription.value || undefined,
      showInNav: showInNav.value,
      navLabel: navLabel.value || undefined,
      navOrder: navOrder.value,
      status: status.value,
    })
    router.push('/admin/pages')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败'
    alert(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  applyTemplate('default')
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button
        class="p-2 rounded-lg transition-colors hover:bg-amber-100"
        style="background: #FEF3C7; color: #92400E;"
        @click="router.push('/admin/pages')"
      >
        返回
      </button>
      <h1 class="text-2xl font-bold text-amber-900">新建页面</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <label class="block text-sm font-medium text-amber-800 mb-2">页面标题</label>
          <input
            v-model="title"
            type="text"
            class="w-full px-4 py-3 border rounded-xl text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="输入页面标题"
            @blur="generateSlug"
          />
        </div>

        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-amber-800">组件代码</label>
            <div class="flex gap-2">
              <button
                v-for="t in templateOptions"
                :key="t.value"
                type="button"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer"
                :class="templateType === t.value ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-amber-200 text-amber-600 hover:bg-amber-50'"
                @click="applyTemplate(t.value)"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <textarea
            v-model="componentCode"
            rows="15"
            class="w-full px-4 py-3 font-mono text-sm border rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-amber-500"
            style="background: #FFFBEB; color: #78350F;"
            placeholder="输入 HTML 组件代码"
          />
          <p class="text-xs text-gray-500 mt-2">输入 HTML 模板代码，支持 {{ title }} 插值</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl p-6 shadow-sm" style="background: rgba(255,255,255,0.9); border: 1px solid #FDE68A;">
          <h3 class="text-sm font-medium text-amber-800 mb-4">页面设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-amber-600 mb-1">Slug</label>
              <input
                v-model="slug"
                type="text"
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="page-slug"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">状态</label>
              <select
                v-model="status"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="showInNav"
                v-model="showInNav"
                type="checkbox"
                class="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label for="showInNav" class="text-sm text-amber-800">显示在导航栏</label>
            </div>
            <div v-if="showInNav">
              <label class="block text-xs text-amber-600 mb-1">导航标签</label>
              <input
                v-model="navLabel"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="默认使用标题"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">排序</label>
              <input
                v-model.number="navOrder"
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
                v-model="seoTitle"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="留空使用页面标题"
              />
            </div>
            <div>
              <label class="block text-xs text-amber-600 mb-1">SEO 描述</label>
              <textarea
                v-model="seoDescription"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="页面描述"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full py-3 text-white font-semibold rounded-xl transition-all cursor-pointer"
          style="background: linear-gradient(to right, #F59E0B, #EA580C);"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? '保存中...' : '保存页面' }}
        </button>
      </div>
    </div>
  </div>
</template>
