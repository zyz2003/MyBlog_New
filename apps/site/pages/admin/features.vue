<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Background effects
const canvasRibbon = ref({ enable: false, size: 150, alpha: 0.6, mobile: false })
const canvasNest = ref({ enable: false, color: '0,0,255', opacity: 0.7, count: 99, mobile: false })
const fireworks = ref({ enable: false, mobile: false })
const clickHeart = ref({ enable: false, mobile: false })
const clickShowText = ref({ enable: false, text: [] as string[], fontSize: '15px', random: false, mobile: false })
const activatePowerMode = ref({ enable: false, colorful: true, shake: false, mobile: false })
const universe = ref({ enable: true })
const bubble = ref({ enable: false })

// Music
const navMusic = ref({
  enable: false,
  id: '',
  server: 'netease' as string,
  volume: 0.7,
  allPlaylist: '',
})
const musicPageDefault = ref('nav_music' as string)

// AI Summary
const aiSummary = ref({
  enable: false,
  gptName: 'AI助手',
  mode: 'local' as string,
  switchBtn: false,
  basicWordCount: 1000,
  randomNum: 3,
  key: '',
})

// Right-click menu
const rightClickMenu = ref({ enable: false })

// Shortcut keys
const shortcutKey = ref({ enable: false, delay: 100, shiftDelay: 200 })
const accesskey = ref({ enable: true })

// Greeting box
const greetingBox = ref({
  enable: false,
  defaultGreeting: '晚上好',
  greetings: [] as Array<{ greeting: string; startTime: number; endTime: number }>,
})

// Comment barrage
const commentBarrage = ref({
  enable: false,
  maxBarrage: 1,
  barrageTime: 4000,
  accessToken: '',
  mailMd5: '',
})

// Translate
const translate = ref({
  enable: true,
  default: '繁',
  defaultEncoding: 2,
  translateDelay: 0,
})

// Read mode
const readmode = ref(true)

// Rightside item order
const rightsideItems = ref({
  enableOrder: false,
  hide: [] as string[],
  show: [] as string[],
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) { s[row.key] = row.value }
    }

    if (s.canvasRibbon) canvasRibbon.value = { ...canvasRibbon.value, ...(s.canvasRibbon as typeof canvasRibbon.value) }
    if (s.canvasNest) canvasNest.value = { ...canvasNest.value, ...(s.canvasNest as typeof canvasNest.value) }
    if (s.fireworks) fireworks.value = { ...fireworks.value, ...(s.fireworks as typeof fireworks.value) }
    if (s.clickHeart) clickHeart.value = { ...clickHeart.value, ...(s.clickHeart as typeof clickHeart.value) }
    if (s.clickShowText) clickShowText.value = { ...clickShowText.value, ...(s.clickShowText as typeof clickShowText.value) }
    if (s.activatePowerMode) activatePowerMode.value = { ...activatePowerMode.value, ...(s.activatePowerMode as typeof activatePowerMode.value) }
    if (s.universe) universe.value = { ...universe.value, ...(s.universe as typeof universe.value) }
    if (s.bubble) bubble.value = { ...bubble.value, ...(s.bubble as typeof bubble.value) }
    if (s.navMusic) navMusic.value = { ...navMusic.value, ...(s.navMusic as typeof navMusic.value) }
    if (s.musicPageDefault) musicPageDefault.value = s.musicPageDefault as string
    if (s.aiSummary) aiSummary.value = { ...aiSummary.value, ...(s.aiSummary as typeof aiSummary.value) }
    if (s.rightClickMenu) rightClickMenu.value = { ...rightClickMenu.value, ...(s.rightClickMenu as typeof rightClickMenu.value) }
    if (s.shortcutKey) shortcutKey.value = { ...shortcutKey.value, ...(s.shortcutKey as typeof shortcutKey.value) }
    if (s.accesskey) accesskey.value = { ...accesskey.value, ...(s.accesskey as typeof accesskey.value) }
    if (s.greetingBox) greetingBox.value = { ...greetingBox.value, ...(s.greetingBox as typeof greetingBox.value) }
    if (s.commentBarrage) commentBarrage.value = { ...commentBarrage.value, ...(s.commentBarrage as typeof commentBarrage.value) }
    if (s.translate) translate.value = { ...translate.value, ...(s.translate as typeof translate.value) }
    if (s.readmode !== undefined) readmode.value = Boolean(s.readmode)
    if (s.rightsideItems) rightsideItems.value = { ...rightsideItems.value, ...(s.rightsideItems as typeof rightsideItems.value) }
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
      { key: 'canvasRibbon', value: canvasRibbon.value, category: 'features' },
      { key: 'canvasNest', value: canvasNest.value, category: 'features' },
      { key: 'fireworks', value: fireworks.value, category: 'features' },
      { key: 'clickHeart', value: clickHeart.value, category: 'features' },
      { key: 'clickShowText', value: clickShowText.value, category: 'features' },
      { key: 'activatePowerMode', value: activatePowerMode.value, category: 'features' },
      { key: 'universe', value: universe.value, category: 'features' },
      { key: 'bubble', value: bubble.value, category: 'features' },
      { key: 'navMusic', value: navMusic.value, category: 'features' },
      { key: 'musicPageDefault', value: musicPageDefault.value, category: 'features' },
      { key: 'aiSummary', value: aiSummary.value, category: 'features' },
      { key: 'rightClickMenu', value: rightClickMenu.value, category: 'features' },
      { key: 'shortcutKey', value: shortcutKey.value, category: 'features' },
      { key: 'accesskey', value: accesskey.value, category: 'features' },
      { key: 'greetingBox', value: greetingBox.value, category: 'features' },
      { key: 'commentBarrage', value: commentBarrage.value, category: 'features' },
      { key: 'translate', value: translate.value, category: 'features' },
      { key: 'readmode', value: readmode.value, category: 'features' },
      { key: 'rightsideItems', value: rightsideItems.value, category: 'features' },
    ])
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function addGreeting() {
  greetingBox.value.greetings.push({ greeting: '', startTime: 0, endTime: 0 })
}
function removeGreeting(index: number) {
  greetingBox.value.greetings.splice(index, 1)
}

