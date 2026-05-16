<script setup lang="ts">
const api = useAdminApi()

const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

// SEO settings
const seo = ref({
  siteTitle: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  baiduVerification: '',
  googleVerification: '',
})

const ogMeta = ref({ ogImage: '', twitterCard: 'summary_large_image' as string })
const seoBing = ref('')

// Fetch settings
async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')

    const allSettings: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        allSettings[row.key] = row.value
      }
    }

    seo.value = {
      siteTitle: (allSettings.siteTitle as string) || '',
      seoTitle: (allSettings.seoTitle as string) || '',
      seoDescription: (allSettings.seoDescription as string) || '',
      seoKeywords: (allSettings.seoKeywords as string) || '',
      baiduVerification: (allSettings.baiduVerification as string) || '',
      googleVerification: (allSettings.googleVerification as string) || '',
    }
  }
  catch (e) {
    console.error('Failed to fetch settings:', e)
  }
  finally {
    loading.value = false
  }
}

// Save settings
async function handleSave() {
  saving.value = true
  saveSuccess.value = false

  try {
    const items = [
      { key: 'siteTitle', value: seo.value.siteTitle, category: 'site' },
      { key: 'seoTitle', value: seo.value.seoTitle, category: 'seo' },
      { key: 'seoDescription', value: seo.value.seoDescription, category: 'seo' },
      { key: 'seoKeywords', value: seo.value.seoKeywords, category: 'seo' },
      { key: 'baiduVerification', value: seo.value.baiduVerification, category: 'seo' },
      { key: 'googleVerification', value: seo.value.googleVerification, category: 'seo' },
    ]

    await api.put('/api/settings', items)
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存失败'
    alert(message)
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-magnifying-glass w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">SEO 设置</h1>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saveSuccess" class="text-sm text-green-600 flex items-center gap-1">
          <span class="i-heroicons-check-circle w-4 h-4" />
          保存成功
        </span>
        <button
          class="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          :disabled="saving"
          :class="{ 'opacity-50 cursor-not-allowed': saving }"
          @click="handleSave"
        >
          <span v-if="saving" class="i-heroicons-arrow-path w-4 h-4 animate-spin" />
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-48 bg-surface-2 rounded-xl animate-pulse" />
      <div class="h-64 bg-surface rounded animate-pulse" />
    </div>

    <!-- Settings -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main settings -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic SEO -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-document-magnifying-glass w-5 h-5 text-primary" />
            基础信息
          </h2>
          <p class="text-sm text-muted mb-4">设置搜索引擎可见性的基本信息</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">站点标题</label>
              <input
                v-model="seo.siteTitle"
                type="text"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                placeholder="我的博客"
              >
              <p class="text-xs text-muted mt-1">显示在浏览器标签和搜索结果中的名称</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-text mb-1.5">SEO 标题</label>
              <input
                v-model="seo.seoTitle"
                type="text"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                placeholder="留空则使用站点标题"
              >
              <p class="text-xs text-muted mt-1">自定义搜索结果中显示的标题，留空使用站点标题</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-text mb-1.5">SEO 描述</label>
              <textarea
                v-model="seo.seoDescription"
                rows="3"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                placeholder="博客的简短描述，用于搜索结果摘要"
              />
              <p class="text-xs text-muted mt-1">建议 150-200 字符，搜索引擎会截取前 160 字符</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-text mb-1.5">SEO 关键词</label>
              <input
                v-model="seo.seoKeywords"
                type="text"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                placeholder="博客, 文章, 技术, 分享"
              >
              <p class="text-xs text-muted mt-1">用逗号分隔关键词，例如：博客, 技术, 前端, Vue</p>
            </div>
          </div>
        </div>

        <!-- Open Graph Meta -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Open Graph 社交分享</h2>
          <p class="text-sm text-muted mb-4">控制微信/Facebook/Twitter 等社交平台分享时的展示效果</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">OG 图片 URL</label>
              <input v-model="ogMeta.ogImage" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="默认分享图片 URL">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">Twitter Card</label>
              <select v-model="ogMeta.twitterCard" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Search Engine Verification -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-check-badge w-5 h-5 text-primary" />
            搜索引擎验证
          </h2>
          <p class="text-sm text-muted mb-4">用于验证站点所有权，提升搜索排名</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">百度验证</label>
              <input
                v-model="seo.baiduVerification"
                type="text"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                placeholder="百度站长平台验证代码"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">Google 验证</label>
              <input
                v-model="seo.googleVerification"
                type="text"
                class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                placeholder="Google Search Console 验证代码"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">Bing 验证</label>
              <input v-model="seoBing" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="Bing Webmaster 验证代码">
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar - Tips -->
      <div class="space-y-6">
        <!-- SEO Tips -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-light-bulb w-5 h-5 text-primary" />
            SEO 小贴士
          </h2>
          <div class="space-y-3 text-sm text-muted">
            <div class="flex items-start gap-2">
              <span class="i-heroicons-check-circle w-4 h-4 text-green-500 mt-0.5" />
              <p>标题包含核心关键词，控制在 60 字符内</p>
            </div>
            <div class="flex items-start gap-2">
              <span class="i-heroicons-check-circle w-4 h-4 text-green-500 mt-0.5" />
              <p>描述简洁有吸引力，包含关键词和行动号召</p>
            </div>
            <div class="flex items-start gap-2">
              <span class="i-heroicons-check-circle w-4 h-4 text-green-500 mt-0.5" />
              <p>关键词选择与内容相关的核心词汇</p>
            </div>
            <div class="flex items-start gap-2">
              <span class="i-heroicons-check-circle w-4 h-4 text-green-500 mt-0.5" />
              <p>提交网站地图给搜索引擎加速收录</p>
            </div>
          </div>
        </div>

        <!-- Sitemap -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-map w-5 h-5 text-primary" />
            网站地图
          </h2>
          <p class="text-xs text-muted mb-4">站点地图帮助搜索引擎更好地收录</p>
          <div class="space-y-2">
            <NuxtLink
              to="/sitemap.xml"
              target="_blank"
              class="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg text-sm text-text hover:text-primary transition-colors"
            >
              <span class="i-heroicons-document-text w-4 h-4" />
              XML 站点地图
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>