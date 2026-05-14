<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// --- HomeTop ---
const homeTop = ref({
  enabled: true, title: '', subTitle: '', siteText: '',
  timemode: 'date' as string, defaultDescr: '', swiperEnabled: true,
})
// --- Category shortcuts ---
const categoryItems = ref<Array<{ name: string; path: string; icon: string; shadow: string; bgColor: string; cls: string }>>([
  { name: '', path: '', icon: 'i-heroicons-code-bracket', shadow: '', bgColor: '#425AEF', cls: 'blue' },
  { name: '', path: '', icon: 'i-heroicons-heart', shadow: '', bgColor: '#F47466', cls: 'red' },
  { name: '', path: '', icon: 'i-heroicons-share', shadow: '', bgColor: '#00c4b6', cls: 'green' },
  { name: '', path: '', icon: 'i-heroicons-rocket-launch', shadow: '', bgColor: '#FF7242', cls: 'orange' },
])
// --- Today Card ---
const todayCard = ref({ tips: '', title: '', image: '', link: '/' })
// --- Article List ---
const articleList = ref({
  coverEnabled: true, coverPosition: 'left' as 'left'|'right'|'both', pageSize: 10,
  asideCover: true, archivesCover: true, defaultCovers: [] as string[],
  doubleRow: true, introMethod: '3' as string, introLength: 500,
})
// --- Top Image ---
const topImage = ref({ disableTopImg: false, indexImg: '', defaultTopImg: '', siteInfoTop: '', topImgHeight: '' })
// --- Main Tone ---
const mainTone = ref({ enable: false, mode: 'api' as string, api: '', coverChange: true })
// --- Skills ---
const skills = ref<Array<{ name: string; icon: string; color: string }>>([])

// --- Fetch ---
async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) for (const row of rows) s[row.key] = row.value

    homeTop.value = {
      enabled: s.homeTopEnabled !== undefined ? Boolean(s.homeTopEnabled) : true,
      title: (s.homeTopTitle as string) || '', subTitle: (s.homeTopSubTitle as string) || '',
      siteText: (s.homeTopSiteText as string) || '', timemode: (s.homeTopTimemode as string) || 'date',
      defaultDescr: (s.homeTopDefaultDescr as string) || '',
      swiperEnabled: s.homeTopSwiperEnabled !== undefined ? Boolean(s.homeTopSwiperEnabled) : true,
    }
    if (s.homeTopCategories) categoryItems.value = s.homeTopCategories as typeof categoryItems.value
    if (s.todayCard) todayCard.value = s.todayCard as typeof todayCard.value
    articleList.value = {
      coverEnabled: s.homepageCoverEnabled !== undefined ? Boolean(s.homepageCoverEnabled) : true,
      coverPosition: (s.homepageCoverPosition as 'left'|'right'|'both') || 'left',
      pageSize: (s.homepagePageSize as number) || 10,
      asideCover: s.homepageAsideCover !== undefined ? Boolean(s.homepageAsideCover) : true,
      archivesCover: s.homepageArchivesCover !== undefined ? Boolean(s.homepageArchivesCover) : true,
      defaultCovers: (s.homepageDefaultCovers as string[]) || [],
      doubleRow: s.homepageDoubleRow !== undefined ? Boolean(s.homepageDoubleRow) : true,
      introMethod: (s.homepageIntroMethod as string) || '3',
      introLength: (s.homepageIntroLength as number) || 500,
    }
    if (s.topImage) topImage.value = { ...topImage.value, ...(s.topImage as typeof topImage.value) }
    if (s.mainTone) mainTone.value = { ...mainTone.value, ...(s.mainTone as typeof mainTone.value) }
    if (s.homepageSkills) skills.value = s.homepageSkills as typeof skills.value
  } catch (e) { console.error(e) } finally { loading.value = false }
}

