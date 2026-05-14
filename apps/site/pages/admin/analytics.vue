<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// Analytics provider
const analytics = ref({
  provider: '' as string, // '' | 'baidu' | 'google' | 'cloudflare' | 'microsoft' | 'umami' | 'la51'
})

const baiduAnalytics = ref({ id: '' })
const googleAnalytics = ref({ id: '' })
const cloudflareAnalytics = ref({ id: '' })
const microsoftClarity = ref({ id: '' })
const la51 = ref({ ck: '', LingQueMonitorID: '' })
const umami = ref({
  apiHost: '',
  websiteId: '',
  token: '',
})

// Busuanzi
const busuanzi = ref({
  siteUv: false,
  sitePv: false,
  pagePv: false,
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) { s[row.key] = row.value }
    }

    if (s.analytics) analytics.value = { ...analytics.value, ...(s.analytics as typeof analytics.value) }
    if (s.baiduAnalytics) baiduAnalytics.value = { ...baiduAnalytics.value, ...(s.baiduAnalytics as typeof baiduAnalytics.value) }
    if (s.googleAnalytics) googleAnalytics.value = { ...googleAnalytics.value, ...(s.googleAnalytics as typeof googleAnalytics.value) }
    if (s.cloudflareAnalytics) cloudflareAnalytics.value = { ...cloudflareAnalytics.value, ...(s.cloudflareAnalytics as typeof cloudflareAnalytics.value) }
    if (s.microsoftClarity) microsoftClarity.value = { ...microsoftClarity.value, ...(s.microsoftClarity as typeof microsoftClarity.value) }
    if (s.la51) la51.value = { ...la51.value, ...(s.la51 as typeof la51.value) }
    if (s.umami) umami.value = { ...umami.value, ...(s.umami as typeof umami.value) }
    if (s.busuanzi) busuanzi.value = { ...busuanzi.value, ...(s.busuanzi as typeof busuanzi.value) }
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
      { key: 'analytics', value: analytics.value, category: 'analytics' },
      { key: 'baiduAnalytics', value: baiduAnalytics.value, category: 'analytics' },
      { key: 'googleAnalytics', value: googleAnalytics.value, category: 'analytics' },
      { key: 'cloudflareAnalytics', value: cloudflareAnalytics.value, category: 'analytics' },
      { key: 'microsoftClarity', value: microsoftClarity.value, category: 'analytics' },
      { key: 'la51', value: la51.value, category: 'analytics' },
      { key: 'umami', value: umami.value, category: 'analytics' },
      { key: 'busuanzi', value: busuanzi.value, category: 'analytics' },
    ])
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchSettings())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-chart-bar w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">统计分析</h1>
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
        <!-- Provider -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-presentation-chart-line w-5 h-5 text-primary" /> 统计服务
          </h2>
          <p class="text-sm text-muted mb-4">选择一个统计服务来跟踪网站访问数据</p>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">选择服务</label>
            <select v-model="analytics.provider" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
              <option value="">不使用统计</option>
              <option value="baidu">百度统计</option>
              <option value="google">Google Analytics</option>
              <option value="cloudflare">Cloudflare Analytics</option>
              <option value="microsoft">Microsoft Clarity</option>
              <option value="umami">Umami</option>
              <option value="la51">51LA 统计</option>
            </select>
          </div>
        </div>

        <!-- Baidu -->
        <div v-if="analytics.provider === 'baidu'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">百度统计</h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">统计 ID</label>
            <input v-model="baiduAnalytics.id" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="在百度统计后台获取">
          </div>
        </div>

        <!-- Google -->
        <div v-if="analytics.provider === 'google'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Google Analytics</h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">测量 ID (G-XXXXXXXX)</label>
            <input v-model="googleAnalytics.id" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="G-XXXXXXXX">
          </div>
        </div>

        <!-- Cloudflare -->
        <div v-if="analytics.provider === 'cloudflare'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Cloudflare Analytics</h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">Token</label>
            <input v-model="cloudflareAnalytics.id" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
          </div>
        </div>

        <!-- Microsoft Clarity -->
        <div v-if="analytics.provider === 'microsoft'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Microsoft Clarity</h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">项目 ID</label>
            <input v-model="microsoftClarity.id" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
          </div>
        </div>

        <!-- 51LA -->
        <div v-if="analytics.provider === 'la51'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">51LA 统计</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">CK</label>
              <input v-model="la51.ck" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">灵雀监控 ID</label>
              <input v-model="la51.LingQueMonitorID" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Umami -->
        <div v-if="analytics.provider === 'umami'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Umami</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">API 地址</label>
              <input v-model="umami.apiHost" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="https://analytics.example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">网站 ID</label>
              <input v-model="umami.websiteId" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-text mb-1.5">API Token</label>
              <input v-model="umami.token" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Busuanzi -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-users w-5 h-5 text-primary" /> 不蒜子统计
          </h2>
          <p class="text-sm text-muted mb-4">轻量级访客统计（可与上述统计共存）</p>
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="busuanzi.siteUv" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">全站 UV</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="busuanzi.sitePv" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">全站 PV</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="busuanzi.pagePv" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">页面 PV</span>
            </label>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-light-bulb w-5 h-5 text-primary" /> 推荐
          </h2>
          <div class="text-sm text-muted space-y-2">
            <p><strong>百度统计</strong> — 适合中文站点</p>
            <p><strong>Google Analytics</strong> — 国际通用</p>
            <p><strong>Umami</strong> — 自托管、隐私友好</p>
            <p><strong>Microsoft Clarity</strong> — 免费热力图</p>
            <p><strong>不蒜子</strong> — 极简计数，零配置</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

