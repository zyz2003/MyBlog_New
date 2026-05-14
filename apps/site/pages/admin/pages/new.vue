<script setup lang="ts">
const api = useAdminApi()
const router = useRouter()

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
const saving = ref(false)

const templates = [
  { value: 'default', label: '默认', icon: 'layout' },
  { value: 'wide', label: '宽屏', icon: 'layout-wide' },
  { value: 'full', label: '全宽', icon: 'layout-full' },
]

function applyTemplate(t: string) {
  templateType.value = t as 'default' | 'wide' | 'full'
  if (t === 'default') {
    componentCode.value = `<div class="max-w-4xl mx-auto py-12 px-4">
  <h1 class="text-3xl font-bold mb-6">{{ title }}</h1>
  <div class="space-y-4">
    <p>页面内容...</p>
  </div>
</div>`
  } else if (t === 'wide') {
    componentCode.value = `<div class="max-w-6xl mx-auto py-12 px-4">
  <h1 class="text-3xl font-bold mb-8">{{ title }}</h1>
  <div class="grid md:grid-cols-2 gap-8">
    <div><p>左侧内容</p></div>
    <div class="bg-surface-2 rounded-xl p-8"><p>右侧内容</p></div>
  </div>
</div>`
  } else {
    componentCode.value = `<div class="w-full">
  <div class="bg-gradient-to-r from-primary to-accent py-16 text-center text-white">
    <h1 class="text-4xl font-bold">{{ title }}</h1>
  </div>
  <div class="max-w-5xl mx-auto py-12 grid md:grid-cols-3 gap-6">
    <div class="p-6 bg-surface-2 rounded-xl"><p>特性一</p></div>
    <div class="p-6 bg-surface-2 rounded-xl"><p>特性二</p></div>
    <div class="p-6 bg-surface-2 rounded-xl"><p>特性三</p></div>
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
  if (!title.value.trim() || !slug.value.trim()) {
    alert('请填写标题和slug')
    return
  }
  saving.value = true
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
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  applyTemplate('default')
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
          <img src="/icons/write.svg" class="w-6 h-6" alt="">
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">新建页面</h1>
          <p class="text-sm text-gray-500">创建自定义页面内容</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-all"
          @click="router.push('/admin/pages')"
        >
          取消
        </button>
        <button
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
          :disabled="saving"
          @click="status = 'draft'; handleSubmit()"
        >
          保存草稿
        </button>
        <button
          class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          :disabled="saving"
          @click="status = 'published'; handleSubmit()"
        >
          <img src="/icons/check.svg" class="w-4 h-4" alt="">
          {{ saving ? '保存中...' : '发布' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Editor Panel -->
      <div class="col-span-12 lg:col-span-8 space-y-5">
        <!-- Title -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <input
            v-model="title"
            type="text"
            class="w-full text-xl font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent"
            placeholder="输入页面标题..."
            @blur="generateSlug"
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
              :class="templateType === t.value
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'"
              @click="applyTemplate(t.value)"
            >
              <img :src="`/icons/${t.icon}.svg`" class="w-8 h-8" alt="">
              <span class="text-sm font-medium" :class="templateType === t.value ? 'text-amber-700' : 'text-gray-600'">
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
            v-model="componentCode"
            rows="18"
            class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300"
            placeholder="输入组件代码..."
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
                v-model="slug"
                type="text"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 font-mono"
                placeholder="page-slug"
              >
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">状态</label>
              <select
                v-model="status"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">排序</label>
              <input
                v-model.number="navOrder"
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
                :class="showInNav ? 'bg-amber-500' : 'bg-gray-200'"
                @click="showInNav = !showInNav"
              >
                <span
                  class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  :class="showInNav ? 'left-5.5' : 'left-0.5'"
                />
              </button>
            </div>

            <div v-if="showInNav">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">导航标签</label>
              <input
                v-model="navLabel"
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
                v-model="seoTitle"
                type="text"
                class="w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="SEO 标题"
              >
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">SEO 描述</label>
              <textarea
                v-model="seoDescription"
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