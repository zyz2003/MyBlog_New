<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('homepage')

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

type HomepageCategoryItem = {
  name: string
  path: string
  icon: string
  shadow: string
  bgColor: string
  cls: string
}

type HomepageSkillItem = {
  name: string
  icon: string
  color: string
}

const form = reactive({
  homeTopEnabled: true,
  homeTopTitle: '',
  homeTopSubTitle: '',
  homeTopSiteText: '',
  homeTopTimemode: 'date',
  homeTopDefaultDescr: '',
  homeTopSwiperEnabled: true,

  homepageCoverEnabled: true,
  homepageCoverPosition: 'left',
  homepagePageSize: 10,
  homepageAsideCover: true,
  homepageArchivesCover: true,
  homepageDoubleRow: true,
  homepageIntroMethod: 'description',
  homepageIntroLength: 120,
  pageThumbnailSuffix: '',
  homepageDefaultCoversText: '',

  homeTopCategories: [] as HomepageCategoryItem[],
  todayCardTips: '',
  todayCardTitle: '',
  todayCardImage: '',
  todayCardLink: '',

  homepageSidebarEnabled: true,
  homepageSidebarWidgets: [] as string[],
  homepageSkills: [] as HomepageSkillItem[],

  peopleCanvasEnable: true,
  peopleCanvasImg: '',

  linkPageTopEnable: false,
  linkPageTopTitle: '',
  linkPageTopPlaceholder: '',

  topImageDisableTopImg: false,
  topImageIndexImg: '',
  topImageDefaultTopImg: '',
  topImageSiteInfoTop: '',
  topImageTopImgHeight: '',

  mainToneEnable: false,
  mainToneMode: 'api',
  mainToneApi: '',
  mainToneCoverChange: true,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : []
}

function toLines(value: unknown) {
  return toStringArray(value).join('\n')
}

function fromLines(value: string) {
  return value
    .split(/\r?\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function toCategory(item: unknown): HomepageCategoryItem {
  const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
  return {
    name: String(record.name ?? ''),
    path: String(record.path ?? ''),
    icon: String(record.icon ?? ''),
    shadow: String(record.shadow ?? ''),
    bgColor: String(record.bgColor ?? ''),
    cls: String(record.cls ?? ''),
  }
}

function toSkill(item: unknown): HomepageSkillItem {
  const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
  return {
    name: String(record.name ?? ''),
    icon: String(record.icon ?? ''),
    color: String(record.color ?? ''),
  }
}

function toggleWidget(widget: string) {
  if (form.homepageSidebarWidgets.includes(widget)) {
    form.homepageSidebarWidgets = form.homepageSidebarWidgets.filter(item => item !== widget)
    return
  }
  form.homepageSidebarWidgets = [...form.homepageSidebarWidgets, widget]
}

function addCategory() {
  form.homeTopCategories.push({
    name: '',
    path: '',
    icon: '',
    shadow: '',
    bgColor: '',
    cls: '',
  })
}

function removeCategory(index: number) {
  form.homeTopCategories.splice(index, 1)
}

function addSkill() {
  form.homepageSkills.push({
    name: '',
    icon: '',
    color: '',
  })
}

function removeSkill(index: number) {
  form.homepageSkills.splice(index, 1)
}

function hydrateForm() {
  const todayCard = (settings.value.todayCard as Record<string, unknown> | undefined) ?? {}
  const peoplecanvas = (settings.value.peoplecanvas as Record<string, unknown> | undefined) ?? {}
  const linkPageTop = (settings.value.linkPageTop as Record<string, unknown> | undefined) ?? {}
  const topImage = (settings.value.topImage as Record<string, unknown> | undefined) ?? {}
  const mainTone = (settings.value.mainTone as Record<string, unknown> | undefined) ?? {}

  form.homeTopEnabled = settings.value.homeTopEnabled !== undefined ? Boolean(settings.value.homeTopEnabled) : true
  form.homeTopTitle = String(settings.value.homeTopTitle ?? '')
  form.homeTopSubTitle = String(settings.value.homeTopSubTitle ?? '')
  form.homeTopSiteText = String(settings.value.homeTopSiteText ?? '')
  form.homeTopTimemode = String(settings.value.homeTopTimemode ?? 'date')
  form.homeTopDefaultDescr = String(settings.value.homeTopDefaultDescr ?? '')
  form.homeTopSwiperEnabled = settings.value.homeTopSwiperEnabled !== undefined ? Boolean(settings.value.homeTopSwiperEnabled) : true

  form.homepageCoverEnabled = settings.value.homepageCoverEnabled !== undefined ? Boolean(settings.value.homepageCoverEnabled) : true
  form.homepageCoverPosition = String(settings.value.homepageCoverPosition ?? 'left')
  form.homepagePageSize = Number(settings.value.homepagePageSize ?? 10) || 10
  form.homepageAsideCover = settings.value.homepageAsideCover !== undefined ? Boolean(settings.value.homepageAsideCover) : true
  form.homepageArchivesCover = settings.value.homepageArchivesCover !== undefined ? Boolean(settings.value.homepageArchivesCover) : true
  form.homepageDoubleRow = settings.value.homepageDoubleRow !== undefined ? Boolean(settings.value.homepageDoubleRow) : true
  form.homepageIntroMethod = String(settings.value.homepageIntroMethod ?? 'description')
  form.homepageIntroLength = Number(settings.value.homepageIntroLength ?? 120) || 120
  form.pageThumbnailSuffix = String(settings.value.pageThumbnailSuffix ?? '')
  form.homepageDefaultCoversText = toLines(settings.value.homepageDefaultCovers)

  form.homeTopCategories = Array.isArray(settings.value.homeTopCategories)
    ? settings.value.homeTopCategories.map(toCategory)
    : []

  form.todayCardTips = String(todayCard.tips ?? '')
  form.todayCardTitle = String(todayCard.title ?? '')
  form.todayCardImage = String(todayCard.image ?? '')
  form.todayCardLink = String(todayCard.link ?? '')

  form.homepageSidebarEnabled = settings.value.homepageSidebarEnabled !== undefined ? Boolean(settings.value.homepageSidebarEnabled) : true
  form.homepageSidebarWidgets = toStringArray(settings.value.homepageSidebarWidgets)
  form.homepageSkills = Array.isArray(settings.value.homepageSkills)
    ? settings.value.homepageSkills.map(toSkill)
    : []

  form.peopleCanvasEnable = peoplecanvas.enable !== undefined ? Boolean(peoplecanvas.enable) : true
  form.peopleCanvasImg = String(peoplecanvas.img ?? '')

  form.linkPageTopEnable = linkPageTop.enable !== undefined ? Boolean(linkPageTop.enable) : false
  form.linkPageTopTitle = String(linkPageTop.title ?? '')
  form.linkPageTopPlaceholder = String(linkPageTop.addFriendPlaceholder ?? '')

  form.topImageDisableTopImg = topImage.disableTopImg !== undefined ? Boolean(topImage.disableTopImg) : false
  form.topImageIndexImg = String(topImage.indexImg ?? settings.value.defaultTopImg ?? '')
  form.topImageDefaultTopImg = String(topImage.defaultTopImg ?? '')
  form.topImageSiteInfoTop = String(topImage.siteInfoTop ?? settings.value.indexSiteInfoTop ?? '')
  form.topImageTopImgHeight = String(topImage.topImgHeight ?? settings.value.indexTopImgHeight ?? '')

  form.mainToneEnable = mainTone.enable !== undefined ? Boolean(mainTone.enable) : false
  form.mainToneMode = String(mainTone.mode ?? 'api')
  form.mainToneApi = String(mainTone.api ?? '')
  form.mainToneCoverChange = mainTone.coverChange !== undefined ? Boolean(mainTone.coverChange) : true
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      homeTopEnabled: form.homeTopEnabled,
      homeTopTitle: form.homeTopTitle.trim(),
      homeTopSubTitle: form.homeTopSubTitle.trim(),
      homeTopSiteText: form.homeTopSiteText.trim(),
      homeTopTimemode: form.homeTopTimemode,
      homeTopDefaultDescr: form.homeTopDefaultDescr.trim(),
      homeTopSwiperEnabled: form.homeTopSwiperEnabled,

      homepageCoverEnabled: form.homepageCoverEnabled,
      homepageCoverPosition: form.homepageCoverPosition,
      homepagePageSize: form.homepagePageSize,
      homepageAsideCover: form.homepageAsideCover,
      homepageArchivesCover: form.homepageArchivesCover,
      homepageDoubleRow: form.homepageDoubleRow,
      homepageIntroMethod: form.homepageIntroMethod,
      homepageIntroLength: form.homepageIntroLength,
      pageThumbnailSuffix: form.pageThumbnailSuffix.trim(),
      homepageDefaultCovers: fromLines(form.homepageDefaultCoversText),

      homeTopCategories: form.homeTopCategories.map(item => ({
        name: item.name.trim(),
        path: item.path.trim(),
        icon: item.icon.trim(),
        shadow: item.shadow.trim(),
        bgColor: item.bgColor.trim(),
        cls: item.cls.trim(),
      })).filter(item => item.name || item.path || item.icon),
      todayCard: {
        tips: form.todayCardTips.trim(),
        title: form.todayCardTitle.trim(),
        image: form.todayCardImage.trim(),
        link: form.todayCardLink.trim(),
      },

      homepageSidebarEnabled: form.homepageSidebarEnabled,
      homepageSidebarWidgets: form.homepageSidebarWidgets,
      homepageSkills: form.homepageSkills.map(item => ({
        name: item.name.trim(),
        icon: item.icon.trim(),
        color: item.color.trim(),
      })).filter(item => item.name || item.icon || item.color),

      peoplecanvas: {
        enable: form.peopleCanvasEnable,
        img: form.peopleCanvasImg.trim(),
      },
      linkPageTop: {
        enable: form.linkPageTopEnable,
        title: form.linkPageTopTitle.trim(),
        addFriendPlaceholder: form.linkPageTopPlaceholder.trim(),
      },
      topImage: {
        disableTopImg: form.topImageDisableTopImg,
        indexImg: form.topImageIndexImg.trim(),
        defaultTopImg: form.topImageDefaultTopImg.trim(),
        siteInfoTop: form.topImageSiteInfoTop.trim(),
        topImgHeight: form.topImageTopImgHeight.trim(),
      },
      mainTone: {
        enable: form.mainToneEnable,
        mode: form.mainToneMode,
        api: form.mainToneApi.trim(),
        coverChange: form.mainToneCoverChange,
      },

      indexImg: {
        indexImg: form.topImageIndexImg.trim(),
      },
      indexTopImgHeight: form.topImageTopImgHeight.trim(),
      indexSiteInfoTop: form.topImageSiteInfoTop.trim(),
      defaultTopImg: form.topImageDefaultTopImg.trim(),
    })

    message.value = '首页配置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Homepage</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">首页配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里直接对应首页 Hero、分类卡片、今日卡片、技能区、右侧栏和顶部背景图配置，保存后前台首页会立刻按同结构读取。
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
        <h2 class="text-xl font-black text-text">首页欢迎区</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homeTopEnabled = !form.homeTopEnabled">
              <span class="text-sm text-text">启用首页欢迎区</span>
              <span class="text-sm text-muted">{{ form.homeTopEnabled ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homeTopSwiperEnabled = !form.homeTopSwiperEnabled">
              <span class="text-sm text-text">启用首页轮播</span>
              <span class="text-sm text-muted">{{ form.homeTopSwiperEnabled ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">首页主标题</span>
            <input v-model="form.homeTopTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：安知鱼" >
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">首页副标题</span>
            <input v-model="form.homeTopSubTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：AnZhiYu" >
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">站点文案</span>
            <input v-model="form.homeTopSiteText" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：生活明朗，万物可爱。" >
          </label>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">时间模式</span>
              <select v-model="form.homeTopTimemode" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="date">日期模式</option>
                <option value="countdown">倒计时模式</option>
                <option value="custom">自定义模式</option>
              </select>
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">首页每页文章数</span>
              <input v-model.number="form.homepagePageSize" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">默认描述</span>
            <textarea v-model="form.homeTopDefaultDescr" rows="4" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="欢迎区的默认说明文本" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">列表布局与封面</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homepageCoverEnabled = !form.homepageCoverEnabled">
              <span class="text-sm text-text">启用首页封面</span>
              <span class="text-sm text-muted">{{ form.homepageCoverEnabled ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homepageDoubleRow = !form.homepageDoubleRow">
              <span class="text-sm text-text">启用双列布局</span>
              <span class="text-sm text-muted">{{ form.homepageDoubleRow ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homepageAsideCover = !form.homepageAsideCover">
              <span class="text-sm text-text">侧栏显示封面</span>
              <span class="text-sm text-muted">{{ form.homepageAsideCover ? '显示' : '隐藏' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homepageArchivesCover = !form.homepageArchivesCover">
              <span class="text-sm text-text">归档显示封面</span>
              <span class="text-sm text-muted">{{ form.homepageArchivesCover ? '显示' : '隐藏' }}</span>
            </button>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">封面位置</span>
              <select v-model="form.homepageCoverPosition" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="left">左侧</option>
                <option value="right">右侧</option>
                <option value="both">双侧</option>
              </select>
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">摘要生成方式</span>
              <select v-model="form.homepageIntroMethod" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="description">优先使用描述</option>
                <option value="summary">从正文截取</option>
                <option value="auto">自动选择</option>
                <option value="ai">AI 摘要</option>
              </select>
            </label>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">摘要长度</span>
              <input v-model.number="form.homepageIntroLength" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">页面缩略图后缀</span>
              <input v-model="form.pageThumbnailSuffix" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：?imageView2/1/w/600/h/400" >
            </label>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">默认封面列表</span>
            <textarea v-model="form.homepageDefaultCoversText" rows="6" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个封面地址" />
          </label>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">首页分类卡片</h2>
          <p class="mt-2 text-sm text-muted">用于首页顶部分类按钮区域，支持名称、链接、图标、阴影色和背景色。</p>
        </div>
        <button type="button" class="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" @click="addCategory">
          新增分类卡
        </button>
      </div>

      <div v-if="form.homeTopCategories.length" class="mt-5 grid gap-4">
        <article v-for="(item, index) in form.homeTopCategories" :key="`category-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-semibold text-text">分类卡 {{ index + 1 }}</p>
            <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeCategory(index)">
              删除
            </button>
          </div>
          <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">名称</span>
              <input v-model="item.name" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">路径</span>
              <input v-model="item.path" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">图标</span>
              <input v-model="item.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：i-heroicons-sparkles-solid" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">阴影色</span>
              <input v-model="item.shadow" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="rgba(66,90,239,.35)" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">背景色</span>
              <input v-model="item.bgColor" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="#425AEF" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">附加类名</span>
              <input v-model="item.cls" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="可选" >
            </label>
          </div>
        </article>
      </div>

      <div v-else class="mt-5 rounded-3xl border border-dashed border-border bg-background/45 px-6 py-12 text-center text-sm text-muted">
        还没有首页分类卡片，点击右上角按钮添加。
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">今日卡片与技能区</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">今日卡片提示语</span>
            <input v-model="form.todayCardTips" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">今日卡片标题</span>
            <input v-model="form.todayCardTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">今日卡片图片</span>
            <input v-model="form.todayCardImage" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">今日卡片链接</span>
            <input v-model="form.todayCardLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>

        <div class="mt-8 flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-black text-text">技能卡片</h3>
            <p class="mt-1 text-sm text-muted">支持图标和颜色，用于首页技能展示区。</p>
          </div>
          <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addSkill">
            新增技能卡
          </button>
        </div>

        <div v-if="form.homepageSkills.length" class="mt-4 space-y-4">
          <article v-for="(item, index) in form.homepageSkills" :key="`skill-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-semibold text-text">技能 {{ index + 1 }}</p>
              <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeSkill(index)">
                删除
              </button>
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">名称</span>
                <input v-model="item.name" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </label>
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">图标</span>
                <input v-model="item.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </label>
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">颜色</span>
                <input v-model="item.color" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="#425AEF" >
              </label>
            </div>
          </article>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">友链页头与背景扩展</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.peopleCanvasEnable = !form.peopleCanvasEnable">
              <span class="text-sm text-text">人物动效背景</span>
              <span class="text-sm text-muted">{{ form.peopleCanvasEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.linkPageTopEnable = !form.linkPageTopEnable">
              <span class="text-sm text-text">启用友链页头</span>
              <span class="text-sm text-muted">{{ form.linkPageTopEnable ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">人物背景图片</span>
            <input v-model="form.peopleCanvasImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">友链页头标题</span>
            <input v-model="form.linkPageTopTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">友链申请占位文案</span>
            <input v-model="form.linkPageTopPlaceholder" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">顶部图片与主色调</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.topImageDisableTopImg = !form.topImageDisableTopImg">
              <span class="text-sm text-text">禁用顶部大图</span>
              <span class="text-sm text-muted">{{ form.topImageDisableTopImg ? '已禁用' : '正常显示' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.mainToneEnable = !form.mainToneEnable">
              <span class="text-sm text-text">启用主色调提取</span>
              <span class="text-sm text-muted">{{ form.mainToneEnable ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">首页顶部图</span>
            <input v-model="form.topImageIndexImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">默认顶部图</span>
            <input v-model="form.topImageDefaultTopImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">站点信息纵向偏移</span>
              <input v-model="form.topImageSiteInfoTop" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：180px" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">顶部图高度</span>
              <input v-model="form.topImageTopImgHeight" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：420px" >
            </label>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">主色调模式</span>
              <select v-model="form.mainToneMode" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="api">API</option>
                <option value="cdn">CDN</option>
                <option value="colorthief">ColorThief</option>
                <option value="both">混合模式</option>
              </select>
            </label>
            <button type="button" class="mt-7 flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.mainToneCoverChange = !form.mainToneCoverChange">
              <span class="text-sm text-text">封面切换时同步换色</span>
              <span class="text-sm text-muted">{{ form.mainToneCoverChange ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">取色 API 地址</span>
            <input v-model="form.mainToneApi" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">首页右侧栏</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.homepageSidebarEnabled = !form.homepageSidebarEnabled">
            <span class="text-sm text-text">启用首页右侧栏</span>
            <span class="text-sm text-muted">{{ form.homepageSidebarEnabled ? '已开启' : '已关闭' }}</span>
          </button>

          <div>
            <p class="mb-3 text-sm font-medium text-text">首页右侧栏组件</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in widgetOptions"
                :key="option.value"
                type="button"
                class="rounded-2xl border px-4 py-3 text-sm transition"
                :class="form.homepageSidebarWidgets.includes(option.value)
                  ? 'border-primary/30 bg-primary/8 text-primary'
                  : 'border-border bg-background/75 text-text hover:border-primary/20'"
                @click="toggleWidget(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary"
        :disabled="loading || saving"
        @click="refresh"
      >
        刷新
      </button>
      <button
        type="button"
        class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60"
        :disabled="loading || saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存首页配置' }}
      </button>
    </div>
  </div>
</template>
