<script setup lang="ts">
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

const props = defineProps<{
  mode: 'create' | 'edit'
  pageId?: number
  initialData?: Partial<PageForm>
}>()

const emit = defineEmits<{
  saved: []
}>()

const api = useAdminApi()

const saving = ref(false)
const error = ref('')

const form = reactive<PageForm>({
  title: props.initialData?.title || '',
  slug: props.initialData?.slug || '',
  componentCode: props.initialData?.componentCode || '',
  template: props.initialData?.template || 'default',
  seoTitle: props.initialData?.seoTitle || '',
  seoDescription: props.initialData?.seoDescription || '',
  showInNav: props.initialData?.showInNav || false,
  navLabel: props.initialData?.navLabel || '',
  navOrder: props.initialData?.navOrder || 0,
  status: props.initialData?.status || 'draft',
})

const templates = [
  { value: 'default', label: '标准内容页', description: '适合关于页、说明页和常规长文信息页。', icon: 'i-heroicons-document-text' },
  { value: 'wide', label: '宽屏介绍页', description: '适合模块并列展示、图文双栏和服务介绍。', icon: 'i-heroicons-rectangle-group' },
  { value: 'full', label: '全宽活动页', description: '适合带 Hero 区的品牌页、活动页和专题页。', icon: 'i-heroicons-squares-plus' },
]

watch(() => props.initialData, (data) => {
  if (!data) {
    return
  }
  Object.assign(form, {
    title: data.title || '',
    slug: data.slug || '',
    componentCode: data.componentCode || '',
    template: data.template || 'default',
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    showInNav: data.showInNav || false,
    navLabel: data.navLabel || '',
    navOrder: data.navOrder || 0,
    status: data.status || 'draft',
  })
}, { immediate: true })

function getTemplateCode(template: PageForm['template']) {
  if (template === 'default') {
    return `<div class="max-w-4xl mx-auto px-6 py-14">
  <header class="mb-10 space-y-4">
    <p class="text-sm uppercase tracking-[0.24em] text-primary/80">Page Intro</p>
    <h1 class="text-4xl font-black tracking-tight text-text">{{ title }}</h1>
    <p class="text-lg leading-8 text-muted">这里可以写页面导语，用来承接页面主题与说明信息。</p>
  </header>
  <section class="space-y-6 text-base leading-8 text-text/90">
    <p>页面内容从这里开始。</p>
  </section>
</div>`
  }

  if (template === 'wide') {
    return `<div class="max-w-6xl mx-auto px-6 py-14">
  <header class="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.24em] text-primary/80">Overview</p>
      <h1 class="text-4xl font-black tracking-tight text-text">{{ title }}</h1>
    </div>
    <p class="max-w-xl text-base leading-8 text-muted">这里适合放一段横向布局的说明文案。</p>
  </header>
  <section class="grid gap-6 md:grid-cols-2">
    <div class="rounded-3xl border border-border bg-surface p-8">
      <h2 class="text-2xl font-bold text-text">左侧内容</h2>
      <p class="mt-4 text-base leading-8 text-muted">模块说明内容。</p>
    </div>
    <div class="rounded-3xl border border-border bg-surface p-8">
      <h2 class="text-2xl font-bold text-text">右侧内容</h2>
      <p class="mt-4 text-base leading-8 text-muted">模块说明内容。</p>
    </div>
  </section>
</div>`
  }

  return `<div class="w-full">
  <section class="bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] px-6 py-20 text-white">
    <div class="mx-auto max-w-5xl space-y-5">
      <p class="text-sm uppercase tracking-[0.24em] text-white/70">Special Page</p>
      <h1 class="text-5xl font-black tracking-tight">{{ title }}</h1>
      <p class="max-w-2xl text-lg leading-8 text-white/78">这里适合放全宽专题页面的开场内容。</p>
    </div>
  </section>
  <section class="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
    <article class="rounded-3xl border border-border bg-surface p-8">
      <h2 class="text-xl font-bold text-text">模块一</h2>
      <p class="mt-4 text-base leading-8 text-muted">描述内容。</p>
    </article>
    <article class="rounded-3xl border border-border bg-surface p-8">
      <h2 class="text-xl font-bold text-text">模块二</h2>
      <p class="mt-4 text-base leading-8 text-muted">描述内容。</p>
    </article>
    <article class="rounded-3xl border border-border bg-surface p-8">
      <h2 class="text-xl font-bold text-text">模块三</h2>
      <p class="mt-4 text-base leading-8 text-muted">描述内容。</p>
    </article>
  </section>
</div>`
}

