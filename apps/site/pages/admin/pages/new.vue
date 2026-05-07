<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()
const router = useRouter()

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

const loading = ref(false)
const form = reactive<PageForm>({
  title: '',
  slug: '',
  componentCode: `<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">{{ title }}</h1>
    <p class="text-gray-600">在此输入页面内容...</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('')
</script>`,
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

function applyTemplate(t: string) {
  form.template = t as 'default' | 'wide' | 'full'
  if (t === 'default') {
    form.componentCode = `<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">\${form.title}</h1>
    <p class="text-gray-600">在此输入页面内容...</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('')
</script>`
  }
  else if (t === 'wide') {
    form.componentCode = `<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">\${form.title}</h1>
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('')
</script>`
  }
  else {
    form.componentCode = `<template>
  <div class="w-full py-8">
    <h1 class="text-2xl font-bold mb-6 text-center">\${form.title}</h1>
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('')
</script>`
  }
}

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function handleSubmit() {
  if (!form.title.trim()) return alert('请输入标题')
  if (!form.slug.trim()) return alert('请输入 slug')
  if (!form.componentCode.trim()) return alert('请输入组件代码')

  loading.value = true
  try {
    await api.post('/api/pages', {
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
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/pages" class="p-2 hover:bg-gray-100 rounded">
          <span class="i-heroicons-arrow-left w-5 h-5" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">新建页面</h1>
      </div>
    </div>

    <form class="grid grid-cols-1 lg:grid-cols-3 gap-6" @submit.prevent="handleSubmit">
      <!-- Left: Code editor -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-2">标题</h3>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="页面标题"
            @blur="generateSlug"
          />
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-700">组件代码</h3>
            <div class="flex gap-2">
              <button
                v-for="t in templates"
                :key="t.value"
                type="button"
                class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                :class="form.template === t.value ? 'border-primary text-primary' : ''"
                @click="applyTemplate(t.value)"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <textarea
            v-model="form.componentCode"
            rows="20"
            class="w-full px-3 py-2 font-mono text-sm border rounded-md resize-y"
            placeholder="<template>...</template>"
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
              <input
                v-model="form.slug"
                type="text"
                class="w-full px-3 py-2 border rounded-md font-mono text-sm"
                placeholder="page-slug"
              />
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
              <input
                id="showInNav"
                v-model="form.showInNav"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="showInNav" class="text-sm text-gray-700">显示在导航栏</label>
            </div>

            <div v-if="form.showInNav">
              <label class="block text-sm text-gray-500 mb-1">导航标签</label>
              <input
                v-model="form.navLabel"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                placeholder="默认使用标题"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-500 mb-1">排序</label>
              <input
                v-model.number="form.navOrder"
                type="number"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-sm font-medium text-gray-700 mb-4">SEO 设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                placeholder="留空使用页面标题"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                rows="3"
                class="w-full px-3 py-2 border rounded-md resize-none"
                placeholder="页面描述"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary w-full py-3"
          :disabled="loading"
        >
          {{ loading ? '保存中...' : '保存页面' }}
        </button>
      </div>
    </form>
  </div>
</template>