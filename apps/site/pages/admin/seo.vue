<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('seo')
const { toRecord, objectToKeyValueText, keyValueTextToObject } = useAdminFormHelpers()

type VerificationItem = {
  name: string
  content: string
}

const form = reactive({
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  baiduVerification: '',
  googleVerification: '',
  bingVerification: '',

  openGraphEnabled: true,
  openGraphImage: '',
  openGraphTwitterCard: 'summary_large_image',
  cssPrefix: false,

  googleAdsenseEnable: false,
  googleAdsenseJs: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  googleAdsenseClient: '',

  cloudflareAnalyticsId: '',
  microsoftClarityId: '',

  baiduPushEnable: false,
  baiduPushToken: '',
  baiduPushPath: '',

  cnzzEnable: false,
  cnzzId: '',
  cnzzWebId: '',
  cnzzScript: '',

  structuredDataEnable: false,
  structuredDataType: 'WebSite',
  structuredDataPublisher: '',
  structuredDataLogo: '',
  structuredDataImage: '',
  structuredDataUrl: '',
  structuredDataExtraText: '',
})

const siteVerificationItems = ref<VerificationItem[]>([])
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function addVerificationItem() {
  siteVerificationItems.value.push({ name: '', content: '' })
}

function removeVerificationItem(index: number) {
  siteVerificationItems.value.splice(index, 1)
}