function applyTemplate(template: PageForm['template']) {
  form.template = template
  if (!form.componentCode.trim() || props.mode === 'create') {
    form.componentCode = getTemplateCode(template)
  }
}

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function handleSave(nextStatus?: PageForm['status']) {
  if (!form.title.trim() || !form.slug.trim()) {
    error.value = '请先填写页面标题和 slug。'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const payload = {
      title: form.title,
      slug: form.slug,
      componentCode: form.componentCode,
      template: form.template,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      showInNav: form.showInNav,
      navLabel: form.navLabel || undefined,
      navOrder: form.navOrder,
      status: nextStatus ?? form.status,
    }

    if (props.mode === 'create') {
      await api.post('/api/pages', payload)
    }
    else if (props.pageId) {
      await api.put(`/api/pages/${props.pageId}`, payload)
    }

    emit('saved')
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '保存页面失败'
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!form.componentCode.trim()) {
    applyTemplate('default')
  }
})
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.12),rgba(34,184,207,0.08))] p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content · Pages</p>
          <h3 class="mt-3 text-3xl font-black tracking-tight text-text">{{ mode === 'create' ? '新建页面工作台' : '页面编辑工作台' }}</h3>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里用于创建或修改独立页面内容、展示模板、SEO 信息和导航挂载策略，让页面编辑流程和文章后台保持一致的工作体验。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary disabled:opacity-50"
            :disabled="saving"
            @click="handleSave('draft')"
          >
            {{ saving && form.status === 'draft' ? '保存中...' : '保存草稿' }}
          </button>
          <button
            class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-60"
            :disabled="saving"
            @click="handleSave('published')"
          >
            {{ saving ? '提交中...' : (mode === 'create' ? '创建并发布' : '保存并发布') }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ error }}
    </div>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-6">
        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h4 class="text-xl font-black tracking-tight text-text">页面标题与路由</h4>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-text">页面标题</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-base text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="输入页面标题"
                @blur="generateSlug"
              >
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-text">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="about-us"
              >
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-text">状态</label>
              <select
                v-model="form.status"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h4 class="text-xl font-black tracking-tight text-text">页面模板</h4>
          <p class="mt-1 text-sm text-muted">选择一个起始结构，再在下方代码区精修页面内容。</p>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <button
              v-for="template in templates"
              :key="template.value"
              class="rounded-3xl border p-4 text-left transition-all"
              :class="form.template === template.value ? 'border-primary/25 bg-primary/6 shadow-sm' : 'border-border/70 bg-background/65 hover:border-primary/20'"
              @click="applyTemplate(template.value as PageForm['template'])"
            >
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span :class="template.icon" class="h-5 w-5" />
              </span>
              <p class="mt-4 text-sm font-semibold text-text">{{ template.label }}</p>
              <p class="mt-2 text-xs leading-6 text-muted">{{ template.description }}</p>
            </button>
          </div>
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xl font-black tracking-tight text-text">组件代码</h4>
              <p class="mt-1 text-sm text-muted">直接编辑页面组件模板，适合快速构建独立页面内容。</p>
            </div>
            <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Vue Template</span>
          </div>
          <textarea
            v-model="form.componentCode"
            rows="24"
            class="mt-5 w-full rounded-3xl border border-border bg-[#f4f8ff] px-5 py-4 font-mono text-sm leading-7 text-[#21314f] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-[#182235] dark:text-[#e8f2ff]"
            placeholder="输入页面组件代码"
          ></textarea>
        </section>
      </div>

      <div class="space-y-6">
        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h4 class="text-xl font-black tracking-tight text-text">导航挂载</h4>
          <div class="mt-5 space-y-4">
            <label class="flex items-center justify-between rounded-2xl border border-border/70 bg-background/65 px-4 py-3 text-sm text-text">
              <span>在前台导航中显示</span>
              <input v-model="form.showInNav" type="checkbox" class="accent-primary">
            </label>
            <div v-if="form.showInNav" class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium text-text">导航名称</label>
                <input
                  v-model="form.navLabel"
                  type="text"
                  class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="前台导航显示名称"
                >
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-text">导航排序</label>
                <input
                  v-model.number="form.navOrder"
                  type="number"
                  class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
          <h4 class="text-xl font-black tracking-tight text-text">SEO 信息</h4>
          <div class="mt-5 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-text">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="SEO 标题"
              >
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-text">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                rows="5"
                class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="SEO 描述"
              ></textarea>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
