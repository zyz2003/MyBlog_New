<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Post meta (home page)
const postMetaPage = ref({
  dateType: 'created' as string,
  dateFormat: 'simple' as string,
  categories: true,
  tags: true,
  label: false,
})

// Post meta (article page)
const postMetaPost = ref({
  dateType: 'both' as string,
  dateFormat: 'date' as string,
  categories: true,
  tags: true,
  label: true,
  unread: false,
})

// Post copyright
const postCopyright = ref({
  enable: true,
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  location: '',
  avatarSinks: false,
})

// Reward / Sponsor
const reward = ref({
  enable: false,
  qrCodes: [] as Array<{ img: string; link: string; text: string }>,
})

// Related posts
const relatedPost = ref({
  enable: true,
  limit: 6,
  dateType: 'created' as string,
})

// Notice outdate
const noticeOutdate = ref({
  enable: false,
  style: 'flat' as string,
  limitDay: 365,
  position: 'top' as string,
  messagePrev: '距离上次更新已经过去',
  messageNext: '天，文章内容可能已经过时。',
})

// Post pagination
const postPagination = ref<string>('2')

// Cover settings
const cover = ref({
  indexEnable: true,
  asideEnable: true,
  archivesEnable: true,
  position: 'left' as string,
})

// TOC
const toc = ref({ enable: true, number: true, expand: false, styleSimple: false, scrollPercent: true })
// Word count
const wordcount = ref({ enable: true, count: true })
// Post tools
const ptool = ref({ enable: true, categories: false, tags: true, share: true })
// Anchor
const anchor = ref({ anchorOption: 1, linkIcon: true, scrollToggle: false })
// Post edit
const postEdit = ref({ enable: false })
// Photo figcaption
const photofigcaption = ref({ enable: false })
// H2 divider
const h2Divider = ref({ enable: false })

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) { s[row.key] = row.value }
    }

    if (s.postMetaPage) postMetaPage.value = { ...postMetaPage.value, ...(s.postMetaPage as typeof postMetaPage.value) }
    if (s.postMetaPost) postMetaPost.value = { ...postMetaPost.value, ...(s.postMetaPost as typeof postMetaPost.value) }
    if (s.postCopyright) postCopyright.value = { ...postCopyright.value, ...(s.postCopyright as typeof postCopyright.value) }
    if (s.reward) reward.value = { ...reward.value, ...(s.reward as typeof reward.value) }
    if (s.relatedPost) relatedPost.value = { ...relatedPost.value, ...(s.relatedPost as typeof relatedPost.value) }
    if (s.noticeOutdate) noticeOutdate.value = { ...noticeOutdate.value, ...(s.noticeOutdate as typeof noticeOutdate.value) }
    if (s.postPagination !== undefined) postPagination.value = String(s.postPagination)
    if (s.cover) cover.value = { ...cover.value, ...(s.cover as typeof cover.value) }
    if (s.toc) toc.value = { ...toc.value, ...(s.toc as typeof toc.value) }
    if (s.wordcount) wordcount.value = { ...wordcount.value, ...(s.wordcount as typeof wordcount.value) }
    if (s.ptool) ptool.value = { ...ptool.value, ...(s.ptool as typeof ptool.value) }
    if (s.anchor) anchor.value = { ...anchor.value, ...(s.anchor as typeof anchor.value) }
    if (s.postEdit) postEdit.value = { ...postEdit.value, ...(s.postEdit as typeof postEdit.value) }
    if (s.photofigcaption) photofigcaption.value = { ...photofigcaption.value, ...(s.photofigcaption as typeof photofigcaption.value) }
    if (s.h2Divider) h2Divider.value = { ...h2Divider.value, ...(s.h2Divider as typeof h2Divider.value) }
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveSuccess.value = false
  try {
    await api.put('/api/settings', [
      { key: 'postMetaPage', value: postMetaPage.value, category: 'post' },
      { key: 'postMetaPost', value: postMetaPost.value, category: 'post' },
      { key: 'postCopyright', value: postCopyright.value, category: 'post' },
      { key: 'reward', value: reward.value, category: 'post' },
      { key: 'relatedPost', value: relatedPost.value, category: 'post' },
      { key: 'noticeOutdate', value: noticeOutdate.value, category: 'post' },
      { key: 'postPagination', value: postPagination.value, category: 'post' },
      { key: 'cover', value: cover.value, category: 'post' },
      { key: 'toc', value: toc.value, category: 'post' },
      { key: 'wordcount', value: wordcount.value, category: 'post' },
      { key: 'ptool', value: ptool.value, category: 'post' },
      { key: 'anchor', value: anchor.value, category: 'post' },
      { key: 'postEdit', value: postEdit.value, category: 'post' },
      { key: 'photofigcaption', value: photofigcaption.value, category: 'post' },
      { key: 'h2Divider', value: h2Divider.value, category: 'post' },
    ])
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function addQrCode() {
  reward.value.qrCodes.push({ img: '', link: '', text: '' })
}
function removeQrCode(index: number) {
  reward.value.qrCodes.splice(index, 1)
}

onMounted(() => fetchSettings())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-document-text w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">文章设置</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" /> 保存成功
        </span>
        <button class="btn-primary px-4 py-2 text-sm flex items-center gap-2 cursor-pointer" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-48 bg-surface-2 rounded-xl animate-pulse" v-for="i in 3" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Post Meta - Home Page -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-home w-5 h-5 text-primary" /> 首页文章元信息
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">日期类型</label>
              <select v-model="postMetaPage.dateType" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="created">创建日期</option>
                <option value="updated">更新日期</option>
                <option value="both">两者都显示</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">日期格式</label>
              <select v-model="postMetaPage.dateFormat" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="date">完整日期</option>
                <option value="relative">相对日期（如"3天前"）</option>
                <option value="simple">简单日期</option>
              </select>
            </div>
          </div>
          <div class="flex gap-6 mt-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPage.categories" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示分类</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPage.tags" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示标签</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPage.label" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示描述标签</span>
            </label>
          </div>
        </div>

        <!-- Post Meta - Article Page -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-document-magnifying-glass w-5 h-5 text-primary" /> 文章详情页元信息
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">日期类型</label>
              <select v-model="postMetaPost.dateType" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="created">创建日期</option>
                <option value="updated">更新日期</option>
                <option value="both">两者都显示</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">日期格式</label>
              <select v-model="postMetaPost.dateFormat" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="date">完整日期</option>
                <option value="relative">相对日期</option>
              </select>
            </div>
          </div>
          <div class="flex gap-6 mt-4 flex-wrap">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPost.categories" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示分类</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPost.tags" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示标签</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPost.label" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示描述标签</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postMetaPost.unread" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">未读标记</span>
            </label>
          </div>
        </div>

        <!-- Cover Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-photo w-5 h-5 text-primary" /> 文章封面
          </h2>
          <div class="space-y-4">
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="cover.indexEnable" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">首页显示封面</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="cover.asideEnable" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">侧栏显示封面</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="cover.archivesEnable" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">归档页显示封面</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">封面位置</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer"><input v-model="cover.position" type="radio" value="left" class="accent-primary"> <span class="text-sm text-text">左侧</span></label>
                <label class="flex items-center gap-2 cursor-pointer"><input v-model="cover.position" type="radio" value="right" class="accent-primary"> <span class="text-sm text-text">右侧</span></label>
                <label class="flex items-center gap-2 cursor-pointer"><input v-model="cover.position" type="radio" value="both" class="accent-primary"> <span class="text-sm text-text">交替</span></label>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-shield-check w-5 h-5 text-primary" /> 文章版权声明
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">显示版权声明</label>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer" :class="postCopyright.enable ? 'bg-primary' : 'bg-surface-2'" @click="postCopyright.enable = !postCopyright.enable">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="postCopyright.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">许可协议</label>
                <input v-model="postCopyright.license" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              </div>
              <div>
                <label class="block text-sm font-medium text-text mb-1.5">协议链接</label>
                <input v-model="postCopyright.licenseUrl" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">所在地</label>
              <input v-model="postCopyright.location" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="如：长沙">
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="postCopyright.avatarSinks" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">悬停头像下沉效果</span>
            </label>
          </div>
        </div>

        <!-- Reward -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-currency-dollar w-5 h-5 text-primary" /> 赞赏/打赏
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">显示赞赏码</label>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer" :class="reward.enable ? 'bg-primary' : 'bg-surface-2'" @click="reward.enable = !reward.enable">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="reward.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="reward.enable" class="space-y-2">
            <div v-for="(qr, i) in reward.qrCodes" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <input v-model="qr.img" placeholder="二维码图片URL" class="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="qr.text" placeholder="名称" class="w-20 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer" @click="removeQrCode(i)">
                <span class="i-heroicons-x-mark w-4 h-4" />
              </button>
            </div>
            <button class="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addQrCode">
              + 添加收款码
            </button>
          </div>
        </div>

        <!-- Related Posts -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-arrows-right-left w-5 h-5 text-primary" /> 相关文章
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">显示相关文章</label>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer" :class="relatedPost.enable ? 'bg-primary' : 'bg-surface-2'" @click="relatedPost.enable = !relatedPost.enable">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="relatedPost.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">显示数量</label>
              <input v-model.number="relatedPost.limit" type="number" min="2" max="12" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">日期类型</label>
              <select v-model="relatedPost.dateType" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="created">创建日期</option>
                <option value="updated">更新日期</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Post Pagination -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-chevron-double-left w-5 h-5 text-primary" /> 文章分页导航
          </h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">分页方式</label>
            <select v-model="postPagination" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              <option value="1">上一篇（链接到旧文章）</option>
              <option value="2">下一篇（链接到新文章）</option>
              <option value="3">仅下一篇（滚动到评论区时显示，旧文章）</option>
              <option value="4">仅下一篇（显示封面图）</option>
              <option value="">禁用分页</option>
            </select>
          </div>
        </div>

        <!-- Notice Outdate -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-exclamation-triangle w-5 h-5 text-primary" /> 文章过期提醒
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">启用过期提醒</label>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer" :class="noticeOutdate.enable ? 'bg-primary' : 'bg-surface-2'" @click="noticeOutdate.enable = !noticeOutdate.enable">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="noticeOutdate.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="noticeOutdate.enable" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">过期天数</label>
              <input v-model.number="noticeOutdate.limitDay" type="number" min="30" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">样式</label>
              <select v-model="noticeOutdate.style" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="flat">扁平</option>
                <option value="simple">简洁</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">位置</label>
              <select v-model="noticeOutdate.position" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="top">顶部</option>
                <option value="bottom">底部</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: TOC, Wordcount, Post Tools -->
      <div class="space-y-6">
        <!-- TOC -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">文章目录</h2>
          <div class="flex items-center justify-between mb-3"><label class="text-sm">启用目录</label><button class="toggle" :class="toc.enable ? 'bg-primary' : 'bg-surface-2'" @click="toc.enable = !toc.enable"><span class="toggle-knob" :class="toc.enable ? 'translate-x-6' : 'translate-x-1'" /></button></div>
          <div class="flex items-center justify-between mb-3"><label class="text-sm">显示序号</label><button class="toggle" :class="toc.number ? 'bg-primary' : 'bg-surface-2'" @click="toc.number = !toc.number"><span class="toggle-knob" :class="toc.number ? 'translate-x-6' : 'translate-x-1'" /></button></div>
          <div class="flex items-center justify-between"><label class="text-sm">滚动百分比</label><button class="toggle" :class="toc.scrollPercent ? 'bg-primary' : 'bg-surface-2'" @click="toc.scrollPercent = !toc.scrollPercent"><span class="toggle-knob" :class="toc.scrollPercent ? 'translate-x-6' : 'translate-x-1'" /></button></div>
        </div>
        <!-- Word Count -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">字数统计</h2>
          <div class="flex items-center justify-between mb-3"><label class="text-sm">启用字数统计</label><button class="toggle" :class="wordcount.enable ? 'bg-primary' : 'bg-surface-2'" @click="wordcount.enable = !wordcount.enable"><span class="toggle-knob" :class="wordcount.enable ? 'translate-x-6' : 'translate-x-1'" /></button></div>
          <div class="flex items-center justify-between"><label class="text-sm">显示字数</label><button class="toggle" :class="wordcount.count ? 'bg-primary' : 'bg-surface-2'" @click="wordcount.count = !wordcount.count"><span class="toggle-knob" :class="wordcount.count ? 'translate-x-6' : 'translate-x-1'" /></button></div>
        </div>
        <!-- Post Tools (ptool) -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">文章工具</h2>
          <div class="flex items-center justify-between mb-3"><label class="text-sm">启用工具栏</label><button class="toggle" :class="ptool.enable ? 'bg-primary' : 'bg-surface-2'" @click="ptool.enable = !ptool.enable"><span class="toggle-knob" :class="ptool.enable ? 'translate-x-6' : 'translate-x-1'" /></button></div>
          <div class="flex items-center justify-between"><label class="text-sm">显示分享按钮</label><button class="toggle" :class="ptool.share ? 'bg-primary' : 'bg-surface-2'" @click="ptool.share = !ptool.share"><span class="toggle-knob" :class="ptool.share ? 'translate-x-6' : 'translate-x-1'" /></button></div>
        </div>
        <!-- Preview -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" /> 效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问任意文章查看效果</p>
          <NuxtLink to="/articles" target="_blank" class="btn-secondary w-full flex items-center justify-center gap-2">
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" /> 查看文章列表
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

