<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Social links
const socialLinks = ref<Array<{ name: string; url: string; icon: string }>>([
  { name: 'GitHub', url: '', icon: 'i-simple-icons-github' },
  { name: 'Bilibili', url: '', icon: 'i-simple-icons-bilibili' },
  { name: 'Twitter', url: '', icon: 'i-simple-icons-twitter' },
  { name: 'Email', url: '', icon: 'i-heroicons-envelope' },
])

// Footer
const footer = ref({
  ownerEnabled: true,
  ownerSince: 2020,
  customText: '',
  socialBarEnabled: false,
  footerBarEnabled: true,
  authorLink: '/',
  subTitleEnabled: false,
  subTitleEffect: true,
  subTitleLoop: true,
  subTitleSource: '1' as string,
  subTitleText: '',
})

// Footer badge items
const badgeItems = ref<Array<{ link: string; shields: string; message: string }>>([])

// Footer social bar
const footerSocials = ref<Array<{ title: string; link: string; icon: string; side: 'left' | 'right' }>>([
  { title: 'GitHub', link: '', icon: 'i-simple-icons-github', side: 'left' },
  { title: 'Email', link: '', icon: 'i-heroicons-envelope', side: 'left' },
  { title: 'Bilibili', link: '', icon: 'i-simple-icons-bilibili', side: 'right' },
  { title: 'RSS', link: '/atom.xml', icon: 'i-heroicons-rss', side: 'right' },
])

// Dark mode
const darkmode = ref({
  enabled: true,
  button: true,
  autoChangeMode: '1' as string,
  start: 22,
  end: 8,
})

// DiyTitle
const diytitle = ref({
  enabled: true,
  leaveTitle: 'w(ﾟДﾟ)w 不要走！再看看嘛！',
  backTitle: '♪(^∇^*)欢迎肥来！',
})

// Console
const consoleLog = ref({
  enabled: true,
})

// Inject
const injectCode = ref({
  head: '',
  bottom: '',
})

// Runtime
const runtime = ref({
  enabled: false,
  launchTime: '',
})

// Subtitle on homepage
const homeSubtitle = ref({
  enabled: false,
  effect: true,
  loop: true,
  source: '1' as string,
  text: '',
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        s[row.key] = row.value
      }
    }

    if (s.socialLinks) socialLinks.value = s.socialLinks as typeof socialLinks.value
    if (s.footer) footer.value = { ...footer.value, ...(s.footer as typeof footer.value) }
    if (s.badgeItems) badgeItems.value = s.badgeItems as typeof badgeItems.value
    if (s.footerSocials) footerSocials.value = s.footerSocials as typeof footerSocials.value
    if (s.darkmode) darkmode.value = { ...darkmode.value, ...(s.darkmode as typeof darkmode.value) }
    if (s.diytitle) diytitle.value = { ...diytitle.value, ...(s.diytitle as typeof diytitle.value) }
    if (s.consoleLog) consoleLog.value = { ...consoleLog.value, ...(s.consoleLog as typeof consoleLog.value) }
    if (s.injectCode) injectCode.value = { ...injectCode.value, ...(s.injectCode as typeof injectCode.value) }
    if (s.runtime) runtime.value = { ...runtime.value, ...(s.runtime as typeof runtime.value) }
    if (s.homeSubtitle) homeSubtitle.value = { ...homeSubtitle.value, ...(s.homeSubtitle as typeof homeSubtitle.value) }
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
      { key: 'socialLinks', value: socialLinks.value, category: 'general' },
      { key: 'footer', value: footer.value, category: 'general' },
      { key: 'badgeItems', value: badgeItems.value, category: 'general' },
      { key: 'footerSocials', value: footerSocials.value, category: 'general' },
      { key: 'darkmode', value: darkmode.value, category: 'general' },
      { key: 'diytitle', value: diytitle.value, category: 'general' },
      { key: 'consoleLog', value: consoleLog.value, category: 'general' },
      { key: 'injectCode', value: injectCode.value, category: 'general' },
      { key: 'runtime', value: runtime.value, category: 'general' },
      { key: 'homeSubtitle', value: homeSubtitle.value, category: 'general' },
    ])
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function addSocialLink() {
  socialLinks.value.push({ name: '', url: '', icon: 'i-heroicons-link' })
}
function removeSocialLink(index: number) {
  socialLinks.value.splice(index, 1)
}
function addBadge() {
  badgeItems.value.push({ link: '', shields: '', message: '' })
}
function removeBadge(index: number) {
  badgeItems.value.splice(index, 1)
}
function addFooterSocial() {
  footerSocials.value.push({ title: '', link: '', icon: 'i-heroicons-link', side: 'left' })
}
function removeFooterSocial(index: number) {
  footerSocials.value.splice(index, 1)
}