// --- Save ---
async function handleSave() {
  saving.value = true; saveSuccess.value = false
  try {
    await api.put('/api/settings', [
      { key: 'homeTopEnabled', value: homeTop.value.enabled, category: 'homepage' },
      { key: 'homeTopTitle', value: homeTop.value.title, category: 'homepage' },
      { key: 'homeTopSubTitle', value: homeTop.value.subTitle, category: 'homepage' },
      { key: 'homeTopSiteText', value: homeTop.value.siteText, category: 'homepage' },
      { key: 'homeTopTimemode', value: homeTop.value.timemode, category: 'homepage' },
      { key: 'homeTopDefaultDescr', value: homeTop.value.defaultDescr, category: 'homepage' },
      { key: 'homeTopSwiperEnabled', value: homeTop.value.swiperEnabled, category: 'homepage' },
      { key: 'homeTopCategories', value: categoryItems.value, category: 'homepage' },
      { key: 'todayCard', value: todayCard.value, category: 'homepage' },
      { key: 'homepageCoverEnabled', value: articleList.value.coverEnabled, category: 'homepage' },
      { key: 'homepageCoverPosition', value: articleList.value.coverPosition, category: 'homepage' },
      { key: 'homepagePageSize', value: articleList.value.pageSize, category: 'homepage' },
      { key: 'homepageAsideCover', value: articleList.value.asideCover, category: 'homepage' },
      { key: 'homepageArchivesCover', value: articleList.value.archivesCover, category: 'homepage' },
      { key: 'homepageDefaultCovers', value: articleList.value.defaultCovers, category: 'homepage' },
      { key: 'homepageDoubleRow', value: articleList.value.doubleRow, category: 'homepage' },
      { key: 'homepageIntroMethod', value: articleList.value.introMethod, category: 'homepage' },
      { key: 'homepageIntroLength', value: articleList.value.introLength, category: 'homepage' },
      { key: 'topImage', value: topImage.value, category: 'homepage' },
      { key: 'mainTone', value: mainTone.value, category: 'homepage' },
      { key: 'homepageSkills', value: skills.value, category: 'homepage' },
    ])
    saveSuccess.value = true; setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) { alert(e instanceof Error ? e.message : '保存失败') }
  finally { saving.value = false }
}

function addCategory() { categoryItems.value.push({ name: '', path: '/', icon: 'i-heroicons-folder', shadow: '', bgColor: '#425AEF', cls: 'blue' }) }
function removeCategory(i: number) { categoryItems.value.splice(i, 1) }
function addDefaultCover() { articleList.value.defaultCovers.push('') }
function removeDefaultCover(i: number) { articleList.value.defaultCovers.splice(i, 1) }
function addSkill() { skills.value.push({ name: '', icon: 'i-heroicons-code-bracket', color: '#425AEF' }) }
function removeSkill(i: number) { skills.value.splice(i, 1) }

