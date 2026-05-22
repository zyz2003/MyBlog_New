<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('sidebar')

const widgetOptions = [
  { value: 'profile', label: '作者卡片' },
  { value: 'stats', label: '站点统计' },
  { value: 'tags', label: '标签卡片' },
  { value: 'categories', label: '分类卡片' },
  { value: 'recent', label: '最近文章' },
  { value: 'archives', label: '归档卡片' },
  { value: 'announcement', label: '公告卡片' },
  { value: 'wechat', label: '微信卡片' },
]

const form = reactive({
  sidebarEnabled: true,
  sidebarWidgets: [] as string[],

  authorEnable: true,
  authorDescription: '',
  authorNameLink: '/',

  announcementEnable: false,
  announcementContent: '',

  recentEnable: true,
  recentLimit: 5,
  recentSort: 'date',

  categoriesEnable: false,
  categoriesLimit: 8,
  categoriesExpand: 'none',

  tagsEnable: true,
  tagsLimit: 40,
  tagsColor: false,
  tagsHighlightLines: '',

  archivesEnable: true,
  archivesType: 'monthly',
  archivesFormat: 'MMMM YYYY',
  archivesOrder: -1,
  archivesLimit: 8,

  webinfoEnable: true,
  webinfoPostCount: true,
  webinfoLastPushDate: false,

  weixinEnable: false,
  weixinFace: '',
  weixinBackFace: '',

  runtimeShowEnable: false,
  runtimeShowPublishDate: '',

  tagsCloudEnable: false,
  menusItemsEnable: false,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function linesToArray(value: string) {
  return value
    .split(/\r?\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function arrayToLines(value: unknown) {
  return Array.isArray(value) ? value.map(item => String(item)).join('\n') : ''
}

function hydrateForm() {
  const sidebar = (settings.value.sidebar as Record<string, unknown> | undefined) ?? {}
  const cardAuthor = (settings.value.cardAuthor as Record<string, unknown> | undefined) ?? {}
  const cardAnnouncement = (settings.value.cardAnnouncement as Record<string, unknown> | undefined) ?? {}
  const cardRecentPost = (settings.value.cardRecentPost as Record<string, unknown> | undefined) ?? {}
  const cardCategories = (settings.value.cardCategories as Record<string, unknown> | undefined) ?? {}
  const cardTags = (settings.value.cardTags as Record<string, unknown> | undefined) ?? {}
  const cardArchives = (settings.value.cardArchives as Record<string, unknown> | undefined) ?? {}
  const cardWebinfo = (settings.value.cardWebinfo as Record<string, unknown> | undefined) ?? {}
  const cardWeixin = (settings.value.cardWeixin as Record<string, unknown> | undefined) ?? {}
  const runtimeShow = (settings.value.runtimeShow as Record<string, unknown> | undefined) ?? {}
  const tagsCloud = (settings.value.tagsCloud as Record<string, unknown> | undefined) ?? {}
  const menusItems = (settings.value.menusItems as Record<string, unknown> | undefined) ?? {}

  form.sidebarEnabled = sidebar.enabled !== undefined ? Boolean(sidebar.enabled) : true
  form.sidebarWidgets = Array.isArray(sidebar.widgets)
    ? sidebar.widgets.map(item => String(item))
    : ['profile', 'stats', 'tags', 'categories', 'recent']

  form.authorEnable = cardAuthor.enable !== undefined ? Boolean(cardAuthor.enable) : true
  form.authorDescription = String(cardAuthor.description ?? '')
  form.authorNameLink = String(cardAuthor.nameLink ?? cardAuthor.name_link ?? '/')

  form.announcementEnable = cardAnnouncement.enable !== undefined ? Boolean(cardAnnouncement.enable) : false
  form.announcementContent = String(cardAnnouncement.content ?? '')

  form.recentEnable = cardRecentPost.enable !== undefined ? Boolean(cardRecentPost.enable) : true
  form.recentLimit = Number(cardRecentPost.limit ?? 5) || 5
  form.recentSort = String(cardRecentPost.sort ?? 'date') === 'updated' ? 'updated' : 'date'

  form.categoriesEnable = cardCategories.enable !== undefined ? Boolean(cardCategories.enable) : false
  form.categoriesLimit = Number(cardCategories.limit ?? 8) || 8
  form.categoriesExpand = String(cardCategories.expand ?? 'none')

  form.tagsEnable = cardTags.enable !== undefined ? Boolean(cardTags.enable) : true
  form.tagsLimit = Number(cardTags.limit ?? 40) || 40
  form.tagsColor = cardTags.color !== undefined ? Boolean(cardTags.color) : false
  form.tagsHighlightLines = arrayToLines(cardTags.highlightTags)

  form.archivesEnable = cardArchives.enable !== undefined ? Boolean(cardArchives.enable) : true
  form.archivesType = String(cardArchives.type ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly'
  form.archivesFormat = String(cardArchives.format ?? 'MMMM YYYY')
  form.archivesOrder = Number(cardArchives.order ?? -1) >= 0 ? 1 : -1
  form.archivesLimit = Number(cardArchives.limit ?? 8) || 8

  form.webinfoEnable = cardWebinfo.enable !== undefined ? Boolean(cardWebinfo.enable) : true
  form.webinfoPostCount = cardWebinfo.postCount !== undefined
    ? Boolean(cardWebinfo.postCount)
    : Boolean(cardWebinfo.post_count ?? true)
  form.webinfoLastPushDate = cardWebinfo.lastPushDate !== undefined
    ? Boolean(cardWebinfo.lastPushDate)
    : Boolean(cardWebinfo.last_push_date ?? false)

  form.weixinEnable = cardWeixin.enable !== undefined ? Boolean(cardWeixin.enable) : false
  form.weixinFace = String(cardWeixin.face ?? '')
  form.weixinBackFace = String(cardWeixin.backFace ?? cardWeixin.back_face ?? '')

  form.runtimeShowEnable = runtimeShow.enable !== undefined ? Boolean(runtimeShow.enable) : false
  form.runtimeShowPublishDate = String(runtimeShow.publishDate ?? runtimeShow.publish_date ?? '')

  form.tagsCloudEnable = tagsCloud.enable !== undefined ? Boolean(tagsCloud.enable) : false
  form.menusItemsEnable = menusItems.enable !== undefined ? Boolean(menusItems.enable) : false
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

function toggleWidget(widget: string) {
  if (form.sidebarWidgets.includes(widget)) {
    form.sidebarWidgets = form.sidebarWidgets.filter(item => item !== widget)
    return
  }
  form.sidebarWidgets = [...form.sidebarWidgets, widget]
}

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      sidebar: {
        enabled: form.sidebarEnabled,
        widgets: form.sidebarWidgets,
      },
      cardAuthor: {
        enable: form.authorEnable,
        description: form.authorDescription.trim(),
        nameLink: form.authorNameLink.trim() || '/',
      },
      cardAnnouncement: {
        enable: form.announcementEnable,
        content: form.announcementContent.trim(),
      },
      cardRecentPost: {
        enable: form.recentEnable,
        limit: form.recentLimit,
        sort: form.recentSort,
      },
      cardCategories: {
        enable: form.categoriesEnable,
        limit: form.categoriesLimit,
        expand: form.categoriesExpand.trim() || 'none',
      },
      cardTags: {
        enable: form.tagsEnable,
        limit: form.tagsLimit,
        color: form.tagsColor,
        highlightTags: linesToArray(form.tagsHighlightLines),
      },
      cardArchives: {
        enable: form.archivesEnable,
        type: form.archivesType,
        format: form.archivesFormat.trim(),
        order: form.archivesOrder,
        limit: form.archivesLimit,
      },
      cardWebinfo: {
        enable: form.webinfoEnable,
        postCount: form.webinfoPostCount,
        lastPushDate: form.webinfoLastPushDate,
      },
      cardWeixin: {
        enable: form.weixinEnable,
        face: form.weixinFace.trim(),
        backFace: form.weixinBackFace.trim(),
      },
      runtimeShow: {
        enable: form.runtimeShowEnable,
        publishDate: form.runtimeShowPublishDate.trim(),
      },
      tagsCloud: {
        enable: form.tagsCloudEnable,
      },
      menusItems: {
        enable: form.menusItemsEnable,
      },
    })
    message.value = '侧边栏配置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Sidebar</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">侧边栏配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里集中处理首页与文章页右侧栏的结构、作者卡片、最近文章、标签卡片、归档卡片以及站点信息卡片。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">侧边栏结构</h2>
          <p class="mt-2 text-sm text-muted">控制侧边栏是否启用，以及默认展示哪些卡片。</p>
        </div>
        <AdminToggleSwitch v-model="form.sidebarEnabled" label="侧边栏开关" class="w-full" />
      </div>

      <div class="mt-5">
        <p class="mb-3 text-sm font-medium text-text">默认卡片顺序</p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="option in widgetOptions"
            :key="option.value"
            type="button"
            class="rounded-2xl border px-4 py-3 text-sm transition"
            :class="form.sidebarWidgets.includes(option.value)
              ? 'border-primary/30 bg-primary/8 text-primary'
              : 'border-border bg-background/75 text-text hover:border-primary/20'"
            @click="toggleWidget(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">作者与公告卡片</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">作者卡片说明</span>
            <textarea v-model="form.authorDescription" rows="4" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：记录日常、技术与长期项目。" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">作者名称跳转链接</span>
            <input v-model="form.authorNameLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/" />
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.authorEnable" label="启用作者卡片" />
            <AdminToggleSwitch v-model="form.announcementEnable" label="启用公告卡片" />
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">公告内容</span>
            <textarea v-model="form.announcementContent" rows="4" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：欢迎来到我的博客，最近正在重构安知鱼主题体验。" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">最近文章与分类卡片</h2>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">最近文章数量</span>
            <input v-model="form.recentLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">最近文章排序</span>
            <select v-model="form.recentSort" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="date">按发布时间</option>
              <option value="updated">按更新时间</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">分类卡片数量</span>
            <input v-model="form.categoriesLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">分类展开策略</span>
            <input v-model="form.categoriesExpand" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="none / all / parent" />
          </label>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <AdminToggleSwitch v-model="form.recentEnable" label="启用最近文章" />
          <AdminToggleSwitch v-model="form.categoriesEnable" label="启用分类卡片" />
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">标签与归档卡片</h2>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">标签数量</span>
            <input v-model="form.tagsLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">归档数量</span>
            <input v-model="form.archivesLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">归档维度</span>
            <select v-model="form.archivesType" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="monthly">按月</option>
              <option value="yearly">按年</option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">归档顺序</span>
            <select v-model="form.archivesOrder" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option :value="-1">最新优先</option>
              <option :value="1">最旧优先</option>
            </select>
          </label>
        </div>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">高亮标签，每行一个</span>
          <textarea v-model="form.tagsHighlightLines" rows="5" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Nuxt&#10;Vue&#10;TypeScript" />
        </label>
        <label class="mt-5 block space-y-2">
          <span class="text-sm font-medium text-text">归档日期格式</span>
          <input v-model="form.archivesFormat" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="MMMM YYYY" />
        </label>
        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <AdminToggleSwitch v-model="form.tagsEnable" label="启用标签卡片" />
          <AdminToggleSwitch v-model="form.tagsColor" label="标签着色" />
          <AdminToggleSwitch v-model="form.archivesEnable" label="启用归档卡片" />
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">站点信息与微信卡片</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <AdminToggleSwitch v-model="form.webinfoEnable" label="启用站点信息卡片" />
          <AdminToggleSwitch v-model="form.weixinEnable" label="启用微信卡片" />
          <AdminToggleSwitch v-model="form.webinfoPostCount" label="显示文章总数" />
          <AdminToggleSwitch v-model="form.webinfoLastPushDate" label="显示最近更新" />
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">微信正面图片</span>
            <input v-model="form.weixinFace" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/images/wechat-front.png" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">微信背面图片</span>
            <input v-model="form.weixinBackFace" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/images/wechat-back.png" />
          </label>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <AdminToggleSwitch v-model="form.runtimeShowEnable" label="启用运行时间卡片" />
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">运行时间发布日期</span>
            <input v-model="form.runtimeShowPublishDate" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="2024-01-01" />
          </label>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">移动端侧边栏增强</h2>
      <p class="mt-2 text-sm text-muted">控制移动端侧边栏中标签云和菜单块的显示。</p>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <AdminToggleSwitch v-model="form.tagsCloudEnable" label="启用标签云" />
        <AdminToggleSwitch v-model="form.menusItemsEnable" label="启用菜单块" />
      </div>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button type="button" class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary" :disabled="loading || saving" @click="refresh">
        刷新
      </button>
      <button type="button" class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60" :disabled="loading || saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存侧边栏配置' }}
      </button>
    </div>
  </div>
</template>