onMounted(() => fetchSettings())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-sparkles w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">特效与功能</h1>
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
      <div class="h-48 bg-surface-2 rounded-xl animate-pulse" v-for="i in 4" :key="i" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Background Effects -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-paint-brush w-5 h-5 text-primary" /> 背景特效
          </h2>

          <!-- Canvas Ribbon -->
          <div class="border border-border rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between mb-3">
              <label class="font-medium text-text">静止彩带背景</label>
              <button class="toggle-switch" :class="canvasRibbon.enable ? 'bg-primary' : 'bg-surface-2'" @click="canvasRibbon.enable = !canvasRibbon.enable">
                <span class="toggle-knob" :class="canvasRibbon.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div v-if="canvasRibbon.enable" class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-muted mb-1">大小</label>
                <input v-model.number="canvasRibbon.size" type="number" class="w-full px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text">
              </div>
              <div>
                <label class="block text-xs text-muted mb-1">透明度</label>
                <input v-model.number="canvasRibbon.alpha" type="number" step="0.1" min="0" max="1" class="w-full px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text">
              </div>
              <label class="flex items-center gap-1 cursor-pointer text-xs">
                <input v-model="canvasRibbon.mobile" type="checkbox" class="w-3 h-3 rounded accent-primary"> 移动端
              </label>
            </div>
          </div>

          <!-- Canvas Nest -->
          <div class="border border-border rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between mb-3">
              <label class="font-medium text-text">动态线条背景</label>
              <button class="toggle-switch" :class="canvasNest.enable ? 'bg-primary' : 'bg-surface-2'" @click="canvasNest.enable = !canvasNest.enable">
                <span class="toggle-knob" :class="canvasNest.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div v-if="canvasNest.enable" class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-muted mb-1">线条颜色 (RGB)</label>
                <input v-model="canvasNest.color" type="text" class="w-full px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text">
              </div>
              <div>
                <label class="block text-xs text-muted mb-1">透明度</label>
                <input v-model.number="canvasNest.opacity" type="number" step="0.1" min="0" max="1" class="w-full px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text">
              </div>
              <div>
                <label class="block text-xs text-muted mb-1">线条数量</label>
                <input v-model.number="canvasNest.count" type="number" class="w-full px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text">
              </div>
            </div>
          </div>

          <!-- Fireworks -->
          <div class="border border-border rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">点击烟花特效</label>
              <button class="toggle-switch" :class="fireworks.enable ? 'bg-primary' : 'bg-surface-2'" @click="fireworks.enable = !fireworks.enable">
                <span class="toggle-knob" :class="fireworks.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- Click Heart -->
          <div class="border border-border rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between">
              <label class="font-medium text-text">点击爱心特效</label>
              <button class="toggle-switch" :class="clickHeart.enable ? 'bg-primary' : 'bg-surface-2'" @click="clickHeart.enable = !clickHeart.enable">
                <span class="toggle-knob" :class="clickHeart.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- Activate Power Mode -->
          <div class="border border-border rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between mb-3">
              <label class="font-medium text-text">打字特效 (Power Mode)</label>
              <button class="toggle-switch" :class="activatePowerMode.enable ? 'bg-primary' : 'bg-surface-2'" @click="activatePowerMode.enable = !activatePowerMode.enable">
                <span class="toggle-knob" :class="activatePowerMode.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div v-if="activatePowerMode.enable" class="flex gap-4">
              <label class="flex items-center gap-1 cursor-pointer text-xs">
                <input v-model="activatePowerMode.colorful" type="checkbox" class="w-3 h-3 rounded accent-primary"> 彩色粒子
              </label>
              <label class="flex items-center gap-1 cursor-pointer text-xs">
                <input v-model="activatePowerMode.shake" type="checkbox" class="w-3 h-3 rounded accent-primary"> 抖动
              </label>
            </div>
          </div>

          <!-- Universe & Bubble -->
          <div class="flex gap-6 flex-wrap mt-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="universe.enable" type="checkbox" class="w-4 h-4 rounded accent-primary">
              <span class="text-sm text-text">深色模式粒子效果</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="bubble.enable" type="checkbox" class="w-4 h-4 rounded accent-primary">
              <span class="text-sm text-text">卡片气泡升起效果</span>
            </label>
          </div>
        </div>

        <!-- Music -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-musical-note w-5 h-5 text-primary" /> 左下角音乐
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">启用音乐播放器</label>
            <button class="toggle-switch" :class="navMusic.enable ? 'bg-primary' : 'bg-surface-2'" @click="navMusic.enable = !navMusic.enable">
              <span class="toggle-knob" :class="navMusic.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="navMusic.enable" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">音乐平台</label>
              <select v-model="navMusic.server" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="netease">网易云音乐</option>
                <option value="tencent">QQ音乐</option>
                <option value="xiami">虾米</option>
                <option value="kugou">酷狗</option>
                <option value="baidu">百度</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">歌单/歌曲 ID</label>
              <input v-model="navMusic.id" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="如: 8152976493">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认音量</label>
              <input v-model.number="navMusic.volume" type="range" min="0" max="1" step="0.1" class="w-full">
              <span class="text-xs text-muted">{{ Math.round(navMusic.volume * 100) }}%</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">全部歌单链接</label>
              <input v-model="navMusic.allPlaylist" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="QQ音乐歌单链接">
            </div>
          </div>
        </div>

        <!-- AI Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-cpu-chip w-5 h-5 text-primary" /> 文章 AI 摘要
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">启用 AI 摘要</label>
            <button class="toggle-switch" :class="aiSummary.enable ? 'bg-primary' : 'bg-surface-2'" @click="aiSummary.enable = !aiSummary.enable">
              <span class="toggle-knob" :class="aiSummary.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="aiSummary.enable" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">AI 名称</label>
              <input v-model="aiSummary.gptName" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">模式</label>
              <select v-model="aiSummary.mode" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="local">本地</option>
                <option value="tianli">Tianli API</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">最低字数</label>
              <input v-model.number="aiSummary.basicWordCount" type="number" min="1000" max="1999" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">随机数量</label>
              <input v-model.number="aiSummary.randomNum" type="number" min="1" max="10" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Comment Barrage -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-bars-arrow-up w-5 h-5 text-primary" /> 评论弹幕
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">启用评论弹幕</label>
            <button class="toggle-switch" :class="commentBarrage.enable ? 'bg-primary' : 'bg-surface-2'" @click="commentBarrage.enable = !commentBarrage.enable">
              <span class="toggle-knob" :class="commentBarrage.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="commentBarrage.enable" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">最大弹幕数</label>
              <input v-model.number="commentBarrage.maxBarrage" type="number" min="1" max="10" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">弹幕间隔 (ms)</label>
              <input v-model.number="commentBarrage.barrageTime" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Greeting Box -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-hand-raised w-5 h-5 text-primary" /> 欢迎语
          </h2>
          <div class="flex items-center justify-between mb-4">
            <label class="font-medium text-text">启��时间段欢迎语</label>
            <button class="toggle-switch" :class="greetingBox.enable ? 'bg-primary' : 'bg-surface-2'" @click="greetingBox.enable = !greetingBox.enable">
              <span class="toggle-knob" :class="greetingBox.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="greetingBox.enable" class="space-y-2">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认问候</label>
              <input v-model="greetingBox.defaultGreeting" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div v-for="(g, i) in greetingBox.greetings" :key="i" class="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
              <input v-model="g.greeting" placeholder="问候语" class="w-40 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model.number="g.startTime" type="number" min="0" max="23" placeholder="开始时间" class="w-16 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <input v-model.number="g.endTime" type="number" min="0" max="23" placeholder="结束时间" class="w-16 px-2 py-1 bg-surface border border-border rounded text-xs text-text">
              <button class="p-1 text-red-400 hover:text-red-600 cursor-pointer" @click="removeGreeting(i)">
                <span class="i-heroicons-x-mark w-4 h-4" />
              </button>
            </div>
            <button class="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer" @click="addGreeting">
              + 添加时间段
            </button>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- Translate & Read Mode -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-language w-5 h-5 text-primary" /> 简繁转换
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">启用简繁转换</label>
              <button class="toggle-switch" :class="translate.enable ? 'bg-primary' : 'bg-surface-2'" @click="translate.enable = !translate.enable">
                <span class="toggle-knob" :class="translate.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">默认编码</label>
              <select v-model="translate.defaultEncoding" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option :value="1">繁体中文</option>
                <option :value="2">简体中文</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-book-open w-5 h-5 text-primary" /> 阅读模式
          </h2>
          <div class="flex items-center justify-between">
            <label class="text-sm text-text">启用阅读模式</label>
            <button class="toggle-switch" :class="readmode ? 'bg-primary' : 'bg-surface-2'" @click="readmode = !readmode">
              <span class="toggle-knob" :class="readmode ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>

        <!-- Right-click Menu -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-cursor-arrow-ripple w-5 h-5 text-primary" /> 右键菜单
          </h2>
          <div class="flex items-center justify-between">
            <label class="text-sm text-text">自定义右键菜单</label>
            <button class="toggle-switch" :class="rightClickMenu.enable ? 'bg-primary' : 'bg-surface-2'" @click="rightClickMenu.enable = !rightClickMenu.enable">
              <span class="toggle-knob" :class="rightClickMenu.enable ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>

        <!-- Shortcut Keys -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-key w-5 h-5 text-primary" /> 快捷键
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">启用快捷键</label>
              <button class="toggle-switch" :class="shortcutKey.enable ? 'bg-primary' : 'bg-surface-2'" @click="shortcutKey.enable = !shortcutKey.enable">
                <span class="toggle-knob" :class="shortcutKey.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm text-text">无障碍快捷键 (Shift+?)</label>
              <button class="toggle-switch" :class="accesskey.enable ? 'bg-primary' : 'bg-surface-2'" @click="accesskey.enable = !accesskey.enable">
                <span class="toggle-knob" :class="accesskey.enable ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" /> 效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问前台查看各项特效</p>
          <NuxtLink to="/" target="_blank" class="btn-secondary w-full flex items-center justify-center gap-2">
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" /> 预览前台
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toggle-switch { @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer; }
.toggle-knob { @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform; }
</style>