onMounted(() => { fetchSettings() })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-home w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">首页设置</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600">保存成功</span>
        <button class="btn-primary px-4 py-2 text-sm cursor-pointer" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-32 bg-surface-2 rounded-xl animate-pulse" />
      <div class="h-48 bg-surface rounded animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <!-- ====== Section 1: HomeTop (full width) ====== -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <span class="i-heroicons-sparkles w-5 h-5 text-primary" /> 顶部区域 (HomeTop)
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left column -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="font-medium text-text">显示顶部区域</label>
                <p class="text-xs text-muted">关闭后首页直接显示文章列表</p>
              </div>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="homeTop.enabled ? 'bg-primary' : 'bg-surface-2'" @click="homeTop.enabled = !homeTop.enabled"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="homeTop.enabled ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">大标题</label>
              <input v-model="homeTop.title" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primary" placeholder="安知鱼">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">副标题</label>
              <input v-model="homeTop.subTitle" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primary" placeholder="AnZhiYu">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">网站描述</label>
              <input v-model="homeTop.siteText" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primary" placeholder="生活明朗，万物可爱">
            </div>
          </div>
          <!-- Right column -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">文章排序</label>
              <select v-model="homeTop.timemode" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primary">
                <option value="date">按发布日期</option>
                <option value="updated">按更新日期</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认描述</label>
              <input v-model="homeTop.defaultDescr" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primary" placeholder="无描述时的默认文字">
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="font-medium text-text">轮播模式</label>
                <p class="text-xs text-muted">{{ homeTop.swiperEnabled ? '文章轮播+推荐' : '文章预览+今日推荐' }}</p>
              </div>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="homeTop.swiperEnabled ? 'bg-primary' : 'bg-surface-2'" @click="homeTop.swiperEnabled = !homeTop.swiperEnabled"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="homeTop.swiperEnabled ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Section 2: Two-column cards ====== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Category Shortcuts -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-rectangle-stack w-5 h-5 text-secondary" /> 分类快捷入口
          </h2>
          <div class="space-y-2">
            <div v-for="(cat, i) in categoryItems" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :style="{ background: cat.bgColor }">
                <span :class="cat.icon" class="w-3.5 h-3.5 text-white" />
              </div>
              <input v-model="cat.name" type="text" class="flex-1 min-w-0 px-2 py-1 bg-surface border border-border rounded text-xs text-text" placeholder="名称">
              <input v-model="cat.path" type="text" class="w-24 px-2 py-1 bg-surface border border-border rounded text-xs text-text font-mono" placeholder="/路径">
              <input v-model="cat.bgColor" type="color" class="w-6 h-6 rounded cursor-pointer border-0">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer shrink-0" @click="removeCategory(i)"><span class="i-heroicons-trash w-3.5 h-3.5" /></button>
            </div>
            <button class="w-full py-1.5 border-2 border-dashed border-border rounded-lg text-xs text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addCategory">+ 添加分类入口</button>
          </div>
        </div>

        <!-- Article List -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-document-text w-5 h-5 text-primary" /> 文章列表
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">显示封面图</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="articleList.coverEnabled ? 'bg-primary' : 'bg-surface-2'" @click="articleList.coverEnabled = !articleList.coverEnabled"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="articleList.coverEnabled ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">双栏显示</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="articleList.doubleRow ? 'bg-primary' : 'bg-surface-2'" @click="articleList.doubleRow = !articleList.doubleRow"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="articleList.doubleRow ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">封面位置</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer text-sm"><input v-model="articleList.coverPosition" type="radio" value="left" class="accent-primary"><span>左</span></label>
                <label class="flex items-center gap-1.5 cursor-pointer text-sm"><input v-model="articleList.coverPosition" type="radio" value="right" class="accent-primary"><span>右</span></label>
                <label class="flex items-center gap-1.5 cursor-pointer text-sm"><input v-model="articleList.coverPosition" type="radio" value="both" class="accent-primary"><span>交替</span></label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">摘要方式</label>
              <select v-model="articleList.introMethod" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm">
                <option value="1">仅描述</option>
                <option value="2">描述+自动摘录</option>
                <option value="3">自动摘录（默认）</option>
                <option value="">不显示摘要</option>
              </select>
            </div>
            <div v-if="articleList.introMethod && articleList.introMethod !== '1'">
              <label class="block text-sm font-medium text-text mb-1.5">摘要长度</label>
              <input v-model.number="articleList.introLength" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" min="50" max="2000">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">每页文章数</label>
              <input v-model.number="articleList.pageSize" type="number" min="5" max="50" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm w-24">
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Section 3: Two-column cards (Cover & Top Image) ====== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cover Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-photo w-5 h-5 text-primary" /> 封面设置
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">侧栏显示封面</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="articleList.asideCover ? 'bg-primary' : 'bg-surface-2'" @click="articleList.asideCover = !articleList.asideCover"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="articleList.asideCover ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">归档页显示封面</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="articleList.archivesCover ? 'bg-primary' : 'bg-surface-2'" @click="articleList.archivesCover = !articleList.archivesCover"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="articleList.archivesCover ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认封面图</label>
              <div v-for="(url, i) in articleList.defaultCovers" :key="i" class="flex items-center gap-1 mb-1">
                <input v-model="articleList.defaultCovers[i]" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-xs flex-1" placeholder="/img/default_cover.jpg">
                <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer shrink-0" @click="removeDefaultCover(i)"><span class="i-heroicons-x-mark w-3.5 h-3.5" /></button>
              </div>
              <button class="text-xs text-muted hover:text-primary cursor-pointer" @click="addDefaultCover">+ 添加默认封面</button>
            </div>
          </div>
        </div>

        <!-- Top Image -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-window w-5 h-5 text-primary" /> 顶部图设置
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">禁用所有 banner</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="topImage.disableTopImg ? 'bg-primary' : 'bg-surface-2'" @click="topImage.disableTopImg = !topImage.disableTopImg"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="topImage.disableTopImg ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">首页 banner 图</label>
              <input v-model="topImage.indexImg" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="background: url(...) top / cover">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认顶部图</label>
              <input v-model="topImage.defaultTopImg" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="页面未设置时使用">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">标题距顶</label>
                <input v-model="topImage.siteInfoTop" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="300px">
              </div>
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">图高度</label>
                <input v-model="topImage.topImgHeight" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="400px">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Section 4: Main Tone + Today Card ====== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Main Tone -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-swatch w-5 h-5 text-primary" /> 主色调跟随封面
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">启用主色调</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="mainTone.enable ? 'bg-primary' : 'bg-surface-2'" @click="mainTone.enable = !mainTone.enable"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="mainTone.enable ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
            <div v-if="mainTone.enable">
              <label class="block text-sm font-medium text-text mb-1.5">获取模式</label>
              <select v-model="mainTone.mode" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm">
                <option value="colorthief">前端 (ColorThief)</option>
                <option value="cdn">CDN 参数</option>
                <option value="api">API 请求</option>
                <option value="both">CDN + API</option>
              </select>
            </div>
            <div v-if="mainTone.enable && (mainTone.mode === 'api' || mainTone.mode === 'both')">
              <label class="block text-sm font-medium text-text mb-1.5">API 地址</label>
              <input v-model="mainTone.api" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="https://img2color-go.vercel.app/api?img=">
            </div>
            <div v-if="mainTone.enable" class="flex items-center justify-between">
              <label class="text-sm text-text">整页跟随封面变色</label>
              <button class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer" :class="mainTone.coverChange ? 'bg-primary' : 'bg-surface-2'" @click="mainTone.coverChange = !mainTone.coverChange"><span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="mainTone.coverChange ? 'translate-x-6' : 'translate-x-1'" /></button>
            </div>
          </div>
        </div>

        <!-- Today Card (only when not swiper mode) -->
        <div v-if="!homeTop.swiperEnabled" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-star w-5 h-5 text-accent" /> 今日推荐横幅
          </h2>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">提示标签</label>
                <input v-model="todayCard.tips" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="今日推荐">
              </div>
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">标题</label>
                <input v-model="todayCard.title" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="探索更多精彩内容">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">封面图 URL</label>
              <input v-model="todayCard.image" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="https://...">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">跳转链接</label>
              <input v-model="todayCard.link" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-primarytext-sm" placeholder="/">
            </div>
          </div>
        </div>
        <!-- Skills (when swiper mode, replaces today card) -->
        <div v-else class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-wrench-screwdriver w-5 h-5 text-primary" /> Banner 技能图标
          </h2>
          <div class="space-y-1.5">
            <div v-for="(skill, i) in skills" :key="i" class="flex items-center gap-2 p-1.5 bg-surface-2 rounded-lg">
              <span :class="skill.icon" class="w-5 h-5" />
              <input v-model="skill.name" type="text" class="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text" placeholder="技能名">
              <input v-model="skill.color" type="color" class="w-5 h-5 rounded cursor-pointer border-0">
              <button class="p-0.5 text-red-400 hover:text-red-600 cursor-pointer" @click="removeSkill(i)"><span class="i-heroicons-x-mark w-3 h-3" /></button>
            </div>
            <button class="w-full py-1.5 border-2 border-dashed border-border rounded-lg text-xs text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addSkill">+ 添加技能</button>
          </div>
        </div>
      </div>

      <!-- Skills (when NOT swiper mode and not already shown) -->
      <div v-if="!homeTop.swiperEnabled" class="card p-6">
        <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <span class="i-heroicons-wrench-screwdriver w-5 h-5 text-primary" /> Banner 技能图标
        </h2>
        <div class="flex flex-wrap gap-2">
          <div v-for="(skill, i) in skills" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
            <span :class="skill.icon" class="w-5 h-5" />
            <input v-model="skill.name" type="text" class="w-20 px-2 py-1 bg-surface border border-border rounded text-xs text-text" placeholder="技能名">
            <input v-model="skill.color" type="color" class="w-5 h-5 rounded cursor-pointer border-0">
            <button class="p-0.5 text-red-400 hover:text-red-600 cursor-pointer" @click="removeSkill(i)"><span class="i-heroicons-x-mark w-3 h-3" /></button>
          </div>
          <button class="px-3 py-1.5 border-2 border-dashed border-border rounded-lg text-xs text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addSkill">+ 添加技能</button>
        </div>
      </div>
    </div>
  </div>
</template>

