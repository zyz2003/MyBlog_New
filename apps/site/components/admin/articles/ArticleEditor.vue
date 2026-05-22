<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Article</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">{{ article ? '编辑文章' : '新建文章' }}</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        填写文章标题、内容、分类标签与 AnZhiYu Front Matter 字段，保存后前台立刻生效。
      </p>
    </section>

    <!-- 基本信息 -->
    <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">基本信息</h2>
      <div class="mt-5 space-y-5">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">文章标题</span>
          <input v-model="form.title" type="text" placeholder="输入文章标题" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
        </label>
        <div class="grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">文章链接 (Slug)</span>
            <input v-model="form.slug" type="text" placeholder="article-url-slug" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">发布状态</span>
            <select v-model="form.status" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="scheduled">定时发布</option>
            </select>
          </label>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <span class="block text-sm font-medium text-text mb-2">分类</span>
            <CategorySelector v-model="form.categoryId" />
          </div>
          <div>
            <span class="block text-sm font-medium text-text mb-2">标签</span>
            <TagInput v-model="form.tagIds" />
          </div>
        </div>
        <div v-if="form.status === 'scheduled'" class="grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">定时发布时间</span>
            <input v-model="form.scheduledAt" type="datetime-local" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          </label>
        </div>
      </div>
    </article>

    <!-- 封面与图片 -->
    <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">封面与图片</h2>
      <div class="mt-5 space-y-5">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">封面图</span>
          <input v-model="form.coverImage" type="text" placeholder="输入封面图 URL" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          <div v-if="form.coverImage" class="mt-3 rounded-2xl overflow-hidden border border-border">
            <img :src="form.coverImage" alt="封面预览" class="w-full h-40 object-cover" @error="($event.target as HTMLImageElement).style.display = 'none'">
          </div>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">顶部图 (top_img)</span>
          <input v-model="form.topImg" type="text" placeholder="留空则使用默认顶部图" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          <p class="text-xs text-muted mt-1">覆盖文章页顶部背景图</p>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">文章主色调 (main_color)</span>
          <div class="flex items-center gap-3">
            <input v-model="form.mainColor" type="color" class="w-12 h-12 rounded-xl border border-border cursor-pointer p-1">
            <input v-model="form.mainColor" type="text" placeholder="#667eea" class="flex-1 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          </div>
          <p class="text-xs text-muted mt-1">设置文章页主题色，影响标题、链接等元素颜色</p>
        </label>
      </div>
    </article>

    <!-- 内容编辑 -->
    <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">文章内容</h2>
      <div class="mt-4">
        <div id="vditor" ref="vditorRef" class="min-h-[500px]"></div>
      </div>
    </article>

    <!-- 摘要与 SEO -->
    <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">摘要与 SEO</h2>
      <div class="mt-5 space-y-5">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">文章摘要</span>
          <textarea v-model="form.excerpt" rows="3" placeholder="简要描述文章内容" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 resize-y"></textarea>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">AI 摘要 (ai)</span>
          <textarea v-model="form.ai" rows="3" placeholder="输入 AI 生成的文章摘要，留空则自动生成" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 resize-y"></textarea>
          <p class="text-xs text-muted mt-1">显示在文章开头的 AI 摘要卡片中</p>
        </label>
        <div class="grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">SEO 标题</span>
            <input v-model="form.seoTitle" type="text" placeholder="留空则使用文章标题" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">关键词 (keywords)</span>
            <input v-model="form.keywords" type="text" placeholder="关键词1, 关键词2, ..." class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
            <p class="text-xs text-muted mt-1">逗号分隔，用于 meta keywords</p>
          </label>
        </div>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">SEO 描述</span>
          <textarea v-model="form.seoDescription" rows="2" placeholder="搜索引擎结果中显示的描述" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 resize-y"></textarea>
        </label>
      </div>
    </article>

    <!-- 文章设置 -->
    <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">文章设置</h2>
      <div class="mt-5 space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <AdminToggleSwitch v-model="form.isTop" label="置顶文章" />
          <AdminToggleSwitch v-model="form.allowComment" label="允许评论" />
          <AdminToggleSwitch v-model="form.toc" label="显示目录" />
          <AdminToggleSwitch v-model="form.aside" label="显示侧栏" />
          <AdminToggleSwitch v-model="form.mathjax" label="MathJax 公式" />
          <AdminToggleSwitch v-model="form.katex" label="KaTeX 公式" />
        </div>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">代码块折叠 (highlight_shrink)</span>
          <select v-model="form.highlightShrink" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
            <option value="">默认（跟随全局设置）</option>
            <option value="true">展开</option>
            <option value="false">折叠</option>
            <option value="none">不显示折叠按钮</option>
          </select>
        </label>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">密码保护</span>
          <input v-model="form.password" type="text" placeholder="留空则不设密码" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
          <p class="text-xs text-muted mt-1">设置后访客需输入密码才能查看文章</p>
        </label>
      </div>
    </article>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-end gap-3">
      <button type="button" class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary" @click="$emit('cancel')">
        取消
      </button>
      <button type="button" :disabled="saving" class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60" @click="handleSave">
        {{ saving ? '保存中...' : (article ? '更新文章' : '发布文章') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'

interface Article {
  id?: number
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  status: string
  categoryId: number | null
  tagIds: number[]
  scheduledAt: string
  isTop: boolean
  allowComment: boolean
  password: string
  seoTitle: string
  seoDescription: string
  mainColor: string
  mathjax: boolean
  katex: boolean
  toc: boolean
  ai: string
  aside: boolean
  topImg: string
  keywords: string
  highlightShrink: string
}

const props = defineProps<{
  article?: Partial<Article> & { id?: number }
}>()

const emit = defineEmits<{
  save: [data: Partial<Article>]
  cancel: []
}>()

const vditorRef = ref<HTMLElement>()
let vditorInstance: Vditor | null = null
const saving = ref(false)

const form = reactive({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  status: 'draft',
  categoryId: null as number | null,
  tagIds: [] as number[],
  scheduledAt: '',
  isTop: false,
  allowComment: true,
  password: '',
  seoTitle: '',
  seoDescription: '',
  mainColor: '',
  mathjax: false,
  katex: false,
  toc: true,
  ai: '',
  aside: true,
  topImg: '',
  keywords: '',
  highlightShrink: '',
})

watch(() => props.article, (val) => {
  if (val) {
    form.title = val.title || ''
    form.slug = val.slug || ''
    form.content = val.content || ''
    form.excerpt = val.excerpt || ''
    form.coverImage = val.coverImage || ''
    form.status = val.status || 'draft'
    form.categoryId = val.categoryId ?? (val.categories as Array<{id: number; isPrimary?: boolean}> | undefined)?.find(c => c.isPrimary)?.id ?? (val.categories as Array<{id: number}> | undefined)?.[0]?.id ?? null
    form.tagIds = val.tagIds || (val.tags as Array<{id: number}> | undefined)?.map(t => t.id) || []
    form.scheduledAt = val.scheduledAt ? new Date(val.scheduledAt as Date | string).toISOString().slice(0, 16) : ''
    form.isTop = val.isTop ?? false
    form.allowComment = val.allowComment ?? true
    form.password = val.password || ''
    form.seoTitle = val.seoTitle || ''
    form.seoDescription = val.seoDescription || ''
    form.mainColor = val.mainColor || ''
    form.mathjax = val.mathjax ?? false
    form.katex = val.katex ?? false
    form.toc = val.toc ?? true
    form.ai = val.ai || ''
    form.aside = val.aside ?? true
    form.topImg = val.topImg || ''
    form.keywords = val.keywords || ''
    form.highlightShrink = val.highlightShrink || ''

    if (vditorInstance && val.content) {
      vditorInstance.setValue(val.content)
    }
  }
}, { immediate: true })

onMounted(() => {
  vditorInstance = new Vditor('vditor', {
    height: 500,
    mode: 'ir',
    placeholder: '开始写作...',
    cache: { enable: false },
    value: form.content,
    input: (value) => {
      form.content = value
    },
    after: () => {
      if (props.article?.content) {
        vditorInstance?.setValue(props.article.content)
      }
    },
  })
})

onBeforeUnmount(() => {
  vditorInstance?.destroy()
  vditorInstance = null
})

async function handleSave() {
  if (!form.title.trim()) {
    alert('请输入文章标题')
    return
  }

  saving.value = true
  try {
    const data: Partial<Article> = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      content: form.content,
      excerpt: form.excerpt,
      coverImage: form.coverImage || undefined,
      status: form.status,
      categoryId: form.categoryId,
      tagIds: form.tagIds,
      scheduledAt: form.scheduledAt || undefined,
      isTop: form.isTop,
      allowComment: form.allowComment,
      password: form.password || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      mainColor: form.mainColor || undefined,
      mathjax: form.mathjax,
      katex: form.katex,
      toc: form.toc,
      ai: form.ai || undefined,
      aside: form.aside,
      topImg: form.topImg || undefined,
      keywords: form.keywords || undefined,
      highlightShrink: form.highlightShrink || undefined,
    }
    emit('save', data)
  } finally {
    saving.value = false
  }
}
</script>