function hydrateForm() {
  const openGraphMeta = toRecord(settings.value.openGraphMeta)
  const googleAdsense = toRecord(settings.value.googleAdsense)
  const cloudflareAnalytics = toRecord(settings.value.cloudflareAnalytics)
  const microsoftClarity = toRecord(settings.value.microsoftClarity)
  const baiduPush = toRecord(settings.value.baiduPush)
  const cnzzAnalytics = toRecord(settings.value.cnzzAnalytics)
  const structuredData = toRecord(settings.value.structuredData)

  form.seoTitle = String(settings.value.seoTitle ?? '')
  form.seoDescription = String(settings.value.seoDescription ?? '')
  form.seoKeywords = String(settings.value.seoKeywords ?? '')
  form.baiduVerification = String(settings.value.baiduVerification ?? '')
  form.googleVerification = String(settings.value.googleVerification ?? '')
  form.bingVerification = String(settings.value.bingVerification ?? '')

  form.openGraphEnabled = settings.value.Open_Graph_meta !== false
  form.openGraphImage = String(openGraphMeta.ogImage ?? '')
  form.openGraphTwitterCard = String(openGraphMeta.twitterCard ?? 'summary_large_image')
  form.cssPrefix = Boolean(settings.value.css_prefix)

  form.googleAdsenseEnable = googleAdsense.enable !== undefined ? Boolean(googleAdsense.enable) : false
  form.googleAdsenseJs = String(googleAdsense.js ?? 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')
  form.googleAdsenseClient = String(googleAdsense.client ?? '')

  form.cloudflareAnalyticsId = String(cloudflareAnalytics.id ?? '')
  form.microsoftClarityId = String(microsoftClarity.id ?? '')

  form.baiduPushEnable = baiduPush.enable !== undefined ? Boolean(baiduPush.enable) : false
  form.baiduPushToken = String(baiduPush.token ?? '')
  form.baiduPushPath = String(baiduPush.path ?? '')

  form.cnzzEnable = cnzzAnalytics.enable !== undefined ? Boolean(cnzzAnalytics.enable) : false
  form.cnzzId = String(cnzzAnalytics.id ?? '')
  form.cnzzWebId = String(cnzzAnalytics.webId ?? cnzzAnalytics.web_id ?? '')
  form.cnzzScript = String(cnzzAnalytics.script ?? '')

  form.structuredDataEnable = structuredData.enable !== undefined ? Boolean(structuredData.enable) : false
  form.structuredDataType = String(structuredData.type ?? 'WebSite')
  form.structuredDataPublisher = String(structuredData.publisher ?? '')
  form.structuredDataLogo = String(structuredData.logo ?? '')
  form.structuredDataImage = String(structuredData.image ?? '')
  form.structuredDataUrl = String(structuredData.url ?? '')

  const extra = { ...structuredData }
  delete extra.enable
  delete extra.type
  delete extra.publisher
  delete extra.logo
  delete extra.image
  delete extra.url
  form.structuredDataExtraText = objectToKeyValueText(extra)

  siteVerificationItems.value = Array.isArray(settings.value.siteVerification)
    ? settings.value.siteVerification.map((item) => {
        const record = toRecord(item)
        return {
          name: String(record.name ?? ''),
          content: String(record.content ?? ''),
        }
      })
    : [
        settings.value.googleVerification ? { name: 'google-site-verification', content: String(settings.value.googleVerification) } : null,
        settings.value.baiduVerification ? { name: 'baidu-site-verification', content: String(settings.value.baiduVerification) } : null,
        settings.value.bingVerification ? { name: 'msvalidate.01', content: String(settings.value.bingVerification) } : null,
      ].filter(Boolean) as VerificationItem[]

  if (!siteVerificationItems.value.length) {
    addVerificationItem()
  }
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
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: form.seoKeywords.trim(),
      baiduVerification: form.baiduVerification.trim(),
      googleVerification: form.googleVerification.trim(),
      bingVerification: form.bingVerification.trim(),
      Open_Graph_meta: form.openGraphEnabled,
      openGraphMeta: {
        ogImage: form.openGraphImage.trim(),
        twitterCard: form.openGraphTwitterCard.trim() || 'summary_large_image',
      },
      siteVerification: siteVerificationItems.value
        .map(item => ({
          name: item.name.trim(),
          content: item.content.trim(),
        }))
        .filter(item => item.name && item.content),
      css_prefix: form.cssPrefix,
      googleAdsense: {
        enable: form.googleAdsenseEnable,
        js: form.googleAdsenseJs.trim() || 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        client: form.googleAdsenseClient.trim(),
      },
      cloudflareAnalytics: {
        id: form.cloudflareAnalyticsId.trim(),
      },
      microsoftClarity: {
        id: form.microsoftClarityId.trim(),
      },
      baiduPush: {
        enable: form.baiduPushEnable,
        token: form.baiduPushToken.trim(),
        path: form.baiduPushPath.trim(),
      },
      cnzzAnalytics: {
        enable: form.cnzzEnable,
        id: form.cnzzId.trim(),
        webId: form.cnzzWebId.trim(),
        script: form.cnzzScript.trim(),
      },
      structuredData: {
        enable: form.structuredDataEnable,
        type: form.structuredDataType.trim(),
        publisher: form.structuredDataPublisher.trim(),
        logo: form.structuredDataLogo.trim(),
        image: form.structuredDataImage.trim(),
        url: form.structuredDataUrl.trim(),
        ...keyValueTextToObject(form.structuredDataExtraText),
      },
    })

    message.value = 'SEO 配置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">SEO</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">SEO 配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里集中管理标题描述、验证 Meta、Open Graph、广告脚本和结构化数据，保存后前台头部标签与脚本会同步更新。
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
        <h2 class="text-xl font-black text-text">基础 SEO</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">SEO 标题</span>
            <input v-model="form.seoTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">SEO 描述</span>
            <textarea v-model="form.seoDescription" rows="4" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">SEO 关键词</span>
            <input v-model="form.seoKeywords" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="逗号分隔" >
          </label>
          <div class="grid gap-4 md:grid-cols-3">
            <input v-model="form.baiduVerification" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="百度验证" >
            <input v-model="form.googleVerification" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Google 验证" >
            <input v-model="form.bingVerification" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Bing 验证" >
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Open Graph</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.openGraphEnabled = !form.openGraphEnabled">
              <span class="text-sm text-text">启用 Open Graph</span>
              <span class="text-sm text-muted">{{ form.openGraphEnabled ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.cssPrefix = !form.cssPrefix">
              <span class="text-sm text-text">启用 CSS Prefix</span>
              <span class="text-sm text-muted">{{ form.cssPrefix ? '已开启' : '已关闭' }}</span>
            </button>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">OG 图片</span>
            <input v-model="form.openGraphImage" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">Twitter Card</span>
            <input v-model="form.openGraphTwitterCard" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">自定义站点验证</h2>
          <p class="mt-2 text-sm text-muted">这里会直接输出到前台 `<meta name="..." content="...">` 中。</p>
        </div>
        <button type="button" class="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" @click="addVerificationItem">
          新增验证项
        </button>
      </div>
      <div class="mt-5 space-y-4">
        <article v-for="(item, index) in siteVerificationItems" :key="`verification-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-semibold text-text">验证项 {{ index + 1 }}</p>
            <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeVerificationItem(index)">
              删除
            </button>
          </div>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <input v-model="item.name" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="meta name" >
            <input v-model="item.content" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="meta content" >
          </div>
        </article>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">广告与统计脚本</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.googleAdsenseEnable = !form.googleAdsenseEnable">
            <span class="text-sm text-text">启用 Google Adsense</span>
            <span class="text-sm text-muted">{{ form.googleAdsenseEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <input v-model="form.googleAdsenseJs" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Adsense JS 地址" >
          <input v-model="form.googleAdsenseClient" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Adsense Client" >
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.cloudflareAnalyticsId" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Cloudflare Analytics ID" >
            <input v-model="form.microsoftClarityId" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Microsoft Clarity ID" >
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">百度推送与 CNZZ</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.baiduPushEnable = !form.baiduPushEnable">
            <span class="text-sm text-text">启用百度推送</span>
            <span class="text-sm text-muted">{{ form.baiduPushEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.baiduPushToken" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="推送 token" >
            <input v-model="form.baiduPushPath" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="推送路径" >
          </div>
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.cnzzEnable = !form.cnzzEnable">
            <span class="text-sm text-text">启用 CNZZ</span>
            <span class="text-sm text-muted">{{ form.cnzzEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.cnzzId" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="CNZZ ID" >
            <input v-model="form.cnzzWebId" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Web ID" >
          </div>
          <input v-model="form.cnzzScript" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="脚本地址或片段标识" >
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">结构化数据</h2>
      <div class="mt-5 space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.structuredDataEnable = !form.structuredDataEnable">
            <span class="text-sm text-text">启用结构化数据</span>
            <span class="text-sm text-muted">{{ form.structuredDataEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <input v-model="form.structuredDataType" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="类型，例如 WebSite / Blog" >
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <input v-model="form.structuredDataPublisher" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="发布者" >
          <input v-model="form.structuredDataUrl" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="站点地址" >
          <input v-model="form.structuredDataLogo" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Logo 地址" >
          <input v-model="form.structuredDataImage" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="封面图地址" >
        </div>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-text">附加字段</span>
          <textarea v-model="form.structuredDataExtraText" rows="5" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行 key=value" />
        </label>
      </div>
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
        {{ saving ? '保存中...' : '保存 SEO 配置' }}
      </button>
    </div>
  </div>
</template>
