<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('posts')

const form = reactive({
  postPagination: '1',

  pageDateType: 'created',
  pageDateFormat: 'simple',
  pageCategories: true,
  pageTags: true,
  pageLabel: false,
  pageUnread: false,

  postDateType: 'both',
  postDateFormat: 'date',
  postCategories: true,
  postTags: true,
  postLabel: true,
  postUnread: false,

  tocPost: true,
  tocPage: false,
  tocNumber: true,
  tocExpand: false,
  tocStyleSimple: false,

  wordcountEnable: false,
  wordcountPost: true,
  wordcountMin2read: true,
  wordcountTotal: true,

  copyrightEnable: true,
  copyrightDecode: false,
  copyrightAuthorHref: '/',
  copyrightLocation: '',
  copyrightLicense: 'CC BY-NC-SA 4.0',
  copyrightLicenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  copyrightAvatarSinks: false,
  copyrightAuthorLink: '/',

  rewardEnable: false,
  rewardQrcodesJson: '[]',

  postEditEnable: false,
  postEditGithub: '',
  postEditYuque: '',

  relatedEnable: true,
  relatedLimit: 6,
  relatedDateType: 'created',

  photoFigcaptionEnable: false,
  anchorEnable: true,

  noticeEnable: false,
  noticeStyle: 'flat',
  noticeLimitDay: 365,
  noticePosition: 'top',
  noticeMessagePrev: '距离上次更新已经过去',
  noticeMessageNext: '天，文章内容可能已经过时，请注意甄别。',

  coverJson: '{\n  "index_enable": true,\n  "aside_enable": true,\n  "archives_enable": true,\n  "position": "left"\n}',
  ptoolJson: '{\n  "enable": false\n}',
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function stringifyValue(value: unknown, fallback: string) {
  if (value === undefined || value === null) {
    return fallback
  }

  try {
    return JSON.stringify(value, null, 2)
  }
  catch {
    return fallback
  }
}

function hydrateForm() {
  const postMetaPage = (settings.value.postMetaPage as Record<string, unknown> | undefined) ?? {}
  const postMetaPost = (settings.value.postMetaPost as Record<string, unknown> | undefined) ?? {}
  const toc = (settings.value.toc as Record<string, unknown> | undefined) ?? {}
  const wordcount = (settings.value.wordcount as Record<string, unknown> | undefined) ?? {}
  const postCopyright = (settings.value.postCopyright as Record<string, unknown> | undefined) ?? {}
  const reward = (settings.value.reward as Record<string, unknown> | undefined) ?? {}
  const postEdit = (settings.value.postEdit as Record<string, unknown> | undefined) ?? {}
  const relatedPost = (settings.value.relatedPost as Record<string, unknown> | undefined) ?? {}
  const photofigcaption = (settings.value.photofigcaption as Record<string, unknown> | undefined) ?? {}
  const noticeOutdate = (settings.value.noticeOutdate as Record<string, unknown> | undefined) ?? {}

  form.postPagination = String(settings.value.postPagination ?? '1')

  form.pageDateType = String(postMetaPage.dateType ?? 'created')
  form.pageDateFormat = String(postMetaPage.dateFormat ?? 'simple')
  form.pageCategories = postMetaPage.categories !== undefined ? Boolean(postMetaPage.categories) : true
  form.pageTags = postMetaPage.tags !== undefined ? Boolean(postMetaPage.tags) : true
  form.pageLabel = postMetaPage.label !== undefined ? Boolean(postMetaPage.label) : false
  form.pageUnread = postMetaPage.unread !== undefined ? Boolean(postMetaPage.unread) : false

  form.postDateType = String(postMetaPost.dateType ?? 'both')
  form.postDateFormat = String(postMetaPost.dateFormat ?? 'date')
  form.postCategories = postMetaPost.categories !== undefined ? Boolean(postMetaPost.categories) : true
  form.postTags = postMetaPost.tags !== undefined ? Boolean(postMetaPost.tags) : true
  form.postLabel = postMetaPost.label !== undefined ? Boolean(postMetaPost.label) : true
  form.postUnread = postMetaPost.unread !== undefined ? Boolean(postMetaPost.unread) : false

  form.tocPost = toc.post !== undefined ? Boolean(toc.post) : Boolean(toc.enable ?? true)
  form.tocPage = toc.page !== undefined ? Boolean(toc.page) : false
  form.tocNumber = toc.number !== undefined ? Boolean(toc.number) : true
  form.tocExpand = toc.expand !== undefined ? Boolean(toc.expand) : false
  form.tocStyleSimple = toc.styleSimple !== undefined ? Boolean(toc.styleSimple) : Boolean(toc.style_simple ?? false)

  form.wordcountEnable = wordcount.enable !== undefined ? Boolean(wordcount.enable) : false
  form.wordcountPost = wordcount.postWordcount !== undefined ? Boolean(wordcount.postWordcount) : Boolean(wordcount.post_wordcount ?? true)
  form.wordcountMin2read = wordcount.min2read !== undefined ? Boolean(wordcount.min2read) : true
  form.wordcountTotal = wordcount.totalWordcount !== undefined ? Boolean(wordcount.totalWordcount) : Boolean(wordcount.total_wordcount ?? true)

  form.copyrightEnable = postCopyright.enable !== undefined ? Boolean(postCopyright.enable) : true
  form.copyrightDecode = postCopyright.decode !== undefined ? Boolean(postCopyright.decode) : false
  form.copyrightAuthorHref = String(postCopyright.authorHref ?? postCopyright.author_href ?? '/')
  form.copyrightLocation = String(postCopyright.location ?? '')
  form.copyrightLicense = String(postCopyright.license ?? 'CC BY-NC-SA 4.0')
  form.copyrightLicenseUrl = String(postCopyright.licenseUrl ?? postCopyright.license_url ?? 'https://creativecommons.org/licenses/by-nc-sa/4.0/')
  form.copyrightAvatarSinks = postCopyright.avatarSinks !== undefined ? Boolean(postCopyright.avatarSinks) : false
  form.copyrightAuthorLink = String(postCopyright.copyrightAuthorLink ?? postCopyright.copyright_author_link ?? '/')

  form.rewardEnable = reward.enable !== undefined ? Boolean(reward.enable) : false
  form.rewardQrcodesJson = stringifyValue(reward.qrCodes ?? reward.QR_code ?? [], '[]')

  form.postEditEnable = postEdit.enable !== undefined ? Boolean(postEdit.enable) : false
  form.postEditGithub = postEdit.github === false ? '' : String(postEdit.github ?? '')
  form.postEditYuque = postEdit.yuque === false ? '' : String(postEdit.yuque ?? '')

  form.relatedEnable = relatedPost.enable !== undefined ? Boolean(relatedPost.enable) : true
  form.relatedLimit = Number(relatedPost.limit ?? 6) || 6
  form.relatedDateType = String(relatedPost.dateType ?? relatedPost.date_type ?? 'created')

  form.photoFigcaptionEnable = photofigcaption.enable !== undefined ? Boolean(photofigcaption.enable) : false
  if (typeof settings.value.anchor === 'boolean') {
    form.anchorEnable = settings.value.anchor
  }
  else {
    const anchor = (settings.value.anchor as Record<string, unknown> | undefined) ?? {}
    form.anchorEnable = anchor.enable !== undefined ? Boolean(anchor.enable) : true
  }

  form.noticeEnable = noticeOutdate.enable !== undefined ? Boolean(noticeOutdate.enable) : false
  form.noticeStyle = String(noticeOutdate.style ?? 'flat')
  form.noticeLimitDay = Number(noticeOutdate.limitDay ?? noticeOutdate.limit_day ?? 365) || 365
  form.noticePosition = String(noticeOutdate.position ?? 'top')
  form.noticeMessagePrev = String(noticeOutdate.messagePrev ?? noticeOutdate.message_prev ?? '距离上次更新已经过去')
  form.noticeMessageNext = String(noticeOutdate.messageNext ?? noticeOutdate.message_next ?? '天，文章内容可能已经过时，请注意甄别。')

  form.coverJson = stringifyValue(settings.value.cover, form.coverJson)
  form.ptoolJson = stringifyValue(settings.value.ptool, form.ptoolJson)
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

function parseJson<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T
  }
  catch {
    throw new Error(`${label} 不是合法的 JSON，请检查格式后再保存。`)
  }
}

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      postPagination: form.postPagination,
      postMetaPage: {
        dateType: form.pageDateType,
        dateFormat: form.pageDateFormat,
        categories: form.pageCategories,
        tags: form.pageTags,
        label: form.pageLabel,
        unread: form.pageUnread,
      },
      postMetaPost: {
        dateType: form.postDateType,
        dateFormat: form.postDateFormat,
        categories: form.postCategories,
        tags: form.postTags,
        label: form.postLabel,
        unread: form.postUnread,
      },
      toc: {
        post: form.tocPost,
        page: form.tocPage,
        number: form.tocNumber,
        expand: form.tocExpand,
        styleSimple: form.tocStyleSimple,
      },
      wordcount: {
        enable: form.wordcountEnable,
        postWordcount: form.wordcountPost,
        min2read: form.wordcountMin2read,
        totalWordcount: form.wordcountTotal,
      },
      postCopyright: {
        enable: form.copyrightEnable,
        decode: form.copyrightDecode,
        authorHref: form.copyrightAuthorHref.trim() || '/',
        location: form.copyrightLocation.trim(),
        license: form.copyrightLicense.trim(),
        licenseUrl: form.copyrightLicenseUrl.trim(),
        avatarSinks: form.copyrightAvatarSinks,
        copyrightAuthorLink: form.copyrightAuthorLink.trim() || '/',
      },
      reward: {
        enable: form.rewardEnable,
        qrCodes: parseJson<Array<Record<string, unknown>>>(form.rewardQrcodesJson, '赞赏二维码'),
      },
      postEdit: {
        enable: form.postEditEnable,
        github: form.postEditGithub.trim() || false,
        yuque: form.postEditYuque.trim() || false,
      },
      relatedPost: {
        enable: form.relatedEnable,
        limit: form.relatedLimit,
        dateType: form.relatedDateType,
      },
      photofigcaption: {
        enable: form.photoFigcaptionEnable,
      },
      anchor: {
        enable: form.anchorEnable,
      },
      noticeOutdate: {
        enable: form.noticeEnable,
        style: form.noticeStyle,
        limitDay: form.noticeLimitDay,
        position: form.noticePosition,
        messagePrev: form.noticeMessagePrev.trim(),
        messageNext: form.noticeMessageNext.trim(),
      },
      cover: parseJson<Record<string, unknown>>(form.coverJson, '封面配置'),
      ptool: parseJson<Record<string, unknown>>(form.ptoolJson, '阅读工具配置'),
    })

    message.value = '文章展示配置已保存。'
    await refresh()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败，请稍后重试。'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Posts</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">文章展示配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这一页负责文章详情页和独立页面的元信息、目录、字数统计、版权、赞赏、相关推荐与过期提示。
        我优先把前台真实用到的字段拆成表单，剩余复杂项保留 JSON 入口。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">页面元信息</h2>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">日期来源</span>
            <select v-model="form.pageDateType" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="created">创建时间</option>
              <option value="updated">更新时间</option>
              <option value="both">创建 + 更新</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">日期格式</span>
            <select v-model="form.pageDateFormat" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="date">完整日期</option>
              <option value="simple">简洁日期</option>
              <option value="relative">相对时间</option>
            </select>
          </label>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.pageCategories = !form.pageCategories">
            <span class="text-sm text-text">显示分类</span>
            <span class="text-sm text-muted">{{ form.pageCategories ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.pageTags = !form.pageTags">
            <span class="text-sm text-text">显示标签</span>
            <span class="text-sm text-muted">{{ form.pageTags ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.pageLabel = !form.pageLabel">
            <span class="text-sm text-text">显示标签徽记</span>
            <span class="text-sm text-muted">{{ form.pageLabel ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.pageUnread = !form.pageUnread">
            <span class="text-sm text-text">显示未读提示</span>
            <span class="text-sm text-muted">{{ form.pageUnread ? '显示' : '隐藏' }}</span>
          </button>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">文章元信息</h2>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">日期来源</span>
            <select v-model="form.postDateType" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="created">创建时间</option>
              <option value="updated">更新时间</option>
              <option value="both">创建 + 更新</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">日期格式</span>
            <select v-model="form.postDateFormat" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="date">完整日期</option>
              <option value="simple">简洁日期</option>
              <option value="relative">相对时间</option>
            </select>
          </label>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.postCategories = !form.postCategories">
            <span class="text-sm text-text">显示分类</span>
            <span class="text-sm text-muted">{{ form.postCategories ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.postTags = !form.postTags">
            <span class="text-sm text-text">显示标签</span>
            <span class="text-sm text-muted">{{ form.postTags ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.postLabel = !form.postLabel">
            <span class="text-sm text-text">显示文章标签徽记</span>
            <span class="text-sm text-muted">{{ form.postLabel ? '显示' : '隐藏' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.postUnread = !form.postUnread">
            <span class="text-sm text-text">显示未读提示</span>
            <span class="text-sm text-muted">{{ form.postUnread ? '显示' : '隐藏' }}</span>
          </button>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">目录与字数统计</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tocPost = !form.tocPost">
            <span class="text-sm text-text">文章页目录</span>
            <span class="text-sm text-muted">{{ form.tocPost ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tocPage = !form.tocPage">
            <span class="text-sm text-text">独立页目录</span>
            <span class="text-sm text-muted">{{ form.tocPage ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tocNumber = !form.tocNumber">
            <span class="text-sm text-text">目录编号</span>
            <span class="text-sm text-muted">{{ form.tocNumber ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.tocExpand = !form.tocExpand">
            <span class="text-sm text-text">目录默认展开</span>
            <span class="text-sm text-muted">{{ form.tocExpand ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20 md:col-span-2" @click="form.tocStyleSimple = !form.tocStyleSimple">
            <span class="text-sm text-text">简洁目录样式</span>
            <span class="text-sm text-muted">{{ form.tocStyleSimple ? '开启' : '关闭' }}</span>
          </button>
        </div>

        <div class="mt-6 border-t border-border/60 pt-6">
          <h3 class="text-base font-bold text-text">字数统计</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.wordcountEnable = !form.wordcountEnable">
              <span class="text-sm text-text">启用字数统计</span>
              <span class="text-sm text-muted">{{ form.wordcountEnable ? '开启' : '关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.wordcountPost = !form.wordcountPost">
              <span class="text-sm text-text">显示文章字数</span>
              <span class="text-sm text-muted">{{ form.wordcountPost ? '显示' : '隐藏' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.wordcountMin2read = !form.wordcountMin2read">
              <span class="text-sm text-text">显示阅读时长</span>
              <span class="text-sm text-muted">{{ form.wordcountMin2read ? '显示' : '隐藏' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.wordcountTotal = !form.wordcountTotal">
              <span class="text-sm text-text">显示全站字数</span>
              <span class="text-sm text-muted">{{ form.wordcountTotal ? '显示' : '隐藏' }}</span>
            </button>
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">版权、赞赏与编辑入口</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.copyrightEnable = !form.copyrightEnable">
            <span class="text-sm text-text">启用版权声明</span>
            <span class="text-sm text-muted">{{ form.copyrightEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.copyrightDecode = !form.copyrightDecode">
            <span class="text-sm text-text">启用解码提示</span>
            <span class="text-sm text-muted">{{ form.copyrightDecode ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">作者链接</span>
            <input v-model="form.copyrightAuthorHref" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">版权地址</span>
            <input v-model="form.copyrightAuthorLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">版权协议</span>
            <input v-model="form.copyrightLicense" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">版权协议链接</span>
            <input v-model="form.copyrightLicenseUrl" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-text">版权位置说明</span>
            <input v-model="form.copyrightLocation" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.rewardEnable = !form.rewardEnable">
            <span class="text-sm text-text">启用赞赏模块</span>
            <span class="text-sm text-muted">{{ form.rewardEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.postEditEnable = !form.postEditEnable">
            <span class="text-sm text-text">启用编辑入口</span>
            <span class="text-sm text-muted">{{ form.postEditEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">GitHub 编辑地址</span>
            <input v-model="form.postEditGithub" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">语雀编辑地址</span>
            <input v-model="form.postEditYuque" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">赞赏二维码 `reward.qrCodes`</span>
          <textarea v-model="form.rewardQrcodesJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </label>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">相关推荐与过期提醒</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.relatedEnable = !form.relatedEnable">
            <span class="text-sm text-text">启用相关文章</span>
            <span class="text-sm text-muted">{{ form.relatedEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.noticeEnable = !form.noticeEnable">
            <span class="text-sm text-text">启用过期提醒</span>
            <span class="text-sm text-muted">{{ form.noticeEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">相关文章数量</span>
            <input v-model="form.relatedLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">相关文章排序基准</span>
            <select v-model="form.relatedDateType" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="created">创建时间</option>
              <option value="updated">更新时间</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">提醒样式</span>
            <select v-model="form.noticeStyle" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="flat">平面样式</option>
              <option value="simple">简洁样式</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">提醒位置</span>
            <select v-model="form.noticePosition" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="top">顶部</option>
              <option value="bottom">底部</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">过期天数阈值</span>
            <input v-model="form.noticeLimitDay" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">提醒前缀</span>
            <input v-model="form.noticeMessagePrev" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">提醒后缀</span>
            <input v-model="form.noticeMessageNext" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">其他文章增强</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.photoFigcaptionEnable = !form.photoFigcaptionEnable">
            <span class="text-sm text-text">启用图片图注</span>
            <span class="text-sm text-muted">{{ form.photoFigcaptionEnable ? '开启' : '关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.anchorEnable = !form.anchorEnable">
            <span class="text-sm text-text">启用标题锚点</span>
            <span class="text-sm text-muted">{{ form.anchorEnable ? '开启' : '关闭' }}</span>
          </button>
        </div>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">文章分页模式</span>
          <select v-model="form.postPagination" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
            <option value="1">上一页 / 下一页</option>
            <option value="2">上一篇 / 下一篇（方向反转）</option>
            <option value="3">仅下一篇</option>
            <option value="4">仅下一篇 + 封面</option>
          </select>
        </label>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">封面配置 `cover`</span>
            <textarea v-model="form.coverJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">阅读工具配置 `ptool`</span>
            <textarea v-model="form.ptoolJson" rows="8" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button type="button" class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary" :disabled="loading || saving" @click="refresh">
        刷新
      </button>
      <button type="button" class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60" :disabled="loading || saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存文章展示配置' }}
      </button>
    </div>
  </div>
</template>
