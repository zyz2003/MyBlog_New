<script setup lang="ts">
const api = useAdminApi()
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)

const comments = ref({
  use: '' as string,       // '' | 'Twikoo' | 'Waline' | 'Valine' | 'Artalk' | 'Giscus'
  text: true,
  lazyload: false,
  count: false,
  cardPostCount: false,
})

const twikoo = ref({
  envId: '',
  region: '',
  visitor: false,
})

const waline = ref({
  serverURL: '',
  pageview: false,
  imageUploader: true,
})

const valine = ref({
  appId: '',
  appKey: '',
  pageSize: 10,
  avatar: 'mp',
  placeholder: '填写QQ邮箱就会使用QQ头像喔~',
  enableQQ: true,
  requiredFields: 'nick,mail',
})

const artalk = ref({
  server: '',
  site: '',
  visitor: false,
})

const giscus = ref({
  repo: '',
  repoId: '',
  categoryId: '',
  themeLight: 'light',
  themeDark: 'dark',
  lang: 'zh-CN',
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await api.get<Record<string, Array<{ key: string; value: unknown }>>>('/api/settings')
    const s: Record<string, unknown> = {}
    for (const rows of Object.values(data)) {
      for (const row of rows) { s[row.key] = row.value }
    }
    if (s.comments) comments.value = { ...comments.value, ...(s.comments as typeof comments.value) }
    if (s.twikoo) twikoo.value = { ...twikoo.value, ...(s.twikoo as typeof twikoo.value) }
    if (s.waline) waline.value = { ...waline.value, ...(s.waline as typeof waline.value) }
    if (s.valine) valine.value = { ...valine.value, ...(s.valine as typeof valine.value) }
    if (s.artalk) artalk.value = { ...artalk.value, ...(s.artalk as typeof artalk.value) }
    if (s.giscus) giscus.value = { ...giscus.value, ...(s.giscus as typeof giscus.value) }
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
      { key: 'comments', value: comments.value, category: 'comments' },
      { key: 'twikoo', value: twikoo.value, category: 'comments' },
      { key: 'waline', value: waline.value, category: 'comments' },
      { key: 'valine', value: valine.value, category: 'comments' },
      { key: 'artalk', value: artalk.value, category: 'comments' },
      { key: 'giscus', value: giscus.value, category: 'comments' },
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
        <span class="i-heroicons-chat-bubble-left-right w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">评论设置</h1>
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
        <!-- Provider & Common -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-cpu-chip w-5 h-5 text-primary" /> 评论提供者
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">选择评论系统</label>
              <select v-model="comments.use" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="">不使用评论</option>
                <option value="Twikoo">Twikoo</option>
                <option value="Waline">Waline</option>
                <option value="Valine">Valine</option>
                <option value="Artalk">Artalk</option>
                <option value="Giscus">Giscus</option>
              </select>
            </div>
            <div class="flex gap-6 flex-wrap">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="comments.text" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示评论名称</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="comments.lazyload" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">懒加载评论</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="comments.count" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">显示评论数</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="comments.cardPostCount" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">首页显示评论数</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Twikoo -->
        <div v-if="comments.use === 'Twikoo'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Twikoo 配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">环境 ID (envId)</label>
              <input v-model="twikoo.envId" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="腾讯云 CloudBase 环境 ID">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">区域 (region)</label>
              <input v-model="twikoo.region" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="ap-shanghai">
            </div>
          </div>
          <label class="flex items-center gap-2 mt-3 cursor-pointer">
            <input v-model="twikoo.visitor" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">启用访问者统计</span>
          </label>
        </div>

        <!-- Waline -->
        <div v-if="comments.use === 'Waline'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Waline 配置</h2>
          <div>
            <label class="block text-sm font-medium text-text mb-1.5">服务端地址 (serverURL)</label>
            <input v-model="waline.serverURL" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="https://your-waline-server.vercel.app">
          </div>
          <div class="flex gap-4 mt-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="waline.pageview" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">页面访问统计</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="waline.imageUploader" type="checkbox" class="w-4 h-4 rounded accent-primary"> <span class="text-sm text-text">图片上传</span>
            </label>
          </div>
        </div>

        <!-- Valine -->
        <div v-if="comments.use === 'Valine'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Valine 配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">App ID</label>
              <input v-model="valine.appId" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">App Key</label>
              <input v-model="valine.appKey" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">每页评论数</label>
              <input v-model.number="valine.pageSize" type="number" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">头像风格</label>
              <select v-model="valine.avatar" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
                <option value="mp">神秘人</option>
                <option value="identicon">几何</option>
                <option value="monsterid">怪物</option>
                <option value="wavatar">随机</option>
                <option value="robohash">机器人</option>
              </select>
            </div>
          </div>
          <div class="mt-3">
            <label class="block text-sm font-medium text-text mb-1.5">评论框提示文字</label>
            <input v-model="valine.placeholder" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
          </div>
        </div>

        <!-- Artalk -->
        <div v-if="comments.use === 'Artalk'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Artalk 配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">服务端地址</label>
              <input v-model="artalk.server" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text" placeholder="https://artalk.example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">站点名</label>
              <input v-model="artalk.site" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>

        <!-- Giscus -->
        <div v-if="comments.use === 'Giscus'" class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4">Giscus 配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">GitHub 仓库 (owner/repo)</label>
              <input v-model="giscus.repo" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">仓库 ID</label>
              <input v-model="giscus.repoId" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">分类 ID</label>
              <input v-model="giscus.categoryId" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">语言</label>
              <input v-model="giscus.lang" type="text" class="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text">
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-information-circle w-5 h-5 text-primary" /> 说明
          </h2>
          <div class="text-sm text-muted space-y-2">
            <p><strong>Twikoo</strong> — 基于腾讯云 CloudBase，免费额度充足</p>
            <p><strong>Waline</strong> — Valine 的进化版，支持后端部署</p>
            <p><strong>Valine</strong> — 轻量无后端评论</p>
            <p><strong>Artalk</strong> — 自托管评论系统</p>
            <p><strong>Giscus</strong> — 基于 GitHub Discussions</p>
          </div>
        </div>
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span class="i-heroicons-eye w-5 h-5 text-primary" /> 效果预览
          </h2>
          <p class="text-xs text-muted mb-4">保存后访问任意文章查看评论区效果</p>
          <NuxtLink to="/articles" target="_blank" class="btn-secondary w-full flex items-center justify-center gap-2">
            <span class="i-heroicons-arrow-top-right-on-square w-4 h-4" /> 查看文章
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