onMounted(() => fetchSettings())
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-cog-6-tooth w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">全局设置</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" /> 保存成功
        </span>
        <button
          class="btn-primary px-4 py-2 text-sm flex items-center gap-2 cursor-pointer"
          :disabled="saving"
          @click="handleSave"
        >
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-48 bg-surface-2 rounded-xl animate-pulse" v-for="i in 3" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Social Links -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-share w-5 h-5 text-primary" /> 社交链接
          </h2>
          <p class="text-sm text-muted mb-4">显示在首页 Hero 区域和侧边栏的社交图标</p>
          <div class="space-y-2">
            <div v-for="(link, i) in socialLinks" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <span :class="link.icon" class="w-5 h-5 text-muted shrink-0" />
              <input v-model="link.name" placeholder="名称" class="w-24 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="link.url" placeholder="https://..." class="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="link.icon" placeholder="图标类名" class="w-40 px-2 py-1 bg-surface border border-border rounded text-xs text-text font-mono">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer" @click="removeSocialLink(i)">
                <span class="i-heroicons-x-mark w-4 h-4" />
              </button>
            </div>
            <button class="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addSocialLink">
              + 添加社交链接
            </button>
          </div>
        </div>

        <!-- Homepage Subtitle -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-chat-bubble-left w-5 h-5 text-primary" /> 首页副标题
          </h2>
          <p class="text-sm text-muted mb-4">Hero 区域下方的打字机效果文字</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">启用副标题</label>
              <button class="toggle-switch" :class="homeSubtitle.enabled ? 'bg-primary' : 'bg-surface-2'" @click="homeSubtitle.enabled = !homeSubtitle.enabled">
                <span class="toggle-knob" :class="homeSubtitle.enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">打字效果</label>
              <button class="toggle-switch" :class="homeSubtitle.effect ? 'bg-primary' : 'bg-surface-2'" @click="homeSubtitle.effect = !homeSubtitle.effect">
                <span class="toggle-knob" :class="homeSubtitle.effect ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">循环播放</label>
              <button class="toggle-switch" :class="homeSubtitle.loop ? 'bg-primary' : 'bg-surface-2'" @click="homeSubtitle.loop = !homeSubtitle.loop">
                <span class="toggle-knob" :class="homeSubtitle.loop ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">数据源</label>
              <select v-model="homeSubtitle.source" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="1">一言网 (hitokoto.cn)</option>
                <option value="2">一句网 (yijuzhan.com)</option>
                <option value="3">今日诗词 (jinrishici.com)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">自定义文字（数据源失败时显示）</label>
              <textarea v-model="homeSubtitle.text" rows="2" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text resize-none" placeholder="每行一条，用 &#44; 分隔" />
            </div>
          </div>
        </div>

        <!-- Footer Settings -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-document-arrow-down w-5 h-5 text-primary" /> 页脚设置
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">显示站长信息</label>
              <button class="toggle-switch" :class="footer.ownerEnabled ? 'bg-primary' : 'bg-surface-2'" @click="footer.ownerEnabled = !footer.ownerEnabled">
                <span class="toggle-knob" :class="footer.ownerEnabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">建站年份</label>
              <input v-model.number="footer.ownerSince" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">自定义页脚文字</label>
              <input v-model="footer.customText" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="如：湘ICP备-xxxxxxx号">
            </div>

            <!-- Runtime -->
            <div class="border-t border-border pt-4">
              <div class="flex items-center justify-between mb-3">
                <label class="font-medium text-text">运行时间统计</label>
                <button class="toggle-switch" :class="runtime.enabled ? 'bg-primary' : 'bg-surface-2'" @click="runtime.enabled = !runtime.enabled">
                  <span class="toggle-knob" :class="runtime.enabled ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
              <input v-if="runtime.enabled" v-model="runtime.launchTime" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="04/01/2021 00:00:00">
            </div>

            <!-- Footer Bar -->
            <div class="border-t border-border pt-4">
              <div class="flex items-center justify-between mb-3">
                <label class="font-medium text-text">显示页脚链接栏</label>
                <button class="toggle-switch" :class="footer.footerBarEnabled ? 'bg-primary' : 'bg-surface-2'" @click="footer.footerBarEnabled = !footer.footerBarEnabled">
                  <span class="toggle-knob" :class="footer.footerBarEnabled ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
              <div v-if="footer.footerBarEnabled">
                <label class="block text-sm font-medium text-text mb-1.5">站长链接</label>
                <input v-model="footer.authorLink" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="/ 或 /about">
              </div>
            </div>

            <!-- SubTitle typing in footer -->
            <div class="border-t border-border pt-4">
              <div class="flex items-center justify-between mb-3">
                <label class="font-medium text-text">页脚打字副标题</label>
                <button class="toggle-switch" :class="footer.subTitleEnabled ? 'bg-primary' : 'bg-surface-2'" @click="footer.subTitleEnabled = !footer.subTitleEnabled">
                  <span class="toggle-knob" :class="footer.subTitleEnabled ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
              <div v-if="footer.subTitleEnabled" class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm text-text">打字效果</label>
                  <button class="toggle-switch" :class="footer.subTitleEffect ? 'bg-primary' : 'bg-surface-2'" @click="footer.subTitleEffect = !footer.subTitleEffect">
                    <span class="toggle-knob" :class="footer.subTitleEffect ? 'translate-x-6' : 'translate-x-1'" />
                  </button>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text mb-1.5">数据源</label>
                  <select v-model="footer.subTitleSource" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                    <option value="1">一言网</option>
                    <option value="2">一句网</option>
                    <option value="3">今日诗词</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text mb-1.5">自定义文字</label>
                  <textarea v-model="footer.subTitleText" rows="2" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text resize-none" placeholder="每行一条" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Badges -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-shield-check w-5 h-5 text-primary" /> 页脚徽章 (Shields.io)
          </h2>
          <div class="space-y-2">
            <div v-for="(badge, i) in badgeItems" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <input v-model="badge.link" placeholder="链接" class="w-32 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="badge.shields" placeholder="徽章图片URL" class="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="badge.message" placeholder="提示文字" class="w-40 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer" @click="removeBadge(i)">
                <span class="i-heroicons-x-mark w-4 h-4" />
              </button>
            </div>
            <button class="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addBadge">
              + 添加徽章
            </button>
          </div>
        </div>

        <!-- Footer Social Bar -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-heart w-5 h-5 text-primary" /> 页脚社交栏
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">显示社交栏</label>
            <button class="toggle-switch" :class="footer.socialBarEnabled ? 'bg-primary' : 'bg-surface-2'" @click="footer.socialBarEnabled = !footer.socialBarEnabled">
              <span class="toggle-knob" :class="footer.socialBarEnabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="footer.socialBarEnabled" class="space-y-2">
            <div v-for="(item, i) in footerSocials" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <select v-model="item.side" class="w-16 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
                <option value="left">左侧</option>
                <option value="right">右侧</option>
              </select>
              <span :class="item.icon" class="w-4 h-4 text-muted shrink-0" />
              <input v-model="item.title" placeholder="标题" class="w-20 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model="item.link" placeholder="链接" class="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer" @click="removeFooterSocial(i)">
                <span class="i-heroicons-x-mark w-4 h-4" />
              </button>
            </div>
            <button class="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addFooterSocial">
              + 添加社交图标
            </button>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- Dark Mode -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-moon w-5 h-5 text-primary" /> 深色模式
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">启用深色模式</label>
              <button class="toggle-switch" :class="darkmode.enabled ? 'bg-primary' : 'bg-surface-2'" @click="darkmode.enabled = !darkmode.enabled">
                <span class="toggle-knob" :class="darkmode.enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">显示切换按钮</label>
              <button class="toggle-switch" :class="darkmode.button ? 'bg-primary' : 'bg-surface-2'" @click="darkmode.button = !darkmode.button">
                <span class="toggle-knob" :class="darkmode.button ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">自动切换模式</label>
              <select v-model="darkmode.autoChangeMode" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="1">跟随系统（不支持则 18-06 点切换）</option>
                <option value="2">固定时间切换</option>
                <option value="">不自动切换</option>
              </select>
            </div>
            <div v-if="darkmode.autoChangeMode === '2'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-muted mb-1">深色开始（时）</label>
                <input v-model.number="darkmode.start" type="number" min="0" max="23" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              </div>
              <div>
                <label class="block text-xs text-muted mb-1">深色结束（时）</label>
                <input v-model.number="darkmode.end" type="number" min="0" max="23" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              </div>
            </div>
          </div>
        </div>

        <!-- DiyTitle -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-window w-5 h-5 text-primary" /> 标签页标题
          </h2>
          <p class="text-xs text-muted mb-4">切换标签页时浏览器标题的变化</p>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">启用卖萌标题</label>
              <button class="toggle-switch" :class="diytitle.enabled ? 'bg-primary' : 'bg-surface-2'" @click="diytitle.enabled = !diytitle.enabled">
                <span class="toggle-knob" :class="diytitle.enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">离开时标题</label>
              <input v-model="diytitle.leaveTitle" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">返回时标题</label>
              <input v-model="diytitle.backTitle" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Console -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-command-line w-5 h-5 text-primary" /> 控制台输出
          </h2>
          <div class="flex items-center justify-between">
            <label class="text-sm text-text">启用控制台欢迎信息</label>
            <button class="toggle-switch" :class="consoleLog.enabled ? 'bg-primary' : 'bg-surface-2'" @click="consoleLog.enabled = !consoleLog.enabled">
              <span class="toggle-knob" :class="consoleLog.enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>

        <!-- Custom Inject -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-code-bracket w-5 h-5 text-primary" /> 自定义注入
          </h2>
          <p class="text-xs text-muted mb-4">在页面 head/body 注入自定义 HTML</p>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">&lt;/head&gt; 前</label>
              <textarea v-model="injectCode.head" rows="3" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text font-mono text-xs resize-none" placeholder="<link rel='stylesheet' href='/css/custom.css'>" />
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">&lt;/body&gt; 前</label>
              <textarea v-model="injectCode.bottom" rows="3" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text font-mono text-xs resize-none" placeholder="<script src='/js/custom.js'></script>" />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" /> 效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问前台查看效果</p>
          <NuxtLink to="/" target="_blank" class="btn-secondary w-full flex items-center justify-center gap-2">
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" /> 预览首页
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toggle-switch {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer;
}
.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform;
}
</style>
